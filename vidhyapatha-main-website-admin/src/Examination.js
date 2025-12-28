import React, { useEffect, useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react";
import { supabase } from "./supabase";

export default function AdminExaminations() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const EXAM_FIELDS = {
  name: "text",
  short_name: "text",
  provider: "text",
  qual_level: "text",
  allowed_domains: "array", // text[]
  min_age: "number",
  max_age: "number",
  website: "text",
  exam_date: "date",
  application_start: "date",
  application_end: "date",
  description: "text",
  pattern: "text",
  fees: "text",
  syllabus: "text",
  difficulty: "text",
  tags: "array", // text[]
  region: "text",
};

const emptyForm = Object.keys(EXAM_FIELDS).reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {});

const [form, setForm] = useState(emptyForm);

/* ---------------- FETCH ---------------- */
const fetchExams = async () => {
  setLoading(true);
  const { data, error } = await supabase
    .from("examinations")
    .select("*")
    .order("id");

  if (!error) setExams(data || []);
  setLoading(false);
};

useEffect(() => {
  fetchExams();
}, []);

/* ---------------- HANDLE CHANGE ---------------- */
const handleChange = (e) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

/* ---------------- SAVE ---------------- */
const handleSave = async () => {
  const payload = {};

  Object.entries(EXAM_FIELDS).forEach(([key, type]) => {
    if (type === "array") {
      payload[key] = form[key]
        ? form[key].split(",").map((v) => v.trim()).filter(Boolean)
        : [];
    } else if (type === "number") {
      payload[key] = form[key] ? parseInt(form[key], 10) : null;
    } else if (type === "date") {
      const d = new Date(form[key]);
      payload[key] = !isNaN(d.getTime()) ? d.toISOString().split("T")[0] : null;
    } else {
      payload[key] = form[key] || null;
    }
  });

  try {
    if (editingId) {
      const { error } = await supabase
        .from("examinations")
        .update(payload)
        .eq("id", editingId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("examinations").insert([payload]);
      if (error) throw error;
    }
  } catch (err) {
    alert("Save failed. Please try again.");
  }

  resetForm();
  fetchExams();
};

/* ---------------- EDIT ---------------- */
const handleEdit = (exam) => {
  const filled = {};
  Object.keys(EXAM_FIELDS).forEach((key) => {
    if (EXAM_FIELDS[key] === "array") {
      filled[key] = exam[key]?.join(", ") || "";
    } else {
      filled[key] = exam[key] || "";
    }
  });
  setForm(filled);
  setEditingId(exam.id);
  setShowForm(true);
};

/* ---------------- DELETE / SOFT DELETE ---------------- */
 const handleDelete = async (id) => {
    if (window.confirm("Delete this examination?")) {
      await supabase.from("examinations").delete().eq("id", id);
      fetchExams();
    }
  };

/* ---------------- RESET FORM ---------------- */
const resetForm = () => {
  setForm(emptyForm);
  setEditingId(null);
  setShowForm(false);
};


  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Examinations Admin
            </h1>
            <p className="text-slate-500">
              Manage competitive & entrance examinations
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white
                         px-5 py-2.5 rounded-xl shadow hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Exam
            </button>
          )}
        </div>

        {/* FORM (ABOVE TABLE) */}
        {/* FORM (ABOVE TABLE) */}
{showForm && (
  <div className="bg-white rounded-2xl shadow p-6 space-y-6">
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold">
        {editingId ? "Edit Examination" : "Add Examination"}
      </h2>
      <button onClick={resetForm}>
        <X />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Exam Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: Joint Entrance Examination Main"
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Short Name</label>
        <input
          name="short_name"
          value={form.short_name}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: JEE Main"
        />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Provider</label>
        <input
          name="provider"
          value={form.provider}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: NTA"
        />
      </div>

      {/* Qualification */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Qualification Level</label>
        <input
          name="qual_level"
          value={form.qual_level}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 12th"
        />
      </div>

      {/* Domain */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Domain</label>
        <input
          name="allowed_domains"
          value={form.allowed_domains}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: Engineering, Medical"
        />
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Minimum Age</label>
        <input
          type="number"
          name="min_age"
          value={form.min_age}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 18"
        />
      </div>

      {/* Age */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Maximum Age</label>
        <input
          type="number"
          name="max_age"
          value={form.max_age}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 30"
        />
      </div>

      {/* Website */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Website</label>
        <input
          name="website"
          value={form.website}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: https://jeemain.nta.nic.in"
        />
      </div>

      {/* Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Exam Date</label>
        <input
          type="date"
          name="exam_date"
          value={form.exam_date}
          onChange={handleChange}
          className="border rounded-lg p-2"
        />
      </div>

      {/* Application Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Application Start</label>
        <input
          type="date"
          name="application_start"
          value={form.application_start}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 2024-01-01"
        />
      </div>

      {/* Application Date */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Application End</label>
        <input
          type="date"
          name="application_end"
          value={form.application_end}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 2024-01-01"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="border rounded-lg p-2"
          placeholder="Brief overview of the examination"
        />
      </div>

       {/* Pattern */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Exam Pattern</label>
        <textarea
          name="pattern"
          value={form.pattern}
          onChange={handleChange}
          rows={3}
          className="border rounded-lg p-2"
          placeholder="Eg:MCQ, duration, marking scheme"
        />
      </div>


      {/* Fees */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Fees (₹)</label>
        <input
          type="number"
          name="fees"
          value={form.fees}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg: 1000"
        />
      </div>

            {/* Syllabus */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Syllabus</label>
        <textarea
          name="syllabus"
          value={form.syllabus}
          onChange={handleChange}
          rows={4}
          className="border rounded-lg p-2"
          placeholder="Eg:Physics, Chemistry, Maths..."
        />
      </div>
      

      {/* Difficulty */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Difficulty</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="border rounded-lg p-2"
        >
          <option value="">Select difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Tags</label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg:Engineering, Medical, Govt"
        />
      </div>

            {/* Region */}
      <div className="flex flex-col gap-1 md:col-span-2">
        <label className="text-sm font-medium">Region</label>
        <textarea
          name="region"
          value={form.region}
          onChange={handleChange}
          className="border rounded-lg p-2"
          placeholder="Eg:Tamil Nadu"
        />
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <button
        onClick={resetForm}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        Cancel
      </button>
      <button
        onClick={handleSave}
        className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
      >
        Save
      </button>
    </div>
  </div>
)}


        {/* TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Exam Name</th>
                    <th className="px-4 py-3">Pattern</th>
                    <th className="px-4 py-3">Fees</th>
                    <th className="px-4 py-3">Difficulty</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {exams.map((e) => (
                    <tr
                      key={e.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3">{e.pattern}</td>
                      <td className="px-4 py-3">{e.fees}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            e.difficulty === "Hard"
                              ? "bg-red-100 text-red-700"
                              : e.difficulty === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {e.difficulty}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {e.tags?.join(", ")}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
