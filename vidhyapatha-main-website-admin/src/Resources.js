import React, { useEffect, useState } from "react";
import { Edit, Trash, Plus, X } from "lucide-react";
import { supabase } from "./supabase";

export default function AdminEBooks() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const RESOURCE_FIELDS = {
  category: "text",
  subjects: "text",  // comma-separated string input
  language: "text",
  data: "text",
  title: "text",
  description: "text",
  state: "text",
  class: "text",
};

const emptyResourceForm = Object.keys(RESOURCE_FIELDS).reduce((acc, key) => {
  acc[key] = "";
  return acc;
}, {});


  const [form, setForm] = useState(emptyResourceForm);

  /* ---------------- FETCH ---------------- */
  const fetchResources = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resource")
      .select("*")
      .order("id");

    if (!error) setResources(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };


const handleSave = async () => {
  const payload = {};

  Object.entries(RESOURCE_FIELDS).forEach(([key, type]) => {
    if (type === "array") {
      payload[key] = form[key]
        ? form[key].split(",").map((v) => v.trim()).filter(Boolean)
        : [];
    } else {
      payload[key] = form[key] || null;
    }
  });

  try {
    if (editingId) {
      const { error } = await supabase
        .from("resource")
        .update(payload)
        .eq("id", editingId);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("resource").insert([payload]);
      if (error) throw error;
    }


    resetForm();
    fetchResources();
  } catch (err) {
    console.error("Save failed:", err);
    alert("Save failed. Check console for details.");
  }
};


const handleEdit = (resource) => {
  const filled = {};

  Object.keys(RESOURCE_FIELDS).forEach((key) => {
    if (key === "subjects") {
      // If it's already a string, just use it
      filled[key] = resource[key] || "";
    } else {
      filled[key] = resource[key] || "";
    }
  });

  console.log("Editing resource:", filled);
  console.log({ showForm, editingId, form });

  setForm(filled);
  setEditingId(resource.id);
  setShowForm(true);
};


  const handleDelete = async (id) => {
    if (window.confirm("Delete this resource?")) {
      await supabase.from("resource").delete().eq("id", id);
      fetchResources();
    }
  };

  const resetForm = () => {
    setForm(emptyResourceForm);
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
              E-Books & Resources
            </h1>
            <p className="text-slate-500">
              Manage digital learning materials
            </p>
          </div>

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white
                         px-5 py-2.5 rounded-xl shadow hover:bg-indigo-700"
            >
              <Plus size={18} />
              Add Resource
            </button>
          )}
        </div>

        {/* FORM (ABOVE TABLE) */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit Resource" : "Add Resource"}
              </h2>
              <button onClick={resetForm}>
                <X />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(form).map((key) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700 capitalize">
                    {key.replace(/_/g, " ")}
                  </label>

                  {key === "description" ? (
                    <textarea
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      rows={3}
                      className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <input
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              ))}
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
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Language</th>
                    <th className="px-4 py-3">State</th>
                    <th className="px-4 py-3">Link</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {resources.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-medium">{r.title}</td>
                      <td className="px-4 py-3">{r.subjects}</td>
                      <td className="px-4 py-3">{r.class}</td>
                      <td className="px-4 py-3">{r.language}</td>
                      <td className="px-4 py-3">{r.state}</td>
                      <td className="px-4 py-3">
                        {r.data ? (
                          <a
                            href={r.data}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 underline"
                          >
                            Open
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(r)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
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
