// import React, { useState } from "react";
// import RoadmapPage from "./RoadmapPage";

// export default function CareerPathwaysAdmin() {
//   const [careers, setCareers] = useState([
//     {
//       id: 1,
//       title: "Journalist/Editor",
//       details: "Mass Communication and Literature",
//       degree: "BA",
//       stream: "Journalism",
//       demand: "Demand",
//     },
//     {
//       id: 2,
//       title: "Public Relations Specialist",
//       details: "Mass Communication or Sociology",
//       degree: "BA",
//       stream: "Mass Communication",
//       demand: "Not in Demand",
//     },
//   ]);

//   const [selectedCareer, setSelectedCareer] = useState(null);
//   const [editingCareer, setEditingCareer] = useState(null);
//   const [newCareer, setNewCareer] = useState({
//     title: "",
//     details: "",
//     degree: "",
//     stream: "",
//     demand: "Demand",
//   });

//   // Add
//   const addCareer = () => {
//     if (!newCareer.title || !newCareer.details || !newCareer.degree || !newCareer.stream) return;
//     setCareers([...careers, { id: Date.now(), ...newCareer }]);
//     setNewCareer({ title: "", details: "", degree: "", stream: "", demand: "Demand" });
//   };

//   // Update
//   const updateCareer = () => {
//     setCareers(
//       careers.map((c) =>
//         c.id === editingCareer.id ? editingCareer : c
//       )
//     );
//     setEditingCareer(null);
//   };

//   // Delete
//   const deleteCareer = (id) => {
//     setCareers(careers.filter((c) => c.id !== id));
//     if (selectedCareer?.id === id) setSelectedCareer(null);
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-2xl font-bold text-gray-800 mb-4">
//         Career Pathways (Admin)
//       </h2>

//       {/* Add Career */}
//       <div className="mb-6 flex flex-wrap gap-2">
//         <input
//           type="text"
//           placeholder="Title"
//           value={newCareer.title}
//           onChange={(e) =>
//             setNewCareer({ ...newCareer, title: e.target.value })
//           }
//           className="border px-2 py-1 rounded"
//         />
//         <input
//           type="text"
//           placeholder="Details"
//           value={newCareer.details}
//           onChange={(e) =>
//             setNewCareer({ ...newCareer, details: e.target.value })
//           }
//           className="border px-2 py-1 rounded"
//         />
//         <input
//           type="text"
//           placeholder="Degree"
//           value={newCareer.degree}
//           onChange={(e) =>
//             setNewCareer({ ...newCareer, degree: e.target.value })
//           }
//           className="border px-2 py-1 rounded"
//         />
//         <input
//           type="text"
//           placeholder="Stream"
//           value={newCareer.stream}
//           onChange={(e) =>
//             setNewCareer({ ...newCareer, stream: e.target.value })
//           }
//           className="border px-2 py-1 rounded"
//         />
//         <select
//           value={newCareer.demand}
//           onChange={(e) =>
//             setNewCareer({ ...newCareer, demand: e.target.value })
//           }
//           className="border px-2 py-1 rounded"
//         >
//           <option value="Demand">Demand</option>
//           <option value="Not in Demand">Not in Demand</option>
//         </select>
//         <button
//           onClick={addCareer}
//           className="px-3 py-1 bg-green-600 text-white rounded"
//         >
//           Add
//         </button>
//       </div>

//       {/* Careers List */}
//       <div className="grid grid-cols-2 gap-4">
//         {careers.map((career) => (
//           <div
//             key={career.id}
//             className="p-4 bg-white rounded-xl shadow border"
//           >
//             {editingCareer?.id === career.id ? (
//               <>
//                 <input
//                   type="text"
//                   value={editingCareer.title}
//                   onChange={(e) =>
//                     setEditingCareer({ ...editingCareer, title: e.target.value })
//                   }
//                   className="border px-2 py-1 rounded w-full mb-2"
//                 />
//                 <input
//                   type="text"
//                   value={editingCareer.details}
//                   onChange={(e) =>
//                     setEditingCareer({ ...editingCareer, details: e.target.value })
//                   }
//                   className="border px-2 py-1 rounded w-full mb-2"
//                 />
//                 <input
//                   type="text"
//                   value={editingCareer.degree}
//                   onChange={(e) =>
//                     setEditingCareer({ ...editingCareer, degree: e.target.value })
//                   }
//                   className="border px-2 py-1 rounded w-full mb-2"
//                 />
//                 <input
//                   type="text"
//                   value={editingCareer.stream}
//                   onChange={(e) =>
//                     setEditingCareer({ ...editingCareer, stream: e.target.value })
//                   }
//                   className="border px-2 py-1 rounded w-full mb-2"
//                 />
//                 <select
//                   value={editingCareer.demand}
//                   onChange={(e) =>
//                     setEditingCareer({ ...editingCareer, demand: e.target.value })
//                   }
//                   className="border px-2 py-1 rounded w-full mb-2"
//                 >
//                   <option value="Demand">Demand</option>
//                   <option value="Not in Demand">Not in Demand</option>
//                 </select>
//                 <button
//                   onClick={updateCareer}
//                   className="px-2 py-1 bg-blue-600 text-white rounded mr-2"
//                 >
//                   Save
//                 </button>
//                 <button
//                   onClick={() => setEditingCareer(null)}
//                   className="px-2 py-1 bg-gray-500 text-white rounded"
//                 >
//                   Cancel
//                 </button>
//               </>
//             ) : (
//               <>
//                 <h4 className="font-bold text-lg text-gray-800">{career.title}</h4>
//                 <p className="text-sm text-gray-600">{career.details}</p>
//                 <p className="text-sm text-gray-600">
//                   Degree: {career.degree} | Stream: {career.stream} | Status: {career.demand}
//                 </p>
//                 <div className="flex gap-2 mt-3">
//                   <button
//                     onClick={() => setEditingCareer(career)}
//                     className="px-2 py-1 bg-yellow-500 text-white rounded"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => deleteCareer(career.id)}
//                     className="px-2 py-1 bg-red-600 text-white rounded"
//                   >
//                     Delete
//                   </button>
//                   <button
//                     onClick={() => setSelectedCareer(career)}
//                     className="px-2 py-1 bg-gray-700 text-white rounded"
//                   >
//                     View Roadmap
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//       </div>

//       {/* Roadmap Page */}
//       {selectedCareer && (
//         <RoadmapPage
//           career={selectedCareer}
//           onBack={() => setSelectedCareer(null)}
//         />
//       )}
//     </div>
//   );
// }

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
          🧭 Career Pathways
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
