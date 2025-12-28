from supabase import create_client, Client
from datetime import datetime, timedelta
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.utils import formataddr

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = "alfredsam2006@gmail.com"      # sender
SMTP_PASSWORD = "gemq gtsm ssqj gqjr"

SUPABASE_URL = "https://vyhnpfccrwnokmakayfn.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5aG5wZmNjcndub2ttYWtheWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTkyOTUsImV4cCI6MjA4MTAzNTI5NX0.sivgHUJ1w4bU0dk6DprNVw-Pp9ewtjqz5xrG_oWT2mw"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)



### Fetching of Required Details 

def fetch_data():
    
    users = []

    response = (
        supabase
        .table("profiles")
        .select("email, fullname, qualification")
        .is_("qualification", "not_null")
        .execute()
    )

    response_10 = (
            supabase
            .table("10th_profile_data")
            .select("email","preferred_locations")
            .is_("preferred_locations", "not_null")
            .execute()
        )

    response_12 = (
            supabase
            .table("12th_profile_data")
            .select("email","preferred_locations")
            .is_("preferred_locations", "not_null")
            .execute()
        )

    for i in response.data:
        email = i['email']
        pref_locations_10 = next((item['preferred_locations'] for item in response_10.data if item['email'] == email), None)
        pref_locations_12 = next((item['preferred_locations'] for item in response_12.data if item['email'] == email), None)
        
        preferred_locations = pref_locations_10 if pref_locations_10 is not None else pref_locations_12
        
        user_info = {
            "email": i['email'],
            "fullname": i['fullname'],
            "qualification": i['qualification'],
            "preferred_locations": preferred_locations
        }

        if preferred_locations is None:
            continue
        else:
            users.append(user_info)

    return users



def fetch_exam_timeline(data_list):

    data = []

    for i in data_list:
        response = (
        supabase
        .table("examinations")
        .select("name, exam_date, application_start, application_end")
        .in_("region", i["preferred_locations"])
        .execute()
        )

        data_to_add = {
            "email": i["email"],
            "fullname": i["fullname"],
            "exams": response.data
        }
        if response.data == []:
            continue
        else:
            data.append(data_to_add)

    return data


def fetch_scholarship_timeline(data_list):

    data = []

    for i in data_list:
        response = (
        supabase
        .table("scholarships")
        .select("name, deadline")
        .in_("region", i["preferred_locations"])
        .execute()
        )

        data_to_add = {
            "email": i["email"],
            "fullname": i["fullname"],
            "scholarships": response.data
        }
        if response.data == []:
            continue
        else:
            data.append(data_to_add)

    return data


### Mail content and date filteration happens here

def exam_date_mail(records):
    today = datetime.today().date()
    target_date = today + timedelta(days=3)

    result = []

    for record in records:
        valid_exams = []

        for exam in record.get("exams", []):
            exam_date_str = exam.get("exam_date")
            if not exam_date_str:
                continue

            exam_date = datetime.strptime(exam_date_str, "%Y-%m-%d").date()

            if exam_date == target_date:
                valid_exams.append(exam)

        # include user only if at least one exam matches
        if valid_exams:
            result.append({
                "email": record["email"],
                "fullname": record["fullname"],
                "exams": valid_exams
            })


    subject = """Upcoming Examination Reminder – {exam_name}"""

    content = """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

<p>Dear <strong>{fullname}</strong>,</p>

<p>
This is an important update regarding the upcoming
<strong>{exam_name}</strong>, which is scheduled to be conducted on
<strong>{exam_date}</strong> — just <strong>3 days from now</strong>.
</p>

<p><strong>Application window details:</strong></p>
<ul>
  <li><strong>Opened on:</strong> {application_start_date}</li>
  <li><strong>Closed on:</strong> {application_end_date}</li>
</ul>

<h3>What this means for you</h3>

<p><strong>If you have already registered:</strong><br>
You are now entering the final preparation phase. Focus on structured
revision, reinforce core concepts, and fine-tune your strategy to
maximize exam-day performance.
</p>

<p><strong>If you have not registered:</strong><br>
The application window has closed for this examination. Use this as a
planning checkpoint—track upcoming exams and stay application-ready
for the next cycle.
</p>

<p>
Explore upcoming examinations here:
<a href="http://localhost3000/exam">Viddhyapatha Exams Portal</a>
(Please log in to view personalized details).
</p>

<p>
At <strong>Viddhyapatha</strong>, our objective is to ensure you never miss
critical academic milestones and always stay ahead with clarity and intent.
</p>

<p>
Wishing you focus, confidence, and success.
</p>

<p>
Warm regards,<br>
<strong>Viddhyapatha</strong>
</p>

</body>
</html>

"""



    return result, subject, content

