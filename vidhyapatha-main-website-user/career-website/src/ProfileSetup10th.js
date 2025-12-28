// import React, { useState, useEffect } from "react";
// import { supabase } from "./supabase";

// export default function ProfileSetup10th({ onComplete, initialData, email }) {

//   console.log("Initial Data for 10th Profile Setup:", initialData);
//   const emptyForm = {
//     medium: "",
//     compulsoryLanguage: "",
//     selectedSubjects: [],
//     marks: {},
//     interest: "",
//     ambition: "",
//     otherAmbition: "",
//   };

//   const [form, setForm] = useState(emptyForm);

//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         ...emptyForm,
//         medium: initialData.medium || "",
//         compulsoryLanguage: initialData.language || "",
//         marks: initialData.marks || {},
//         interest: initialData.interest || "",
//         ambition: initialData.ambition || "",
//         selectedSubjects: [],
//         otherAmbition: "",
//       });
//     }
//   }, [initialData]);

//   const [compulsorySubjects, setCompulsorySubjects] = useState([]);
//   const [additionalSubjects, setAdditionalSubjects] = useState([]);
//   const [interestSubjects, setInterestSubjects] = useState([]);
//   const [ambitionOptions, setAmbitionOptions] = useState([]);

//   // 3️⃣ Load dropdown data
//   useEffect(() => {
//     setCompulsorySubjects([
//       "General English",
//       "Mathematics",
//       "Social Science",
//       "Economics, Disaster Management and Road Safety Education",
//       "Science",
//     ]);

//     setAdditionalSubjects([
//       "Computer Science",
//       "Sanskrit",
//       "Dogri",
//       "Bhoti",
//       "Punjabi",
//       "Persian",
//       "Kashmiri",
//       "Arabic",
//       "Urdu",
//       "Hindi",
//     ]);

//     setInterestSubjects([
//       "Science",
//       "Mathematics",
//       "SocialScience",
//       "Languages",
//       "ComputerScience",
//       "Arts",
//       "Commerce",
//     ]);

//     setAmbitionOptions([
//       "Doctor",
//       "Engineer",
//       "Teacher",
//       "Scientist",
//       "Lawyer",
//       "Artist",
//       "Entrepreneur",
//       "Others",
//     ]);
//   }, []);

//   // 4️⃣ Load existing DB data (View / Edit)
//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         ...emptyForm,
//         medium: initialData.medium || "",
//         compulsoryLanguage: initialData.language || "",
//         marks: initialData.marks || {},
//         interest: initialData.interest || "",
//         ambition: initialData.ambition || "",
//         selectedSubjects: [],
//         otherAmbition: "",
//       });
//     }
//   }, [initialData]);

//   // 5️⃣ Handlers
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   };

//   const toggleSubject = (subject) => {
//     setForm(prev => ({
//       ...prev,
//       selectedSubjects: prev.selectedSubjects.includes(subject)
//         ? prev.selectedSubjects.filter(s => s !== subject)
//         : [...prev.selectedSubjects, subject],
//     }));
//   };

//   const handleMarksChange = (subject, value) => {
//     setForm(prev => ({
//       ...prev,
//       marks: { ...prev.marks, [subject]: value },
//     }));
//   };

//   // 6️⃣ Submit → UPSERT TO SUPABASE
//   const handleFinish = async (e) => {
//     e.preventDefault();

//     if (!form.medium) return alert("Please select a medium.");
//     if (!form.compulsoryLanguage) return alert("Please select a compulsory language.");

//     const allSubjects = [
//       form.compulsoryLanguage,
//       ...compulsorySubjects,
//       ...form.selectedSubjects,
//     ];

//     for (const subj of allSubjects) {
//       if (!form.marks[subj]) {
//         return alert(`Please enter marks for ${subj}`);
//       }
//     }

//     if (!form.interest) return alert("Please select your interest.");
//     if (!form.ambition) return alert("Please select your ambition.");
//     if (form.ambition === "Others" && !form.otherAmbition) {
//       return alert("Please specify your ambition.");
//     }

