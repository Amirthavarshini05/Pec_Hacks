/*import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";


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


export default function ProfileSetup12th({ onComplete, initialData, email }) {
  const [form, setForm] = useState(emptyForm);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

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

  const handleLocationChange = (index, value) => {
    setForm((prev) => {
      const updated = [...prev.preferredLocations];
      updated[index] = value;
      return { ...prev, preferredLocations: updated };
    });
  };


  const handleFinish = async (e) => {
    e.preventDefault();

    

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
}*/

import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

/* ================= CONSTANTS ================= */

const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chandigarh","Chhattisgarh",
  "Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand",
  "Karnataka","Kerala","Ladakh","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
  "Mizoram","Nagaland","Odisha","Puducherry","Punjab","Rajasthan","Sikkim",
  "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal"
];

const streamOptions = ["PCMB", "PCM", "PCB", "Commerce", "Arts"];

/* ================= EMPTY FORM ================= */

const emptyForm = {
  stream: "",
  neetScore: "",
  jeeScore: "",
  preferredLocations: ["", "", "", "", ""]
};

/* ================= COMPONENT ================= */

export default function ProfileSetup12th({ initialData, email, onComplete }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!initialData) return;

    setForm({
      ...emptyForm,
      stream: initialData.stream || "",
      neetScore: initialData.neet_score || "",
      jeeScore: initialData.jee_score || "",
      preferredLocations: initialData.preferred_locations || ["", "", "", "", ""]
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = (index, value) => {
    const updated = [...form.preferredLocations];
    updated[index] = value;
    setForm(prev => ({ ...prev, preferredLocations: updated }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const filledLocations = form.preferredLocations.filter(l => l.trim() !== "");
    if (filledLocations.length < 3) {
      alert("Please enter at least 3 preferred locations");
      return;
    }

    const finalData = {
      email,
      stream: form.stream,
      neet_score: form.neetScore ? parseFloat(form.neetScore) : null,
      jee_score: form.jeeScore ? parseFloat(form.jeeScore) : null,
      preferred_locations: form.preferredLocations
    };

    try {
      const { error } = await supabase
        .from("12th_profile_data")
        .upsert(finalData, { onConflict: "email" });

      if (error) throw error;

      alert("✅ 12th profile saved successfully");
      if (onComplete) onComplete(finalData);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save profile");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-[#C7CBFF]">
      <h2 className="text-2xl font-bold mb-6 text-center text-[#444EE7]">
        Profile Setup – 12th
      </h2>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Stream */}
        <Select
          label="Stream *"
          name="stream"
          value={form.stream}
          onChange={handleChange}
          options={[{ label: "Select Stream", value: "" }, ...streamOptions.map(s => ({ label: s, value: s }))]}
        />

        {/* Preferred Locations */}
        <div>
          <h3 className="text-[#444EE7] font-semibold mb-3">
            Preferred Locations (Top 5 States)
          </h3>
          <div className="space-y-3">
            {form.preferredLocations.map((loc, index) => (
              <select
                key={index}
                value={loc}
                onChange={(e) => handleLocationChange(index, e.target.value)}
                className="w-full border border-[#C7CBFF] rounded-lg p-2 font-semibold text-sm text-gray-700"
              >
                <option value="">Select State {index + 1}</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* NEET & JEE Scores */}
        <Input
          label="NEET Score (if applicable)"
          type="number"
          name="neetScore"
          value={form.neetScore}
          onChange={handleChange}
        />
        <Input
          label="JEE Score (if applicable)"
          type="number"
          name="jeeScore"
          value={form.jeeScore}
          onChange={handleChange}
        />

        {/* Submit Button */}
        <div className="text-center">
          <button
            type="submit"
            className="mt-6 px-10 py-3 bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white rounded-lg hover:opacity-90 transition"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= INPUT COMPONENTS ================= */

const Input = ({ label, ...props }) => (
  <div className="flex flex-col">
    <label className="text-[#444EE7] font-medium mb-1">{label}</label>
    <input
      {...props}
      className="border border-[#C7CBFF] rounded-lg p-2 font-semibold text-sm text-gray-700"
    />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col">
    <label className="text-[#444EE7] font-medium mb-1">{label}</label>
    <select
      {...props}
      className="border border-[#C7CBFF] rounded-lg p-2 font-semibold text-sm text-gray-700"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </div>
);

