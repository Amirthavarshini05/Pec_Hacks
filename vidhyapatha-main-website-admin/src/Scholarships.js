import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash } from "lucide-react";
import { supabase } from "./supabase";

/* ---------------- SCHOLARSHIP SCHEMA ---------------- */
const SCHOLARSHIP_FIELDS = {
  name: "text",
  provider: "text",
  type: "text",
  region: "text",
  education_level: "array",
  gender: "text",
  category: "array",
  income_limit: "bigint",
  amount_benefit: "text",
  deadline: "date",
  link: "text",
  description: "text",
  eligibility_details: "text",
  documents_needed: "array",
};

const emptyScholarship = Object.keys(SCHOLARSHIP_FIELDS).reduce((a, k) => {
  a[k] = "";
  return a;
}, {});

export default function AdminScholarships() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- SEARCH & FILTERS (NEW) ---------------- */
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    gender: "",
    category: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyScholarship);

  /* ---------------- FETCH ---------------- */
  const fetchScholarships = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("scholarships")
      .select("*")
      .order("id", { ascending: false });

    setScholarships(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  /* ---------------- SAVE (ADD / EDIT) ---------------- */
  const saveScholarship = async () => {
    const payload = {};

    const arrayFields = ["category", "education_level", "documents_needed"];

Object.entries(SCHOLARSHIP_FIELDS).forEach(([k, t]) => {
  if (arrayFields.includes(k)) {
    payload[k] = formData[k]
      .split(",")
      .map(v => v.trim())
      .filter(Boolean);
  }else {
  payload[k] =
    k === "income_limit"
      ? formData[k] ? parseInt(formData[k], 10) : null
      : formData[k] || null;
}
});

if (!editingId) delete payload.id; // Ensure 'disable' is not set when adding new scholarship

    const query = editingId
      ? supabase.from("scholarships").update(payload).eq("id", editingId)
      : supabase.from("scholarships").insert(payload);

    const { error } = await query;
    if (error) {
      alert("Save failed");
      console.error(error);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyScholarship);
    fetchScholarships();
  };

  /* ---------------- EDIT ---------------- */
  const editScholarship = (s) => {
    setEditingId(s.id);
    const filled = {};
    Object.keys(SCHOLARSHIP_FIELDS).forEach(k => {
      filled[k] = Array.isArray(s[k]) ? s[k].join(", ") : s[k] || "";
    });
    setFormData(filled);
    setShowForm(true);
  };

  /* ---------------- DELETE ---------------- */
  const deleteScholarship = async (id) => {
    if (!window.confirm("Delete this scholarship?")) return;
    await supabase.from("scholarships").delete().eq("id", id);
    fetchScholarships();
  };



  /* ---------------- FILTERED DATA (NEW) ---------------- */
  const filteredScholarships = scholarships.filter(s => {
    const matchesSearch =
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.provider?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filters.type ? s.type === filters.type : true;
    const matchesGender = filters.gender ? s.gender === filters.gender : true;
    const matchesCategory = filters.category
      ? Array.isArray(s.category) && s.category.includes(filters.category)
      : true;

    return matchesSearch && matchesType && matchesGender && matchesCategory;
  });

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          🎓 Scholarships
        </h1>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData(emptyScholarship);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} />
          Add Scholarship
        </button>
      </div>

      {/* -------- SEARCH + FILTER BAR (NEW) -------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="🔍 Search scholarships..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Types</option>
          <option>Merit Based</option>
          <option>Means Based</option>
          <option>Minority</option>
          <option>Gender Specific</option>
          <option>Disability</option>
        </select>

        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All Genders</option>
          <option>Female</option>
          <option>Any</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({ ...filters, category: e.target.value })
          }
          className="border p-2 rounded"
        >
          <option value="">All Categories</option>
          <option>General</option>
          <option>OBC</option>
          <option>SC</option>
          <option>ST</option>
          <option>Minority</option>
        </select>
      </div>

      {/* -------- ADD / EDIT FORM -------- */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="font-bold mb-4">
            {editingId ? "✏️ Edit Scholarship" : "➕ Add Scholarship"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(SCHOLARSHIP_FIELDS).map(([field, type]) => (
              <input
                key={field}
                placeholder={`${field.replace(/_/g, " ")}${
                  type === "json" ? " (comma separated)" : ""
                }`}
                value={formData[field]}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                className="border p-2 rounded"
              />
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={saveScholarship}
              className="bg-indigo-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-300 px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* -------- TABLE -------- */}
      <div className="bg-white rounded shadow">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Provider</th>
                <th className="border p-2">Region</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Deadline</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredScholarships.map((s) => (
                <tr key={s.id}>
                  <td className="border p-2 font-semibold">{s.name}</td>
                  <td className="border p-2">{s.provider}</td>
                  <td className="border p-2">{s.region}</td>
                  <td className="border p-2">₹ {s.amount_benefit}</td>
                  <td className="border p-2">{s.deadline}</td>
                  <td className="border p-2 flex gap-3">
                    <button onClick={() => editScholarship(s)}>
                      <Edit size={18} className="text-blue-600" />
                    </button>
                    <button onClick={() => deleteScholarship(s.id)}>
                      <Trash size={18} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
