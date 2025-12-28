api = "mongodb+srv://230701027_db_user:3pYFv2ivpiCLG0CH@jammuandkashmir.pegyann.mongodb.net/?retryWrites=true&w=majority&appName=jammuandkashmir"


# connecting with db

import asyncio
from profile import Profile
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi import FastAPI, HTTPException
from typing import List,Dict, Any
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from fastapi import Path
import httpx    
import requests
from geopy.distance import geodesic
from operator import itemgetter


app = FastAPI(title="User Scholarship API")
client = AsyncIOMotorClient(api)
print("connected")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLA_API_KEY = "hMk2c4sDu2hiBPpEf3GCvE07YYQ9Vu5CfPtbgx6j"
OLA_GEOCODE_URL = "https://api.olamaps.io/places/v1/geocode"




# Helper function to geocode an address using the Ola Maps API
async def get_coordinates_from_address(address: str):
    """
    Geocodes an address using the Ola Maps API and returns coordinates.
    """
    params = {
        "address": address,
        "api_key": OLA_API_KEY,
        "language": "en"
    }
    headers = {
    "X-Request-Id": "XXX"  # Replace XXX with your actual request ID
    }
    
    try:
        response = requests.get(OLA_GEOCODE_URL, params=params, headers=headers)
        response.raise_for_status()  # Raise an HTTPError for bad responses
        data = response.json()
        
        # Check if the API returned any results and get the coordinates
        result = data.get("geocodingResults", [])
        address = result[0]["formatted_address"]
        lat = result[0]["geometry"]["location"]["lat"]
        lng = result[0]["geometry"]["location"]["lng"]
        return (lat, lng)
    except requests.exceptions.RequestException as e:
        print(f"Ola Maps API request failed: {e}")
        return None

