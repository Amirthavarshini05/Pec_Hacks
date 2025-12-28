// import React, { useState, useEffect } from "react";
// import { supabase } from "./supabase";

// export default function ProfileSettings() {
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);

//   const [form, setForm] = useState({
//     firstName: "",
//     middleName: "",
//     lastName: "",
//     dob: "",
//     phone: "",
//     gender: "",
//   });

//   const [saving, setSaving] = useState(false);

//   /* ---------------- FETCH PROFILE ---------------- */
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const {
//           data: { user },
//         } = await supabase.auth.getUser();

//         if (!user) {
//           setLoading(false);
//           return;
//         }

//         const { data, error } = await supabase
//           .from("profile_admin")
//           .select("*")
//           .eq("user_id", user.id)
//           .single();

//         if (data) {
//           setProfile(data);
//           setForm({
//             firstName: data.first_name || "",
//             middleName: data.middle_name || "",
//             lastName: data.last_name || "",
//             dob: data.dob ? data.dob.slice(0, 10) : "",
//             phone: data.phone || "",
//             gender: data.gender || "",
//           });
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   /* ---------------- SAVE PROFILE ---------------- */
//   const handleSave = async () => {
//     setSaving(true);

//     try {
//       const {
//         data: { user },
//       } = await supabase.auth.getUser();

//       if (!user) return;

//       const { error } = await supabase
//         .from("profile_admin")
//         .upsert(
//           {
//             user_id: user.id,
//             first_name: form.firstName,
//             middle_name: form.middleName,
//             last_name: form.lastName,
//             dob: form.dob,
//             phone: Number(form.phone),
//             gender: form.gender,
//           },
//           { onConflict: ["user_id"] }
//         );

//       if (error) {
//         alert("Error saving profile");
//       } else {
//         setProfile({
//           first_name: form.firstName,
//           middle_name: form.middleName,
//           last_name: form.lastName,
//           dob: form.dob,
//           phone: form.phone,
//           gender: form.gender,
//         });
//         setIsEditing(false);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="max-w-5xl mx-auto mt-10 text-gray-600">
//         Loading profile…
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-5xl mx-auto mt-10 space-y-10">

//       {/* -------- SAVED PROFILE (DEFAULT VIEW) -------- */}
//       {profile && !isEditing && (
//         <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow relative">
//           <button
//             onClick={() => setIsEditing(true)}
//             className="absolute top-4 right-4 text-sm px-3 py-1 border rounded-md hover:bg-gray-100"
//           >
//             Edit
//           </button>

//           <h3 className="text-lg font-semibold mb-4">Saved Profile</h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <DisplayField label="First Name" value={profile.first_name} />
//             <DisplayField label="Middle Name" value={profile.middle_name} />
//             <DisplayField label="Last Name" value={profile.last_name} />
//             <DisplayField label="Date of Birth" value={profile.dob} />
//             <DisplayField label="Phone" value={profile.phone} />
//             <DisplayField label="Gender" value={profile.gender} />
//           </div>
//         </div>
//       )}

//       {/* -------- EDIT FORM (ON EDIT CLICK) -------- */}
//       {isEditing && (
//         <div className="bg-white p-8 rounded-xl shadow-lg border border-[#C7CBFF]">
//           <h2 className="text-xl font-bold mb-6 text-center">Edit Profile</h2>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
//             <Field label="Middle Name" name="middleName" value={form.middleName} onChange={handleChange} />
//             <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
//             <Field label="Date of Birth" type="date" name="dob" value={form.dob} onChange={handleChange} />
//             <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
//             <Field
//               label="Gender"
//               type="select"
//               name="gender"
//               value={form.gender}
//               onChange={handleChange}
//               options={["male", "female", "other"]}
//             />
//           </div>

//           <div className="mt-6 text-center flex justify-center gap-4">
//             <button
//               onClick={() => setIsEditing(false)}
//               className="px-6 py-2 border rounded-lg"
//             >
//               Cancel
//             </button>

//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:opacity-90"
//             >
//               {saving ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ---------------- COMPONENTS ---------------- */

// const Field = ({ label, value, type = "text", name, onChange, options = [] }) => {
//   if (type === "select") {
//     return (
//       <div className="flex flex-col">
//         <label className="font-medium text-gray-700">{label}</label>
//         <select
//           name={name}
//           value={value}
//           onChange={onChange}
//           className="mt-1 border rounded-lg p-2"
//         >
//           <option value="">Select {label}</option>
//           {options.map((opt) => (
//             <option key={opt} value={opt}>
//               {opt.charAt(0).toUpperCase() + opt.slice(1)}
//             </option>
//           ))}
//         </select>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col">
//       <label className="font-medium text-gray-700">{label}</label>
//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="mt-1 border rounded-lg p-2"
//       />
//     </div>
//   );
// };

// const DisplayField = ({ label, value }) => (
//   <div className="flex flex-col">
//     <label className="font-medium text-gray-700">{label}</label>
//     <span className="mt-1">{value || "-"}</span>
//   </div>
// );


import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

export default function ProfileSettings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    phone: "",
    gender: "",
  });

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from("profile_admin")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setProfile(data);
          setForm({
            firstName: data.first_name || "",
            middleName: data.middle_name || "",
            lastName: data.last_name || "",
            dob: data.dob ? data.dob.slice(0, 10) : "",
            phone: data.phone || "",
            gender: data.gender || "",
          });
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profile_admin")
        .upsert(
          {
            user_id: user.id,
            first_name: form.firstName,
            middle_name: form.middleName,
            last_name: form.lastName,
            dob: form.dob,
            phone: Number(form.phone),
            gender: form.gender,
          },
          { onConflict: ["user_id"] }
        );

      setProfile({
        first_name: form.firstName,
        middle_name: form.middleName,
        last_name: form.lastName,
        dob: form.dob,
        phone: form.phone,
        gender: form.gender,
      });

      setIsEditing(false);
      console.log("Exited edit mode after SAVE");
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-10 text-gray-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 space-y-10">

      {/* -------- TRENDY SAVED PROFILE CARD -------- */}
      {profile && !isEditing && (
        <div className="relative overflow-hidden rounded-2xl shadow-lg border bg-white">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                {profile.first_name?.[0] || "U"}
              </div>
              <div>
                <h2 className="text-white text-lg font-semibold">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-indigo-100 text-sm">
                  Admin Profile
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm hover:bg-white/30"
            >
              Edit
            </button>
          </div>

          {/* Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="First Name" value={profile.first_name} />
            <Info label="Middle Name" value={profile.middle_name} />
            <Info label="Last Name" value={profile.last_name} />
            <Info label="DOB" value={profile.dob} />
            <Info label="Phone" value={profile.phone} />
            <Info label="Gender" value={profile.gender} />
          </div>
        </div>
      )}

      {/* -------- EDIT FORM (UNCHANGED UI) -------- */}
     {isEditing && (
  <div className="relative overflow-hidden rounded-2xl shadow-lg border bg-white">

    {/* HEADER (same style as saved profile) */}
    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 flex items-center justify-between">
      <div>
        <h2 className="text-white text-lg font-semibold">
          Edit Profile
        </h2>
        <p className="text-indigo-100 text-sm">
          Update your personal information
        </p>
      </div>

      <button
        onClick={() => {
          setIsEditing(false);
          console.log("Exited edit mode via CANCEL");
        }}
        className="bg-white/20 text-white px-4 py-1.5 rounded-full text-sm hover:bg-white/30"
      >
        ✕ Close
      </button>
    </div>

    {/* BODY (FORM — SAME AS BEFORE) */}
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />
        <Field
          label="Middle Name"
          name="middleName"
          value={form.middleName}
          onChange={handleChange}
        />
        <Field
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
        />
        <Field
          label="Date of Birth"
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
        />
        <Field
          label="Phone"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />
        <Field
          label="Gender"
          type="select"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          options={["male", "female", "other"]}
        />
      </div>

      {/* ACTIONS */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={() => {
            setIsEditing(false);
            console.log("Exited edit mode via CANCEL");
          }}
          className="px-6 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

const Field = ({ label, value, type = "text", name, onChange, options = [] }) => {
  if (type === "select") {
    return (
      <div className="flex flex-col">
        <label className="font-medium text-gray-700">{label}</label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          className="mt-1 border rounded-lg p-2"
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 border rounded-lg p-2"
      />
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value || "-"}</p>
  </div>
);
