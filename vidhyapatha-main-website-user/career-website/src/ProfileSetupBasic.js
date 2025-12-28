import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function ProfileSetupBasic({ initialData, Email = null }) {
  const navigate = useNavigate();

  const emptyForm = {
    fullname: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phone: "",
    district: "",
    pincode: "",
    country: "India",
    qualification: "",
    gender: "",
    stream: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) setForm({ ...emptyForm, ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm(prev => {
      // 🔁 Clear stream if switched to 10th
      if (name === "qualification" && value === "10") {
        return { ...prev, qualification: value, stream: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const email = Email || sessionStorage.getItem("signUpEmail") || sessionStorage.getItem("userEmail");
    if (!email) return alert("Session expired. Please sign up again.");

    // --- Geolocation fetch on form submission using district + pincode + country ---
    let lat = null, lon = null;
    if (form.district && form.pincode) {
      const query = `${form.district} ${form.pincode} India`;
      console.log("Fetching geolocation for:", query);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`,
          {
            headers: {
              "User-Agent": "ProfileSetupApp/1.0 (your-email@example.com)"
            }
          }
        );

        const data = await response.json();
        if (data && data.length > 0) {
          lat = data[0].lat;
          lon = data[0].lon;
          console.log("Latitude:", lat, "Longitude:", lon);
        } else {
          console.log("No geolocation found for this district/pincode.");
        }
      } catch (err) {
        console.error("Failed to fetch lat/lon:", err);
      }
    }

    // --- Save profile to Supabase ---
    const payload = {
      email,
      fullname: form.firstName + (form.middleName ? ` ${form.middleName}` : "") + ` ${form.lastName}`,
      first_name: form.firstName,
      middle_name: form.middleName,
      last_name: form.lastName,
      dob: form.dob,
      phone: form.phone,
      qualification: form.qualification,
      gender: form.gender,
      stream: form.Stream,
      latitude: lat,
      longitude: lon
    };

    sessionStorage.setItem("qualification", form.qualification);
    sessionStorage.setItem("stream", form.Stream);

    const { data, error } = await supabase
  .from("profiles")
  .upsert(payload, { onConflict: "email" });

  console.log("Profile upsert data:", data, "Error:", error);

if (error) return alert("Failed to save profile. Try again.");


    if (error) return alert("Failed to save profile. Try again.");

    sessionStorage.setItem("userName", `${form.firstName} ${form.lastName}`);

    navigate("/aptitude-landing", { state: { qualification: form.qualification } });
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-[#C7CBFF]">
      <h1 className="text-2xl font-bold mb-8 text-center text-[#444EE7]">
        Profile Setup – General Info
      </h1>

      <form onSubmit={handleNext}>
        <div className="grid grid-cols-1 gap-y-6">

          <Input label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
          <Input label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
          <Input label="Last Name *" name="lastName" value={form.lastName} onChange={handleChange} required />
          <Input label="Date of Birth *" type="date" name="dob" value={form.dob} onChange={handleChange} required />
          <Input label="Phone Number *" name="phone" value={form.phone} onChange={handleChange} required />

          <Input
            label="District *"
            name="district"
            value={form.district}
            onChange={handleChange}
            placeholder="Enter your district"
            required
          />

          <Input
            label="Pincode *"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Enter your area PIN code"
            required
          />

          <Select
            label="Qualification *"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            options={[
              { label: "Select Qualification", value: "" },
              { label: "10th", value: "10" },
              { label: "12th", value: "12" }
            ]}
          />

          {form.qualification === "12" && (
            <Select
              label="Stream *"
              name="Stream"
              value={form.Stream}
              onChange={handleChange}
              options={[
                { label: "Select Stream", value: "" },
                { label: "PCMB", value: "PCMB" },
                { label: "PCM", value: "PCM" },
                { label: "PCB", value: "PCB" },
                { label: "Arts/Commerce", value: "Arts/Commerce" }
              ]}
            />
          )}

          <Select
            label="Gender *"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={[
              { label: "Select Gender", value: "" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" }
            ]}
          />

        </div>

        <div className="text-center">
          <button
            type="submit"
            className="mt-10 px-10 py-3 bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white rounded-lg hover:opacity-90 transition"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}

const Input = ({ label, ...props }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-[#444EE7] font-medium mb-2">{label}</label>
    <input {...props} className="border border-[#C7CBFF] rounded-lg p-2" />
  </div>
);

const Select = ({ label, options, ...props }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-[#444EE7] font-medium">{label}</label>
    <select {...props} className="border border-[#C7CBFF] rounded-lg p-2">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);
/*
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function ProfileSetupBasic({ initialData, Email = null }) {
  const navigate = useNavigate();

  const emptyForm = {
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phone: "",
    district: "",
    pincode: "",
    qualification: "",
    gender: "",
    stream: "",
    preferredLocations: ["", "", "", "", ""],
    neetScore: "",
    jeeScore: ""
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (initialData) setForm({ ...emptyForm, ...initialData });
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

  const handleNext = async (e) => {
  e.preventDefault();

  const email =
    Email ||
    sessionStorage.getItem("signUpEmail") ||
    sessionStorage.getItem("userEmail");

  if (!email) return alert("Session expired. Please login again.");

  const profilePayload = {
    email,
    fullname: `${form.firstName} ${form.middleName ? form.middleName + " " : ""}${form.lastName}`,
    first_name: form.firstName,
    middle_name: form.middleName,
    last_name: form.lastName,
    dob: form.dob,
    phone: form.phone,
    district: form.district,
    pincode: form.pincode,
    qualification: form.qualification,
    gender: form.gender,
    stream: form.qualification === "12" ? form.stream : null
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profilePayload, { onConflict: "email" });

  if (profileError) {
    console.error(profileError);
    return alert("Failed to save profile");
  }


  const preferredLocations = form.preferredLocations.filter(Boolean);

  // 🔹 10th DATA
  if (form.qualification === "10") {
    const { error } = await supabase
      .from("10th_profile_data")
      .upsert(
        {
          email,
          preferred_locations: preferredLocations
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error(error);
      return alert("Failed to save 10th data");
    }
  }

  // 🔹 12th DATA
  if (form.qualification === "12") {
    const { error } = await supabase
      .from("12th_profile_data")
      .upsert(
        {
          email,
          preferred_locations: preferredLocations,
          neet_score: form.neetScore || null,
          jee_score: form.jeeScore || null
        },
        { onConflict: "email" }
      );

    if (error) {
      console.error(error);
      return alert("Failed to save 12th data");
    }
  }

  sessionStorage.setItem("qualification", form.qualification);
  navigate("/aptitude-landing", {
    state: { qualification: form.qualification }
  });
};


  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-[#C7CBFF]">
      <h1 className="text-2xl font-bold mb-8 text-center text-[#444EE7]">
        Profile Setup – General Info
      </h1>

      <form onSubmit={handleNext} className="space-y-6">

        <Input label="First Name *" name="firstName" value={form.firstName} onChange={handleChange} required />
        <Input label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
        <Input label="Last Name *" name="lastName" value={form.lastName} onChange={handleChange} required />
        <Input label="Date of Birth *" type="date" name="dob" value={form.dob} onChange={handleChange} required />
        <Input label="Phone Number *" name="phone" value={form.phone} onChange={handleChange} required />
        <Input label="District *" name="district" value={form.district} onChange={handleChange} required />
        <Input label="Pincode *" name="pincode" value={form.pincode} onChange={handleChange} required />
        <Select
          label="Gender *"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          options={[
            { label: "Select Gender", value: "" },
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" }
          ]}
        />
        <Select
          label="Highest Qualification *"
          name="qualification"
          value={form.qualification}
          onChange={handleChange}
          options={[
            { label: "Select Qualification", value: "" },
            { label: "10th", value: "10" },
            { label: "12th", value: "12" }
          ]}
        />

        {form.qualification === "12" && (
          <Select
            label="Stream *"
            name="stream"
            value={form.stream}
            onChange={handleChange}
            options={[
              { label: "Select Stream", value: "" },
              { label: "PCMB", value: "PCMB" },
              { label: "PCM", value: "PCM" },
              { label: "PCB", value: "PCB" },
              { label: "Arts / Commerce", value: "Arts/Commerce" }
            ]}
          />
        )}

        

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

     
{form.qualification === "12" && (
  <>
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
  </>
)}


        <div className="text-center">
          <button
            type="submit"
            className="mt-8 px-10 py-3 bg-gradient-to-r from-[#444EE7] to-[#6B74FF]
                       text-white rounded-lg hover:opacity-90 transition"
          >
            Save & Continue
          </button>
        </div>
      </form>
    </div>
  );
}


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
*/