//     const finalData = {
//       medium: form.medium,
//       language: form.compulsoryLanguage,
//       marks: form.marks,
//       interest: form.interest,
//       ambition:
//         form.ambition === "Others"
//           ? form.otherAmbition
//           : form.ambition,
//       email,
//     };

//     const { error } = await supabase
//       .from("10th_profile_data")
//       .upsert(finalData, { onConflict: "email" });

//     if (error) {
//       console.error("Supabase error:", error);
//       alert("❌ Failed to save 10th profile");
//       return;
//     }

//     if (onComplete) onComplete();
//     alert("✅ Profile 10th details saved successfully!");
//   };

//   // 7️⃣ UI
//   return (
//     <div className="space-y-10 px-8 py-6 max-w-3xl mx-auto">
//       <h2 className="text-2xl font-bold">Profile Setup – 10th Details</h2>

//       <form onSubmit={handleFinish} className="space-y-6 bg-white shadow-lg rounded-xl p-8">

//         {/* Medium */}
//         <div>
//           <label className="font-semibold">Medium *</label>
//           <select name="medium" value={form.medium} onChange={handleChange} className="w-full border p-2 rounded">
//             <option value="">Select</option>
//             <option>Urdu</option>
//             <option>English</option>
//             <option>Hindi</option>
//             <option>Kashmiri</option>
//             <option>Dogri</option>
//           </select>
//         </div>

//         {/* Compulsory Language */}
//         <div>
//           <label className="font-semibold">Compulsory Language *</label>
//           <select name="compulsoryLanguage" value={form.compulsoryLanguage} onChange={handleChange} className="w-full border p-2 rounded">
//             <option value="">Select</option>
//             <option>Urdu</option>
//             <option>Hindi</option>
//             <option>Kashmiri</option>
//             <option>Dogri</option>
//           </select>
//         </div>

//         {/* Optional Subjects */}
//         <div>
//           <h3 className="font-semibold mb-2">Optional Subjects</h3>
//           <div className="flex flex-wrap gap-2">
//             {additionalSubjects.map(subj => (
//               <button
//                 key={subj}
//                 type="button"
//                 onClick={() => toggleSubject(subj)}
//                 className={`px-4 py-2 rounded-full border ${form.selectedSubjects.includes(subj)
//                   ? "bg-green-600 text-white"
//                   : "bg-white"
//                   }`}
//               >
//                 {subj}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Marks */}
//         <div>
//           <h3 className="font-semibold mb-2">Marks</h3>
//           {[form.compulsoryLanguage, ...compulsorySubjects, ...form.selectedSubjects]
//             .filter(Boolean)
//             .map(subj => (
//               <div key={subj} className="flex gap-2 items-center">
//                 <span className="w-1/2 font-bold">{subj}</span>
//                 <input
//                   type="number"
//                   value={form.marks[subj] || ""}
//                   onChange={(e) => handleMarksChange(subj, e.target.value)}
//                   className="w-1/2 border p-2 rounded"
//                 />
//               </div>
//             ))}
//         </div>

//         {/* Interest */}
//         <div>
//           <label className="font-semibold">Interest *</label>
//           <select name="interest" value={form.interest} onChange={handleChange} className="w-full border p-2 rounded">
//             <option value="">Select</option>
//             {interestSubjects.map(i => <option key={i}>{i}</option>)}
//           </select>
//         </div>

//         {/* Ambition */}
//         <div>
//           <label className="font-semibold">Ambition *</label>
//           <select name="ambition" value={form.ambition} onChange={handleChange} className="w-full border p-2 rounded">
//             <option value="">Select</option>
//             {ambitionOptions.map(a => <option key={a}>{a}</option>)}
//           </select>

//           {form.ambition === "Others" && (
//             <input
//               type="text"
//               name="otherAmbition"
//               value={form.otherAmbition}
//               onChange={handleChange}
//               className="w-full border p-2 rounded mt-2"
//               placeholder="Specify ambition"
//             />
//           )}
//         </div>