# Helper function to convert MongoDB ObjectId to string
def convert_objectid(doc):
    """Converts the MongoDB ObjectId in a document to a string."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


# databases
user = client.user  
admin = client.admin

# collections
scholarship_collection = user.scholarship  
user_account = user.account
user_profile = user.userProfile
colleges = user.collegeDetails
course = user.course
question = user.Question
career = user.careerPaths
degrees = user.degrees
roadmap = user.roadmap
examination = user.Examination
timeline = user.timeline
resource = user.resource
skills = user.Skills
subjects = user.subjects

# Request model
class SignupRequest(BaseModel):
    email: EmailStr
    password: str

class SigninRequest(BaseModel):
    email: EmailStr
    password: str

class FinalRecommendation(BaseModel):
    recommendation:List [str]
    times: List[float]
    total: str   # if you want it numeric, change to float


class UserProfile(BaseModel):
    _id: str
    firstName: str
    dob: str
    email: str
    phone: str
    address: str
    qualification: str
    aadhar: str
    motherTongue: str
    caste: str
    income: str  # keep as str if DB stores it as string
    interest: list[str] | None = None  # optional
    gender:str


class ProfileForm(BaseModel):
    firstName: str
    dob: str
    email: str
    phone: str
    address: str
    qualification: str
    aadhar: str
    motherTongue: str
    caste: str
    income: str
    gender: str

class Profile10thForm(BaseModel):
    medium: str
    compulsoryLanguage: str
    selectedSubjects: list[str]
    marks: dict
    interest: str
    ambition: str

class Profile12thForm(BaseModel):
    medium: str
    compulsoryLanguage: str
    stream: str
    selectedSubjects: List[str]
    marks: Dict[str, int]
    my_interest: List[str]
    ambition: str
    jeerank: int
    neetrank: int

class Results(BaseModel):
    sortedScores: List[float]
    topDomains: List[str]
    fastAnswers: int
    controlRel: float
    speedRel: float
    reliability: float


from bson import ObjectId

def convert_objectid(doc):
    for key, value in doc.items():
        if isinstance(value, ObjectId):
            doc[key] = str(value)
        elif isinstance(value, list):
            doc[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
        elif isinstance(value, dict):
            doc[key] = convert_objectid(value)
    return doc

def convert_ids(doc):
    """Recursively convert ObjectIds in a dict/list to strings."""
    if isinstance(doc, dict):
        return {k: convert_ids(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [convert_ids(i) for i in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    else:
        return doc
    

@app.post("/submit/12/{user_id}")
async def submit_final_recommendation(user_id: str, data: FinalRecommendation):
    times = data.times
    total_questions = len(times)
    
    # Count questions taking more than 3 seconds
    count_gt_3 = sum(1 for t in times if t > 3)
    
    # Calculate the percentage as per your formula
    percentage = 1 - (count_gt_3 / total_questions)  # fraction ≤ 3 seconds
    percentage *= 100  # convert to %
    
    if percentage > 45:
        print("📥 Received Final Recommendation:", data.dict())

        # Store recommendation in user_profile
        try:
            object_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid ObjectId format")

        result = await user_profile.update_one(
            {"_id": object_id},
            {"$set": {"interest": data.recommendation}},
            upsert=True
        )

        status = "updated" if result.matched_count > 0 else "inserted" if result.upserted_id else "no change"

        return {
            "status": "success",
            "message": "Recommendation accepted",
            "db_status": status,
            "stored_recommendation": data.dict()
        }
    else:
        return {"status": "fail", "message": "Please retake the test"}



# Endpoint to get all scholarship documents
@app.get("/scholarships", response_model=List[dict])
async def get_all_scholarships():
    scholarships = []
    cursor = scholarship_collection.find({})
    async for document in cursor:
        document = convert_objectid(document)   # convert ObjectId to str
        scholarships.append(document)
    if not scholarships:
        raise HTTPException(status_code=404, detail="No scholarships found")
    return scholarships

@app.get("/eligible-colleges/{user_id}")
async def get_colleges_by_location(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    # Fetch user profile
    user_doc = await user_profile.find_one({"_id": object_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
        
    user_caste = user_doc.get("caste")
    user_jee_rank = user_doc.get("jeerank")
    user_neet_score = user_doc.get("neetrank")
    user_board_cutoff = user_doc.get("cutoff")
    user_gender= user_doc.get("gender")

    # Convert user's board cutoff to a number if it's a string
    if isinstance(user_board_cutoff, str):
        try:
            user_board_cutoff = float(user_board_cutoff)
        except (ValueError, TypeError):
            user_board_cutoff = None
    
    if not any([user_jee_rank, user_neet_score, user_board_cutoff]):
        raise HTTPException(status_code=400, detail="User profile is missing eligibility criteria (JEE/NEET/Board marks).")

    eligible_colleges = []
    college_cursor = colleges.find({})
    
    async for college_doc in college_cursor:
        is_eligible = False
        clg_gender= college_doc.get("gender")

        college_cutoff = college_doc.get("cutoff", {})
        college_stream = college_doc.get("stream", [])
        
        # Determine the admission mode for the college based on its type
        is_iit_nit_iiit = any(keyword in college_doc.get("name", "") for keyword in ["NIT", "IIT", "IIIT"])
        is_medical_college = any(keyword in college_doc.get("type", "") for keyword in ["Medical College", "AIIMS"])

        # Attempt to check eligibility by specific exam first
        if is_iit_nit_iiit and user_jee_rank:
            jee_cutoff_rank = college_cutoff.get("jee_rank", {}).get(user_caste)
            if jee_cutoff_rank is not None and user_jee_rank <= jee_cutoff_rank:
                is_eligible = True
        elif is_medical_college and user_neet_score:
            neet_cutoff_score = college_cutoff.get("neet_mark", {}).get(user_caste)
            if neet_cutoff_score is not None and user_neet_score >= neet_cutoff_score:
                is_eligible = True
        
        # Fallback to board marks if not eligible by specific exam or if no specific cutoff exists
        if not is_eligible and user_board_cutoff is not None:
            board_cutoff_marks = college_cutoff.get("board_marks", {}).get(user_caste)
            if board_cutoff_marks is not None and user_board_cutoff >= board_cutoff_marks:
                is_eligible = True
        
        if is_eligible:
            if(clg_gender!=user_gender):
                continue
            else:
                eligible_colleges.append(convert_objectid(college_doc))
            
    if not eligible_colleges:
        raise HTTPException(status_code=404, detail="No colleges found that match your eligibility criteria.")
        
    try:
        # 1. Get user location from database
        object_id = ObjectId(user_id)
        user_doc = await user_profile.find_one({"_id": object_id})
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")

        user_address = user_doc.get("address")
        if not user_address:
            raise HTTPException(status_code=400, detail="User address not found")

        # 2. Convert user address to coordinates using Ola Maps API
        user_coords = await get_coordinates_from_address(user_address)
        if not user_coords:
            raise HTTPException(status_code=400, detail="Could not geocode user address with Ola Maps")

        # 3. Get all colleges and calculate distance
        college_list = []
        cursor = eligible_colleges
        print(cursor)
        
        for college in cursor:
            college_doc = convert_objectid(college)
            college_geo = college_doc.get("geo", {})
            
            if college_geo and "lat" in college_geo and "long" in college_geo:
                college_coords = (float(college_geo["lat"]), float(college_geo["long"]))
                distance = geodesic(user_coords, college_coords).kilometers
                
                college_doc["distance_km"] = round(distance, 2)
                college_list.append(college_doc)

        # 4. Sort all colleges by distance
        sorted_colleges = sorted(college_list, key=lambda x: x["distance_km"])

        if not sorted_colleges:
            raise HTTPException(
                status_code=404, 
                detail="No colleges found in the database."
            )

        return sorted_colleges

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def convert_objectid_course(doc):
    doc["_id"] = str(doc["_id"])
    return doc

@app.get("/course/{user_id}")
async def get_all_courses(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    # Fetch user profile
    user_doc = await user_profile.find_one({"_id": object_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # Step 1: Extract user qualification + interests
    user_qualification = user_doc.get("qualification")
    user_interests = user_doc.get("interest", [])

    if not user_qualification:
        raise HTTPException(status_code=400, detail="User qualification missing")

    # Step 2: Fetch courses with matching qualification
    eligible_course = []
    my_course = []

    cursor = course.find({"qualification": user_qualification})
    async for document in cursor:
        document = convert_objectid(document)  # 🔑 Convert ObjectId

        # Add to eligible list (qualification matched)
        eligible_course.append(document)

        # Add to my_course if both qualification & interest matched
        if document.get("course") in user_interests:
            my_course.append(document)

    return {
        "eligible_course": eligible_course,
        "my_course": my_course
    }

    


@app.post("/signup", response_model=Dict[str, str])
async def signup(user: SignupRequest):
    # Check if user already exists
    existing_user = await user_account.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create new user document
    new_user = {
        "email": user.email,
        "password": user.password
    }

    # Insert new user
    result = await user_account.insert_one(new_user)

    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Signup failed")

    return {"message": "User created successfully", "user_id": str(result.inserted_id)}



@app.post("/submit-results/10/{user_id}")
async def submit_results(user_id: str, results: Results):
    try:
        object_id = ObjectId(user_id)   # ✅ convert to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    outcomes = []

    for i in results.topDomains:
        cursor = subjects.find({"name": i})   # this returns an async cursor
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])      # convert ObjectId to str
            outcomes.append(doc[i])

    interest = []
    for i in outcomes:
        for j in i:
            interest.append(j)

    interest = list(set(interest))  # remove duplicates

    result = await user_profile.update_one(
        {"_id": object_id},             # ✅ match with ObjectId
        {"$set": {"interest": interest}},
        upsert=True
    )
    
    if result.matched_count > 0:
        return {"status": "updated", "user_id": user_id}
    elif result.upserted_id:
        return {"status": "inserted", "user_id": str(result.upserted_id)}
    else:
        return {"status": "no change"}
    


@app.post("/signin", response_model=Dict[str, str])
async def signin(credentials: SigninRequest):
    # Look up user by email
    user_doc = await user_account.find_one({"email": credentials.email})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    # Check password
    if user_doc["password"] != credentials.password:
        raise HTTPException(status_code=401, detail="Invalid password")

    # Successful login
    return {"message": "Login successful", "user_id": str(user_doc["_id"])}




@app.get("/profile/{user_id}", response_model=UserProfile)
async def get_profile(user_id: str):
    from bson import ObjectId

    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    user_doc = await user_profile.find_one({"_id": obj_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    user_doc["_id"] = str(user_doc["_id"])
    return user_doc


@app.put("/profile-submit/{user_id}")
async def update_profile(user_id: str, profile: ProfileForm):
    try:
        obj_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    # Update the document in MongoDB
    update_result = await user_profile.update_one(
        {"_id": obj_id},
        {"$set": profile.dict()}
    )

    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Fetch the updated document to return
    updated_user = await user_profile.find_one({"_id": obj_id})
    if updated_user:
        updated_user["_id"] = str(updated_user["_id"])  # Convert ObjectId to string

    return {
        "message": "Profile updated successfully",
        "userId": user_id,
        "data": updated_user
    }



@app.post("/student/{user_id}")
async def save_profile(user_id: str, student: ProfileForm):
    try:
        object_id = ObjectId(user_id)   # ✅ convert to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await user_profile.update_one(
        {"_id": object_id},             # ✅ match with ObjectId
        {"$set": student.dict()},
        upsert=True
    )
    
    if result.matched_count > 0:
        return {"status": "updated", "user_id": user_id}
    elif result.upserted_id:
        return {"status": "inserted", "user_id": str(result.upserted_id)}
    else:
        return {"status": "no change"}

@app.post("/profile-10th/{user_id}")
async def save_profile_10th(user_id: str, student: Profile10thForm):
    try:
        object_id = ObjectId(user_id)   # ✅ convert to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await user_profile.update_one(
        {"_id": object_id},             # ✅ match with ObjectId
        {"$set": student.dict()}
    )
    
    if result.matched_count > 0:
        return {"status": "updated", "user_id": user_id}
    elif result.upserted_id:
        return {"status": "inserted", "user_id": str(result.upserted_id)}
    else:
        return {"status": "no change"}

@app.post("/profile-12th/{user_id}")
async def save_profile_12th(user_id: str, student: Profile12thForm):
    try:
        object_id = ObjectId(user_id)   # ✅ convert to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    result = await user_profile.update_one(
        {"_id": object_id},             # ✅ match with ObjectId
        {"$set": student.dict()}
    )
    
    if result.matched_count > 0:
        return {"status": "updated", "user_id": user_id}
    elif result.upserted_id:
        return {"status": "inserted", "user_id": str(result.upserted_id)}
    else:
        return {"status": "no change"}

@app.get("/questions/{class_value}")
async def get_questions(class_value: int):
    """Fetch all questions for a given class (e.g., class 10)."""
    cursor = question.find({"class": class_value})
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to str 
        results.append(doc)

    if not results:
        raise HTTPException(status_code=404, detail=f"No questions found for class {class_value}")

    return {"question_bank": results}


@app.get("/questions/{class_value}/{study}")
async def get_questions(class_value: int, study:str):
    """Fetch all questions for a given class (e.g., class 10)."""
    cursor = question.find({"class": class_value,"stream":study})
    results = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])  # Convert ObjectId to str
        results.append(doc)

    if not results:
        raise HTTPException(status_code=404, detail=f"No questions found for class {class_value}")

    return {"question_bank": results}

@app.get("/career/{user_id}", response_model=Dict[str, Any])
async def get_career(user_id: str):
    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")
    
    # Fetch user profile to get interests
    user_doc = await user_profile.find_one({"_id": object_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Extract interests, ensuring it's a valid list for a query
    interest = user_doc.get("interest", [])
    mycareers = []
    careers = []
    career_doc = career.find({})
    async for document in career_doc:
        document = convert_objectid(document) 
        for i in document.get("required_courses", []):
            if i in interest:
                mycareers.append(document)
        careers.append(document)

    return {"mycareers": mycareers, "all_careers": careers}

# ... (rest of your backend code) ...

@app.get("/roadmap/{roadmap_id}")
async def get_roadmap(roadmap_id: str):
    try:
        obj_id = ObjectId(roadmap_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid roadmap ID format")

    # Fetch roadmap doc
    doc = await roadmap.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    # Populate skills
    for level in doc.get("skill_levels", []):
        populated_skills = []
        for skill_id in level.get("skills", []):
            try:
                skill_obj_id = ObjectId(skill_id)
                skill_doc = await skills.find_one({"_id": skill_obj_id})
                if skill_doc:
                    populated_skills.append(convert_ids(skill_doc))
            except Exception:
                populated_skills.append({"_id": str(skill_id), "error": "Invalid skill id"})
        level["skills"] = populated_skills

    # Convert all ObjectIds in the roadmap doc
    doc = convert_ids(doc)

    return doc



@app.get("/examination", response_model=List[dict])
async def get_all_scholarships():
    examinations = []
    cursor = examination.find({})
    async for document in cursor:
        document = convert_objectid(document)  
        examinations.append(document)
    if not examinations:
        raise HTTPException(status_code=404, detail="No scholarships found")
    return examinations 

@app.get("/notification", response_model=List[dict])
async def get_all_scholarships():
    timelines = []
    cursor = timeline.find({})
    async for document in cursor:
        document = convert_objectid(document)  
        timelines.append(document)
    if not timelines:
        raise HTTPException(status_code=404, detail="No scholarships found")
    return timelines


@app.get("/resources", response_model=List[dict])
async def get_all_scholarships():
    resources = []
    cursor = resource.find({})
    async for document in cursor:
        document = convert_objectid(document)  
        resources.append(document)
    if not resources:
        raise HTTPException(status_code=404, detail="No scholarships found")
    return resources

# Run the server
if __name__== "main":
    import uvicorn
    uvicorn.run("untitle:app", host="0.0.0.0", port=8000, reload=True)