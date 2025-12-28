import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

const Input = ({ label, name, type = "text", value, onChange, required }) => (
  <div className="flex flex-col">
    <label className="text-[#444EE7] font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full border border-[#C7CBFF] rounded-lg p-2 focus:ring-2 focus:ring-[#6B74FF]"
    />
  </div>
);

const Select = ({ label, name, value, onChange, options }) => (
  <div className="flex flex-col">
    <label className="text-[#444EE7] font-medium">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-[#C7CBFF] rounded-lg p-2 focus:ring-2 focus:ring-[#6B74FF]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function ProfileSetupBasic({ /* onUpdateDepartment, */ onLogin }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phone: "",
    gender: "",
    // department: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = async (e) => {
    e.preventDefault();

    // if (!form.department) {
    //   alert("Please select a Department");
    //   return;
    // }

    setLoading(true);

    const { error } = await supabase
      .from("profile_admin")
      .insert([
        {
          first_name: form.firstName,
          middle_name: form.middleName,
          last_name: form.lastName,
          dob: form.dob,
          phone: Number(form.phone),
          gender: form.gender,
          // department: form.department,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error("Supabase error:", error);
      alert(error.message);
    } else {
      // if (onUpdateDepartment) onUpdateDepartment(form.department);
      onLogin(); // sets React state + sessionStorage
      navigate("/dashboard");
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-xl p-10 border border-[#C7CBFF]">
      <h1 className="text-2xl font-bold mb-8 text-center text-[#444EE7]">
        Profile Setup – General Info
      </h1>

      <form onSubmit={handleNext}>
        <div className="grid grid-cols-1 gap-y-6">
          <Input
            label="First Name *"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <Input
            label="Middle Name"
            name="middleName"
            value={form.middleName}
            onChange={handleChange}
          />

          <Input
            label="Last Name *"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
          />

          <Input
            label="Date of Birth *"
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
          />

          <Input
            label="Phone Number *"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <Select
            label="Gender *"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={[
              { label: "Select Gender", value: "" },
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
          />
        </div>

        {/* Department section removed */}

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="mt-10 px-10 py-3 bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white rounded-lg hover:opacity-90 transition"
          >
            {loading ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
  );
}
