import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Pencil, Trash2, Plus } from "lucide-react";

/* ---------------- COLLEGE SCHEMA ---------------- */
const COLLEGE_FIELDS = {
  name: "text",
  rank: "text",
  type: "text",
  address: "text",
  state: "text",
  district: "text",
  contact: "json",
  email: "json",
  stream: "json",
  degrees: "json",
  courses_ids: "json",
  medium: "text",
  eligible: "text",
  duration: "text",
  admission_mode: "text",
  fees: "text",
  hostel: "text",
  lab: "text",
  lib: "text",
  net: "text",
  food: "text",
  transport: "text",
  sports: "text",
  disable: "text",
  placements: "text",
  career: "text",
  alumini: "text",
  clubs: "text",
  rating: "text",
  cutoff: "json",
  gender: "text",
  website: "text",
  college_pic: "text",
  latitude: "text",
  longitude: "text",
};

const emptyCollege = Object.keys(COLLEGE_FIELDS).reduce((a, k) => {
  a[k] = "";
  return a;
}, {});

/* ---------------- SAFE HELPERS ---------------- */
const safeJoin = (val) => {
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "string") return val;
  return "—";
};

const normalizeToArray = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val];
  return [];
};

export default function AdminColleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyCollege);

  /* -------- FILTERS -------- */
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    stream: "",
    medium: "",
  });

  const [options, setOptions] = useState({
    states: [],
    districts: [],
    streams: [],
    mediums: [],
  });

  /* ---------------- LOAD FILTER OPTIONS ---------------- */
  useEffect(() => {
    supabase
      .from("colleges")
      .select("state,district,medium,stream")
      .then(({ data }) => {
        if (!data) return;

        setOptions({
          states: [...new Set(data.map(d => d.state).filter(Boolean))],
          districts: [...new Set(data.map(d => d.district).filter(Boolean))],
          mediums: [...new Set(data.map(d => d.medium).filter(Boolean))],
          streams: [
            ...new Set(
              data.flatMap(d => normalizeToArray(d.stream))
            ),
          ],
        });
      });
  }, []);

  /* ---------------- FETCH COLLEGES ---------------- */
  const fetchColleges = useCallback(async () => {
    setLoading(true);

    let q = supabase.from("colleges").select("*");

    if (filters.state) q = q.eq("state", filters.state);
    if (filters.district) q = q.eq("district", filters.district);
    if (filters.medium) q = q.eq("medium", filters.medium);
    if (filters.stream) q = q.contains("stream", [filters.stream]);
    if (search) q = q.ilike("name", `%${search}%`);

    const { data } = await q;
    setColleges(data || []);
    setLoading(false);
  }, [filters, search]);

  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  /* ---------------- SAVE (ADD / EDIT) ---------------- */
  const saveCollege = async () => {
    const payload = {};

    Object.entries(COLLEGE_FIELDS).forEach(([k, t]) => {
      payload[k] =
        t === "json"
          ? formData[k]
              .split(",")
              .map(v => v.trim())
              .filter(Boolean)
          : formData[k];
    });

    const query = editingId
      ? supabase.from("colleges").update(payload).eq("id", editingId)
      : supabase.from("colleges").insert(payload);

    const { error } = await query;
    if (error) {
      alert("Save failed");
      console.error(error);
      return;
    }

    setShowForm(false);
    setEditingId(null);
    setFormData(emptyCollege);
    fetchColleges();
  };

  /* ---------------- EDIT ---------------- */
  const editCollege = (college) => {
    setEditingId(college.id);

    const filled = {};
    Object.keys(COLLEGE_FIELDS).forEach(k => {
      filled[k] = Array.isArray(college[k])
        ? college[k].join(", ")
        : college[k] || "";
    });

    setFormData(filled);
    setShowForm(true);
  };

  /* ---------------- DELETE ---------------- */
  const deleteCollege = async (id) => {
    if (!window.confirm("Delete this college?")) return;
    await supabase.from("colleges").delete().eq("id", id);
    fetchColleges();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">Colleges</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData(emptyCollege);
          }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          <Plus size={18} /> Add College
        </button>
      </div>

      {/* -------- ADD / EDIT FORM -------- */}
      {showForm && (
        <div className="bg-white p-6 rounded shadow mb-8">
          <h2 className="font-bold mb-4">
            {editingId ? "✏️ Edit College" : "➕ Add College"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(COLLEGE_FIELDS).map(([field, type]) => (
              <input
                key={field}
                placeholder={`${field}${type === "json" ? " (comma separated)" : ""}`}
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
              onClick={saveCollege}
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

      {/* -------- FILTERS -------- */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="🔍 Search college name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded"
        />

        <select
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All state</option>
          {options.states.map(v => <option key={v}>{v}</option>)}
        </select>

        <select
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All district</option>
          {options.districts.map(v => <option key={v}>{v}</option>)}
        </select>

        <select
          value={filters.medium}
          onChange={(e) => setFilters({ ...filters, medium: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All medium</option>
          {options.mediums.map(v => <option key={v}>{v}</option>)}
        </select>

        <select
          value={filters.stream}
          onChange={(e) => setFilters({ ...filters, stream: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">All stream</option>
          {options.streams.map(v => <option key={v}>{v}</option>)}
        </select>
      </div>

      {/* -------- TABLE -------- */}
      <div className="bg-white rounded shadow">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">State</th>
                <th className="border p-2">District</th>
                <th className="border p-2">Stream</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {colleges.map(c => (
                <tr key={c.id}>
                  <td className="border p-2 font-semibold">{c.name}</td>
                  <td className="border p-2">{c.state}</td>
                  <td className="border p-2">{c.district}</td>
                  <td className="border p-2">{safeJoin(c.stream)}</td>
                  <td className="border p-2 flex gap-3">
                    <button onClick={() => editCollege(c)}>
                      <Pencil size={18} className="text-blue-600" />
                    </button>
                    <button onClick={() => deleteCollege(c.id)}>
                      <Trash2 size={18} className="text-red-600" />
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