//         <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
//           Save & Finish
//         </button>
//       </form>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function ProfileSetup10th({ onComplete, initialData, email }) {

  const emptyForm = {
    medium: "",
    compulsoryLanguage: "",
    selectedSubjects: [],
    marks: {},
    interest: "",
    ambition: "",
    otherAmbition: "",
    preferredLocations: ["", "", "", "", ""], // NEW
  };
 const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal"
];

  const [form, setForm] = useState(emptyForm);

  const [compulsorySubjects, setCompulsorySubjects] = useState([]);
  const [additionalSubjects, setAdditionalSubjects] = useState([]);
  const [interestSubjects, setInterestSubjects] = useState([]);
  const [ambitionOptions, setAmbitionOptions] = useState([]);

  // ---------- Load static dropdown data ----------
  useEffect(() => {
    setCompulsorySubjects([
      "General English",
      "Mathematics",
      "Social Science",
      "Economics, Disaster Management and Road Safety Education",
      "Science",
    ]);

    setAdditionalSubjects([
      "Computer Science",
      "Sanskrit",
      "Dogri",
      "Bhoti",
      "Punjabi",
      "Persian",
      "Kashmiri",
      "Arabic",
      "Urdu",
      "Hindi",
    ]);

    setInterestSubjects([
      "Science",
      "Mathematics",
      "SocialScience",
      "Languages",
      "ComputerScience",
      "Arts",
      "Commerce",
    ]);

    setAmbitionOptions([
      "Doctor",
      "Engineer",
      "Teacher",
      "Scientist",
      "Lawyer",
      "Artist",
      "Entrepreneur",
      "Others",
    ]);
  }, []);

  // ---------- Load DB data (VIEW / EDIT) ----------
  useEffect(() => {
    if (!initialData) return;

    const compulsorySet = new Set([
      initialData.language,
      "General English",
      "Mathematics",
      "Social Science",
      "Economics, Disaster Management and Road Safety Education",
      "Science",
    ]);

    


    const derivedOptionalSubjects = Object.keys(initialData.marks || {}).filter(
      subj => !compulsorySet.has(subj)
    );

    setForm({
      ...emptyForm,
      medium: initialData.medium || "",
      compulsoryLanguage: initialData.language || "",
      marks: initialData.marks || {},
      interest: initialData.interest || "",
      ambition: initialData.ambition || "",
      selectedSubjects: derivedOptionalSubjects,
      otherAmbition: "",
      preferredLocations: initialData.preferred_locations || ["", "", "", "", ""],

    });
  }, [initialData]);

  // ---------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleSubject = (subject) => {
    setForm(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject],
    }));
  };

  const handleMarksChange = (subject, value) => {
    setForm(prev => ({
      ...prev,
      marks: { ...prev.marks, [subject]: value },
    }));
  };

  const handleLocationChange = (index, value) => {
  setForm(prev => {
    const updated = [...prev.preferredLocations];
    updated[index] = value;
    return { ...prev, preferredLocations: updated };
  });
};


  // ---------- Submit ----------
  const handleFinish = async (e) => {
    e.preventDefault();

    if (!form.medium) return alert("Please select a medium.");
    if (!form.compulsoryLanguage) return alert("Please select a compulsory language.");

    const allSubjects = [
      form.compulsoryLanguage,
      ...compulsorySubjects,
      ...form.selectedSubjects,
    ];

    for (const subj of allSubjects) {
      if (!form.marks[subj]) {
        return alert(`Please enter marks for ${subj}`);
      }
    }

    if (!form.interest) return alert("Please select your interest.");
    if (!form.ambition) return alert("Please select your ambition.");
    if (form.ambition === "Others" && !form.otherAmbition) {
      return alert("Please specify your ambition.");
    }

    const filledLocations = form.preferredLocations.filter(loc => loc.trim() !== "");

if (filledLocations.length < 3) {
  return alert("Please select at least 3 preferred locations.");
}


    const payload = {
      medium: form.medium,
      language: form.compulsoryLanguage,
      marks: form.marks,
      interest: form.interest,
      ambition:
        form.ambition === "Others"
          ? form.otherAmbition
          : form.ambition,
      preferred_locations: form.preferredLocations, // NEW
      email,
    };

    const { error } = await supabase
      .from("10th_profile_data")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      console.error(error);
      alert("❌ Failed to save 10th profile");
      return;
    }

    onComplete?.();
    alert("✅ Profile 10th details saved successfully!");
  };

  // ---------- UI (UNCHANGED) ----------
  return (
    <div className="space-y-10 px-8 py-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Profile Setup – 10th Details</h2>

      <form onSubmit={handleFinish} className="space-y-6 bg-white shadow-lg rounded-xl p-8">

        {/* Medium */}
        <div>
          <label className="font-semibold">Medium *</label>
          <select name="medium" value={form.medium} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select</option>
            <option>Urdu</option>
            <option>English</option>
            <option>Hindi</option>
            <option>Kashmiri</option>
            <option>Dogri</option>
          </select>
        </div>

        {/* Compulsory Language */}
        <div>
          <label className="font-semibold">Compulsory Language *</label>
          <select name="compulsoryLanguage" value={form.compulsoryLanguage} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select</option>
            <option>Urdu</option>
            <option>Hindi</option>
            <option>Kashmiri</option>
            <option>Dogri</option>
          </select>
        </div>

        {/* Optional Subjects */}
        <div>
          <h3 className="font-semibold mb-2">Optional Subjects</h3>
          <div className="flex flex-wrap gap-2">
            {additionalSubjects.map(subj => (
              <button
                key={subj}
                type="button"
                onClick={() => toggleSubject(subj)}
                className={`px-4 py-2 rounded-full border ${
                  form.selectedSubjects.includes(subj)
                    ? "bg-green-600 text-white"
                    : "bg-white"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>
        </div>

        {/* Marks */}
        <div>
          <h3 className="font-semibold mb-2">Marks</h3>
          {[form.compulsoryLanguage, ...compulsorySubjects, ...form.selectedSubjects]
            .filter(Boolean)
            .map(subj => (
              <div key={subj} className="flex gap-2 items-center">
                <span className="w-1/2 font-bold">{subj}</span>
                <input
                  type="number"
                  value={form.marks[subj] || ""}
                  onChange={(e) => handleMarksChange(subj, e.target.value)}
                  className="w-1/2 border p-2 rounded"
                />
              </div>
            ))}
        </div>

        {/* Interest */}
        <div>
          <label className="font-semibold">Interest *</label>
          <select name="interest" value={form.interest} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select</option>
            {interestSubjects.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>

        {/* Ambition */}
        <div>
          <label className="font-semibold">Ambition *</label>
          <select name="ambition" value={form.ambition} onChange={handleChange} className="w-full border p-2 rounded">
            <option value="">Select</option>
            {ambitionOptions.map(a => <option key={a}>{a}</option>)}
          </select>

          {form.ambition === "Others" && (
            <input
              type="text"
              name="otherAmbition"
              value={form.otherAmbition}
              onChange={handleChange}
              className="w-full border p-2 rounded mt-2"
              placeholder="Specify ambition"
            />
          )}
        </div>
        {/* Preferred Locations */}
<div>
  <h3 className="font-semibold mb-2">Preferred Locations (Top 5 States)</h3>
  <div className="space-y-3">
    {form.preferredLocations.map((loc, index) => (
      <select
        key={index}
        value={loc}
        onChange={(e) => handleLocationChange(index, e.target.value)}
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Select State {index + 1}</option>
        {indianStates.map((state) => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
    ))}
  </div>
</div>


        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">
          Save & Finish
        </button>
      </form>
    </div>
  );
}