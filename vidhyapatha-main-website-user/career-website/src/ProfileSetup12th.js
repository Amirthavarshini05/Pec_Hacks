import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

/* ================= CONSTANTS ================= */

const allSubjects = [
  "English", "Physics", "Chemistry", "Mathematics", "Biology",
  "Computer Science", "Business Studies", "Accountancy", "Economics"
];

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



const streamOptions = ["PCMB", "PCM", "PCB", "Commerce", "Arts"];

const interestSubjects = [
  "Science", "Mathematics", "ComputerScience", "SocialScience", "Languages", "Arts", "Commerce"
];

const ambitionOptions = [
  "Doctor", "Engineer", "Scientist", "Lawyer", "Entrepreneur", "Designer", "Others"
];

const emptyForm = {
  medium: "",
  compulsoryLanguage: "",
  stream: "",
  interest: "",
  ambition: "",
  otherAmbition: "",
  neetScore: "",
  jeeScore: "",
  preferredLocations: ["", "", "", "", ""] // restored location array
};

/* ================= COMPONENT ================= */

export default function ProfileSetup12th({ onComplete, initialData, email }) {
  const [form, setForm] = useState(emptyForm);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  /* ================= LOAD EXISTING DATA ================= */
  useEffect(() => {
    if (!initialData) return;

    setForm({
      ...emptyForm,
     
      stream: initialData.stream || "",
      
      neetScore: initialData.neet_score || "",
      jeeScore: initialData.jee_score || "",
      preferredLocations: initialData.preferred_locations || ["", "", "", "", ""]
    });

    setSelectedSubjects(initialData.subjects || []);
  }, [initialData]);

  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) =>
      prev.some((s) => s.name === subject)
        ? prev.filter((s) => s.name !== subject)
        : [...prev, { name: subject, marks: "" }]
    );
  };

  const handleMarksChange = (index, value) => {
    const updated = [...selectedSubjects];
    updated[index].marks = value;
    setSelectedSubjects(updated);
  };

  // Restored: Handle changes for the 5 location inputs
  const handleLocationChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.preferredLocations];
      updated[index] = value;
      return { ...prev, preferredLocations: updated };
    });
  };

  /* ================= SUBMIT ================= */

  const handleFinish = async (e) => {
    e.preventDefault();

    

    // Ensure at least 3 locations are filled (optional rule, you can remove if needed)
    const filledLocations = form.preferredLocations.filter((l) => l.trim() !== "");
    if (filledLocations.length < 3) {
      alert("Please enter at least 3 preferred locations");
      return;
    }

    const finalData = {
      email: email,
      
      stream: form.stream,
      
      neet_score: form.neetScore ? parseFloat(form.neetScore) : null,
      jee_score: form.jeeScore ? parseFloat(form.jeeScore) : null,
      preferred_locations: form.preferredLocations // Saving full array [city1, city2...]
    };

    console.log("Saving data to 12th_profile_data:", finalData);

    try {
      const { error } = await supabase
        .from("12th_profile_data")
        .upsert(finalData, { onConflict: "email" });

      if (error) throw error;

      alert("✅ 12th profile saved successfully");
      if (onComplete) onComplete(finalData);
    } catch (err) {
      console.error("Save error:", err);
      alert(`❌ Failed to save profile: ${err.message}`);
    }
  };

  return (
    <form
      onSubmit={handleFinish}
      className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-800">Profile Setup – 12th</h2>

      

      {/* Stream Selection */}
      <select
        name="stream"
        value={form.stream}
        onChange={handleChange}
        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
      >
        <option value="">Stream *</option>
        {streamOptions.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>

      

     

    

      {/* Restored Preferred Locations */}
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

      {/* NEET & JEE Scores (All Streams) */}
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      NEET Score
    </label>
    <input
      type="number"
      name="neetScore"
      value={form.neetScore}
      onChange={handleChange}
      placeholder="If applicable"
      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      JEE Score
    </label>
    <input
      type="number"
      name="jeeScore"
      value={form.jeeScore}
      onChange={handleChange}
      placeholder="If applicable"
      className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
    />
  </div>
</div>

      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg transition shadow-md">
        Save & Finish
      </button>
    </form>
  );
}