import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

export default function AdminCoursesView({ initialQualification = "10" }) {
  const [qualification, setQualification] = useState(initialQualification);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* NEW FILTER STATES */
  const [domainFilter, setDomainFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");

  /* FILTER OPTIONS */
  const [domains, setDomains] = useState([]);
  const [interestKeys, setInterestKeys] = useState([]);

  /* ---------------- LOAD FILTER OPTIONS ---------------- */
  useEffect(() => {
    const loadFilters = async () => {
      const { data: domainData } = await supabase
        .from("domains")
        .select("id,name")
        .order("name");

      const { data: interestData } = await supabase
        .from("courses")
        .select("interest_key");

      setDomains(domainData || []);
      setInterestKeys([
        ...new Set((interestData || []).map(i => i.interest_key).filter(Boolean)),
      ]);
    };

    loadFilters();
  }, []);

  /* ---------------- FETCH COURSES ---------------- */
  const fetchCourses = useCallback(async () => {
    setLoading(true);

    let q = supabase
      .from("courses")
      .select(`
        id,
        course_title,
        qualification,
        interest_key,
        domains (
          id,
          name
        ),
        degrees (
          id,
          name
        )
      `)
      .order("course_title", { ascending: true });

    q =
      qualification === "10"
        ? q.eq("qualification", "10th")
        : q.eq("qualification", "12th");

    if (search) {
      q = q.ilike("course_title", `%${search}%`);
    }

    if (domainFilter) {
      q = q.eq("domain_id", domainFilter);
    }

    if (interestFilter) {
      q = q.eq("interest_key", interestFilter);
    }

    const { data, error } = await q;

    if (error) {
      console.error(error);
      alert("Failed to load courses");
    }

    setData(data || []);
    setLoading(false);
  }, [qualification, search, domainFilter, interestFilter]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-indigo-700">
          {qualification === "10" ? "10th Subjects" : "12th Courses"}
        </h1>
      </div>

      {/* SEARCH + TOGGLE + FILTERS */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Search subject / course"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded md:col-span-2"
          />

          {/* TOGGLE */}
          <div className="flex gap-2">
            {["10", "12"].map(q => (
              <button
                key={q}
                onClick={() => setQualification(q)}
                className={`px-4 py-2 rounded w-full ${
                  qualification === q
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100"
                }`}
              >
                {q}th
              </button>
            ))}
          </div>

          {/* DOMAIN FILTER */}
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Domains</option>
            {domains.map(d => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* INTEREST KEY FILTER */}
          <select
            value={interestFilter}
            onChange={(e) => setInterestFilter(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Interest Keys</option>
            {interestKeys.map(k => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <p className="p-4">Loading...</p>
        ) : (
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Course</th>
                <th className="border p-2">Qualification</th>
                <th className="border p-2">Domain</th>
                <th className="border p-2">Degree</th>
                <th className="border p-2">Interest Key</th>
              </tr>
            </thead>

            <tbody>
              {data.map(c => (
                <tr key={c.id}>
                  <td className="border p-2 font-semibold">
                    {c.course_title}
                  </td>

                  <td className="border p-2">
                    {c.qualification}
                  </td>

                  <td className="border p-2">
                    {c.domains?.name || "-"}
                  </td>

                  <td className="border p-2">
                    {c.degrees?.name || "-"}
                  </td>

                  <td className="border p-2">
                    {c.interest_key || "-"}
                  </td>
                </tr>
              ))}

              {!data.length && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