def exam_application_start_mail(records):
    today = datetime.today().date()
    target_date = today + timedelta(days=3)

    result = []

    for record in records:
        valid_exams = []

        for exam in record.get("exams", []):
            start_date_str = exam.get("application_start")
            if not start_date_str:
                continue

            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()

            if start_date == target_date:
                valid_exams.append(exam)

        if valid_exams:
            result.append({
                "email": record["email"],
                "fullname": record["fullname"],
                "exams": valid_exams
            })

    subject = """Applications Now Open – {exam_name}"""

    content = """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

<p>Dear <strong>{fullname}</strong>,</p>

<p>
We’re writing to inform you that the
<strong>application window for {exam_name} is officially opening now</strong>.
</p>

<p><strong>Key Dates to Note</strong></p>
<ul>
  <li><strong>Application Opens:</strong> {application_start_date}</li>
  <li><strong>Application Closes:</strong> {application_end_date}</li>
  <li><strong>Examination Date:</strong> {exam_date}</li>
</ul>

<p><strong>What you should do next</strong></p>

<p>
<strong>If you are planning to apply:</strong><br>
This is the right time to begin your application process. Applying early
helps avoid last-minute issues and gives you ample time to prepare with confidence.
</p>

<p>
<strong>If you are still exploring options:</strong><br>
Take this opportunity to review the exam structure, eligibility criteria,
and long-term opportunities associated with this examination before making
your decision.
</p>

<p>
You can explore and track this examination, along with other upcoming opportunities, at:
<br>
<a href="http://localhost3000/exam">Viddhyapatha Exams Portal</a><br>
Please log in to your account to view detailed insights and personalized recommendations.
</p>

<p>
At <strong>Viddhyapatha</strong>, we focus on delivering timely information—so you can
plan smarter and move forward with clarity and confidence.
</p>

<p>
Wishing you a focused and well-planned academic journey.
</p>

<p>
Warm regards,<br>
<strong>Viddhyapatha</strong>
</p>

</body>
</html>
"""






    return result, subject, content

def exam_application_end_mail(records):
    today = datetime.today().date()
    target_date = today + timedelta(days=3)

    result = []

    for record in records:
        valid_exams = []

        for exam in record.get("exams", []):
            end_date_str = exam.get("application_end")
            if not end_date_str:
                continue

            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            if end_date == target_date:
                valid_exams.append(exam)

        if valid_exams:
            result.append({
                "email": record["email"],
                "fullname": record["fullname"],
                "exams": valid_exams
            })



    subject = """Final Day to Apply – {exam_name}"""

    content = """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

<p>Dear <strong>{fullname}</strong>,</p>

<p>
This is a <strong>final reminder</strong> that <strong>three days from now</strong>
marks the <strong>last day to apply for {exam_name}</strong>.
</p>

<p><strong>Important Timeline</strong></p>
<ul>
  <li><strong>Application Closing on:</strong> {application_end_date}</li>
  <li><strong>Examination Date:</strong> {exam_date}</li>
</ul>

<p><strong>Action required</strong></p>

<p>
<strong>If you intend to appear for this exam:</strong><br>
Please ensure your application is completed and submitted before the deadline
to avoid missing this opportunity.
</p>

<p>
<strong>If you are unable to apply this time:</strong><br>
Use this as a planning checkpoint. Similar examinations and future application
cycles are regularly updated on our platform, helping you stay prepared for
what comes next.
</p>

<p>
Stay updated on upcoming examinations at:<br>
<a href="http://localhost3000/exam">Viddhyapatha Exams Portal</a><br>
Log in to explore timelines and plan ahead effectively.
</p>

<p>
At <strong>Viddhyapatha</strong>, our goal is to ensure deadlines never become
roadblocks—only stepping stones toward better preparation.
</p>

<p>
Wishing you clarity and confidence in your next steps.
</p>

<p>
Warm regards,<br>
<strong>Viddhyapatha</strong>
</p>

</body>
</html>
"""


    return result, subject, content

