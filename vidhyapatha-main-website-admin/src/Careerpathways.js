import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

/* ===========================
   ADMIN – CAREER PATHWAYS
   READ ONLY VIEW
=========================== */

export default function CareerPathways() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* -------- FETCH CAREER PATHWAYS -------- */
  const fetchCareerPathways = useCallback(async () => {
    setLoading(true);

    let q = supabase
  .from("careers")
  .select(`
    id,
    name,
    interest_key,
    domains (
      id,
      name
    ),
    career_roadmap_steps (
      id,
      level,
      title,
      description,
      order_index
    ),
    career_assets (
      id,
      asset_type,
      name
    )
  `)
  .order("name", { ascending: true });


    if (search) {
      q = q.ilike("name", `%${search}%`);
    }

    const { data, error } = await q;

    if (error) {
      console.error(error);
      alert("Failed to load career pathways");
    }

    setData(data || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    fetchCareerPathways();
  }, [fetchCareerPathways]);

  /* -------- UI -------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          Career Pathways
        </h1>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          type="text"
          placeholder="🔍 Search career name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Career</th>
                <th className="border p-2">Domain</th>
                <th className="border p-2">Interest Key</th>
                <th className="border p-2">Roadmap Steps</th>
                <th className="border p-2">Skills</th>
                <th className="border p-2">Projects</th>
              </tr>
            </thead>

            <tbody>
              {data.map((c) => {
                const steps = [...(c.career_roadmap_steps || [])].sort(
                  (a, b) => a.order_index - b.order_index
                );

                const skills =
                  c.career_assets?.filter(a => a.asset_type === "skill") || [];

                const projects =
                  c.career_assets?.filter(a => a.asset_type === "project") || [];

                return (
                  <tr key={c.id} className="align-top">
                    {/* CAREER */}
                    <td className="border p-2 font-semibold">
                      {c.name}
                    </td>

                    {/* DOMAIN */}
                    <td className="border p-2">
                      {c.domains?.name || "-"}
                    </td>

                    {/* INTEREST */}
                    <td className="border p-2">
                      {c.interest_key ?? "-"}
                    </td>

                    {/* ROADMAP */}
                    <td className="border p-2">
                      {steps.length === 0 ? (
                        <span className="text-gray-400">No steps</span>
                      ) : (
                        <ul className="list-decimal ml-4 space-y-1">
                          {steps.map(s => (
                            <li key={s.id}>
                              <strong>{s.level}:</strong> {s.title}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>

                    {/* SKILLS */}
                    <td className="border p-2">
                      {skills.length === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <ul className="list-disc ml-4">
                          {skills.map(s => (
                            <li key={s.id}>{s.name}</li>
                          ))}
                        </ul>
                      )}
                    </td>

                    {/* PROJECTS */}
                    <td className="border p-2">
                      {projects.length === 0 ? (
                        <span className="text-gray-400">—</span>
                      ) : (
                        <ul className="list-disc ml-4">
                          {projects.map(p => (
                            <li key={p.id}>{p.name}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