def scholarship_deadline_mail(records):
    today = datetime.today().date()
    target_date = today + timedelta(days=3)

    result = []

    for record in records:
        valid_scholarships = []

        for scholarship in record.get("scholarships", []):
            deadline_str = scholarship.get("deadline")
            if not deadline_str:
                continue

            deadline_date = datetime.strptime(deadline_str, "%Y-%m-%d").date()

            if deadline_date == target_date:
                valid_scholarships.append(scholarship)

        # include user only if at least one scholarship matches
        if valid_scholarships:
            result.append({
                "email": record["email"],
                "fullname": record["fullname"],
                "scholarships": valid_scholarships
            })


    subject = """Scholarship Deadline Approaching – {scholarship_name}"""

    content = """
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">

<p>Dear <strong>{fullname}</strong>,</p>

<p>
This is an important reminder regarding the
<strong>{scholarship_name}</strong>, whose application deadline is approaching soon.
</p>

<p><strong>Scholarship Details</strong></p>
<ul>
  <li><strong>Scholarship Deadline:</strong> {deadline_date}</li>
</ul>

<p><strong>What this means for you</strong></p>

<p>
<strong>If you plan to apply:</strong><br>
Please ensure all required details and supporting documents are reviewed and
submitted before the deadline to maximize your chances of success.
</p>

<p>
<strong>If you’re exploring funding opportunities:</strong><br>
Scholarships typically follow recurring cycles. Missing one deadline can be used
as a strategic opportunity to prepare early and strengthen your application for
the next cycle.
</p>

<p>
Discover active and upcoming scholarships tailored to your profile at:<br>
<a href="http://localhost3000/exam">Viddhyapatha Scholarships Portal</a><br>
Please log in to access detailed information and personalized recommendations.
</p>

<p>
At <strong>Viddhyapatha</strong>, we believe financial awareness is as important as
academic readiness—both play a critical role in shaping long-term success.
</p>

<p>
Wishing you informed decisions and meaningful progress.
</p>

<p>
Warm regards,<br>
<strong>Viddhyapatha</strong>
</p>

</body>
</html>
"""





    return result, subject, content








### Setting of all together, what to send and from here we start to send

def send_exam_date_mail(data,subject,content):

    if len(data) == 0:
        print("No emails to send")
        return

    for record in data:
        for i in record["exams"]:

            formatted_subject = subject.format(exam_name = i["name"])

            formatted_content = content.format(
                fullname = record["fullname"], 
                exam_name = i["name"], 
                exam_date = i["exam_date"], 
                application_start_date = i["application_start"], 
                application_end_date = i["application_end"]
                )

            send_mail(
                record["email"],
                formatted_subject,
                formatted_content
            )
            

def send_exam_application_start_mail(data,subject,content):

    if len(data) == 0:
        print("No emails to send")
        return

    for record in data:
        print(record)
        for i in record["exams"]:

            formatted_subject = subject.format(exam_name = i["name"])

            formatted_content = content.format(
                fullname = record["fullname"], 
                exam_name = i["name"], 
                exam_date = i["exam_date"], 
                application_start_date = i["application_start"], 
                application_end_date = i["application_end"]
                )
            
            send_mail(
                record["email"],
                formatted_subject,
                formatted_content
            )
            
        

def send_exam_application_end_mail(data,subject,content):

    if len(data) == 0:
        print("No emails to send")
        return

    for record in data:
        for i in record["exams"]:

            formatted_subject = subject.format(exam_name = i["name"])

            formatted_content = content.format(
                fullname = record["fullname"], 
                exam_name = i["name"], 
                exam_date = i["exam_date"], 
                application_end_date = i["application_end"]
                )
            
            send_mail(
                record["email"],
                formatted_subject,
                formatted_content
            )


def send_scholarship_deadline_mail(data,subject,content):

    if len(data) == 0:
        print("No emails to send")
        return

    for record in data:
        for i in record["scholarships"]:

            formatted_subject = subject.format(scholarship_name = i["name"])

            formatted_content = content.format(
                fullname = record["fullname"], 
                scholarship_name = i["name"], 
                deadline_date = i["deadline"]
                )
            
            send_mail(
                record["email"],
                formatted_subject,
                formatted_content
            )

            






### Email send logic

def send_mail(to_email, subject, content):
    try:
        # Create message
        msg = MIMEMultipart("alternative")
        msg["From"] = formataddr(("Vidhyapatha", SMTP_EMAIL))
        msg["To"] = to_email
        msg["Subject"] = subject

        # Email body (HTML supported)
        msg.attach(MIMEText(content, "html"))

        # SMTP connection
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)

        # Send email
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        server.quit()

        print(f"✅ Mail sent to {to_email}")

    except Exception as e:
        print(f"❌ Failed to send mail to {to_email}: {e}")



if __name__ == "__main__":
    data_list = fetch_data()
    exams = fetch_exam_timeline(data_list)
    scholarships = fetch_scholarship_timeline(data_list)

    print("Sending mails regarding exam dates......")
    valid_exam_date, subject, content = exam_date_mail(exams)
    send_exam_date_mail(valid_exam_date,subject,content)


    print("sending mails regarding exam application start dates......")
    valid_exam_application_start, subject, content = exam_application_start_mail(exams)
    send_exam_application_start_mail(data = valid_exam_application_start, subject = subject, content = content)


    print("Sending mails regarding exam application end dates......")
    valid_exam_application_end, subject, content = exam_application_end_mail(exams)
    send_exam_application_end_mail(data = valid_exam_application_end, subject = subject, content = content)


    print("Sending mails regarding scholarship deadlines......")
    valid_scholarship_deadline, subject, content = scholarship_deadline_mail(scholarships)
    send_scholarship_deadline_mail(data = valid_scholarship_deadline, subject = subject, content = content)
    



