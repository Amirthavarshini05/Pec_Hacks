// import React, { useEffect, useState, useRef } from "react";
// import { supabase } from "./supabase";
// import { Search, Sparkles } from "lucide-react";

// export default function SuggestedCourses() {
//   const heroRef = useRef(null);

//   const [courses, setCourses] = useState([]);
//   const [careers, setCareers] = useState([]);
//   const [selectedCareer, setSelectedCareer] = useState("all");
//   const [activeTab, setActiveTab] = useState("interest");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [demandFilter, setDemandFilter] = useState("all"); 
// // values: "all" | "demand"

//   // NORMALIZE QUALIFICATION
//   const rawQual = sessionStorage.getItem("qualification");
//   const qualification = rawQual === "12" ? "12th" : rawQual === "10" ? "10th" : rawQual;
  
//   const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");

//   /* ================= 1. FETCH CAREERS ================= */
//   useEffect(() => {
//     const fetchCareers = async () => {
//       const { data } = await supabase.from("careers").select("id, name").order("name");
//       setCareers(data || []);
//     };
//     fetchCareers();
//   }, []);

//   /* ================= 2. MAIN LOGIC ================= */
//   useEffect(() => {
//     const fetchCourses = async () => {
//       setLoading(true);
//       setError("");

//       if (!email || !qualification) {
//         setError("Please log in.");
//         setLoading(false);
//         return;
//       }

//       try {
//         let finalCourses = [];

//         // --- TAB 1: INTEREST BASED ---
//         if (activeTab === "interest") {
//           const { data: iData } = await supabase.from("interest").select("interest").eq("student_id", email).maybeSingle();
//           const userTags = iData?.interest?.recommended_fields || [];

//           if (userTags.length > 0) {
//             const { data: masterData } = await supabase.from("interest_master").select("interest_key").in("raw_interest", userTags);
//             const interestKeys = [...new Set((masterData || []).map((row) => row.interest_key))];

//             if (interestKeys.length > 0) {
//               // A. Fetch Courses matching interest
//               const coursesPromise = supabase
//                 .from("courses")
//                 .select("*, domains(name)")
//                 .in("interest_key", interestKeys)
//                 .eq("qualification", qualification);

//               // B. If 10th grade, also fetch STREAMS matching interest
//               let streamsRes = { data: [] };
//               if (qualification === "10th") {
//                 streamsRes = await supabase
//                   .from("streams")
//                   .select("id, name, domain_id, domains(name), interest_key")
//                   .in("interest_key", interestKeys);
//               }

//               const coursesRes = await coursesPromise;

//               const formattedStreams = (streamsRes.data || []).map((stream) => ({
//                 id: `stream-${stream.id}`,
//                 course_title: stream.name,
//                 qualification: "11th/12th Stream",
//                 domain_id: stream.domain_id,
//                 domains: stream.domains,
//                 type: "stream",
//               }));

//               const formattedCourses = (coursesRes.data || []).map((course) => ({
//                 ...course,
//                 type: "course",
//               }));

//               finalCourses = [...formattedStreams, ...formattedCourses];
//             }
//           }
//         } 
//         // --- TAB 2: ELIGIBLE ---
//         else {
//           if (qualification === "10th") {
//             const streamsPromise = supabase.from("streams").select("id, name, domain_id, domains(name)");
//             const coursesPromise = supabase.from("courses").select("*, domains(name)").eq("qualification", "10th");

//             const [streamsRes, coursesRes] = await Promise.all([streamsPromise, coursesPromise]);

//             const formattedStreams = (streamsRes.data || []).map((stream) => ({
//               id: `stream-${stream.id}`,
//               course_title: stream.name,
//               qualification: "11th/12th Stream",
//               domain_id: stream.domain_id,
//               domains: stream.domains,
//               type: "stream",
//             }));

//             const formattedCourses = (coursesRes.data || []).map((course) => ({
//               ...course,
//               qualification: course.level === "diploma" ? "After 10th (Diploma)" : course.qualification,
//               type: "course",
//             }));

//             finalCourses = [...formattedStreams, ...formattedCourses];
//           } else {
//             // 12th Logic (Unchanged)
//             const { data: profile } = await supabase.from("12th_profile_data").select("stream").eq("email", email).maybeSingle();
//             const stream = profile?.stream;
//             const STREAM_MAP = { PCM: [1, 2, 7], PCB: [3, 2, 7], PCMB: [1, 2, 3, 7], Commerce: [4, 5, 6], Arts: [6, 7, 5] };

//             if (stream && STREAM_MAP[stream]) {
//               const { data: res } = await supabase.from("courses").select("*, domains(name)").in("domain_id", STREAM_MAP[stream]).eq("qualification", "12th");
//               finalCourses = (res || []).map((c) => ({ ...c, type: "course" }));
//             }
//           }
//         }

//         // --- Career Filter ---
//         if (selectedCareer !== "all") {
//           const { data: mapping } = await supabase.from("course_career_mapping").select("course_id").eq("career_id", selectedCareer);
//           const allowedIds = (mapping || []).map((m) => m.course_id);
//           finalCourses = finalCourses.filter((c) => c.type === "stream" || allowedIds.includes(c.id));
//         }

//         setCourses(finalCourses);
//       } catch (err) {
//         console.error("Fetch error:", err);
//         setError("Unable to load courses.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourses();
//   }, [email, qualification, activeTab, selectedCareer,demandFilter]);

//   // --- FILTERING & GROUPING ---
//   const filteredCourses = courses.filter((c) =>
//     c.course_title.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const groupedDomains = filteredCourses.reduce((acc, course) => {
//     const dId = course.domain_id;
//     const dName = course.domains?.name || "General";
//     if (!acc[dId]) {
//       acc[dId] = { name: dName, items: [] };
//     }
//     acc[dId].items.push(course);
//     return acc;
//   }, {});

//   if (loading) return <div className="p-20 text-center font-bold text-indigo-600">Finding your matches...</div>;
//   if (error) return <div className="p-20 text-center text-red-500">{error}</div>;

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <section ref={heroRef} className="bg-indigo-600 text-white py-16 px-6 rounded-b-[3rem] shadow-xl text-center">
       
//         <h1 className="text-4xl font-extrabold mb-2">Suggested Courses</h1>
//         <p className="opacity-90">
//           {activeTab === "interest" ? "Based on your Interests" : "Based on your Eligibility"}
//         </p>
//       </section>

//       <div className="max-w-7xl mx-auto px-6 py-12">
// <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-10">
//           <div className="relative w-full md:w-96">
//             <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
//             <input
//               type="text"
//               placeholder="Search courses..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-4 py-3 rounded-xl border shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>

//           <div className="flex justify-center">
//   <div className="flex bg-white p-1 rounded-xl shadow-sm border">
//     <button
//       onClick={() => setActiveTab("interest")}
//       className={`px-6 py-2 rounded-lg font-bold transition ${
//         activeTab === "interest"
//           ? "bg-indigo-600 text-white"
//           : "text-gray-500 hover:bg-gray-50"
//       }`}
//     >
//       Based on My Interests
//     </button>

//     <button
//       onClick={() => setActiveTab("eligible")}
//       className={`px-6 py-2 rounded-lg font-bold transition ${
//         activeTab === "eligible"
//           ? "bg-indigo-600 text-white"
//           : "text-gray-500 hover:bg-gray-50"
//       }`}
//     >
//       All Eligible Courses
//     </button>
//   </div>
// </div>


//           <select
//             value={selectedCareer}
//             onChange={(e) => setSelectedCareer(e.target.value)}
//             className="p-3 rounded-xl border bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="all">All Career Goals</option>
//             {careers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
//           </select>
//         </div>

//         {Object.keys(groupedDomains).length > 0 ? (
//           Object.entries(groupedDomains).map(([domainId, { name: domainName, items }]) => (
//             <div key={domainId} className="mb-12">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6 pl-2 border-l-4 border-indigo-500">{domainName}</h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {items.map((course) => (
//                   <div key={course.id} className={`p-6 rounded-2xl shadow-sm border hover:shadow-lg transition flex flex-col h-full ${course.type === "stream" ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"}`}>
//                     <div className="flex justify-between items-start mb-4">
//                       <span className={`text-xs font-black px-2 py-1 rounded uppercase tracking-wider ${course.type === "stream" ? "bg-indigo-200 text-indigo-800" : "bg-indigo-50 text-indigo-700"}`}>{domainName}</span>
//                       {course.demand && (
//                         <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
//                           <Sparkles className="w-3 h-3 fill-emerald-700" /> IN DEMAND
//                         </span>
//                       )}
//                     </div>
//                     <h3 className="text-xl font-bold text-gray-800 leading-tight mb-2">{course.course_title}</h3>
//                     {course.type === "stream" && (
//                         <p className="text-sm text-gray-600 mb-4 line-clamp-2">Select this stream in 11th & 12th to pursue careers in {domainName}.</p>
//                     )}
//                     <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
//                       <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">After 10th</span>
//                       <button className="text-sm font-bold text-indigo-600 hover:underline">View Details</button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
//             <p className="text-gray-400 font-medium text-lg">No courses found matching your criteria.</p>
//             <button onClick={() => setActiveTab("eligible")} className="mt-4 text-indigo-600 font-bold hover:underline">Check Eligible Courses</button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { Search, Target, GraduationCap, Sparkles } from "lucide-react";


export default function SuggestedCourses() {
  const heroRef = useRef(null);

  const [courses, setCourses] = useState([]);
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState("all");
  const [activeTab, setActiveTab] = useState("interest");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demandFilter, setDemandFilter] = useState("all");

  const rawQual = sessionStorage.getItem("qualification");
  const qualification = rawQual === "12" ? "12th" : rawQual === "10" ? "10th" : rawQual;
  const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");

  /* ================= 1. FETCH CAREERS ================= */
  useEffect(() => {
    const fetchCareers = async () => {
      const { data } = await supabase.from("careers").select("id, name").order("name");
      setCareers(data || []);
    };
    fetchCareers();
  }, []);

  /* ================= 2. MAIN LOGIC ================= */
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError("");

      if (!email || !qualification) {
        setError("Please log in.");
        setLoading(false);
        return;
      }

      try {
        let finalCourses = [];

        if (activeTab === "interest") {
          const { data: iData } = await supabase.from("interest").select("interest").eq("student_id", email).maybeSingle();
          const userTags = iData?.interest?.recommended_fields || [];

          if (userTags.length > 0) {
            const { data: masterData } = await supabase.from("interest_master").select("interest_key").in("raw_interest", userTags);
            const interestKeys = [...new Set((masterData || []).map((row) => row.interest_key))];

            if (interestKeys.length > 0) {
              const coursesPromise = supabase
                .from("courses")
                .select("*, domains(name)")
                .in("interest_key", interestKeys)
                .eq("qualification", qualification);

              let streamsRes = { data: [] };
              if (qualification === "10th") {
                streamsRes = await supabase
                  .from("streams")
                  .select("id, name, domain_id, domains(name), interest_key")
                  .in("interest_key", interestKeys);
              }

              const coursesRes = await coursesPromise;

              const formattedStreams = (streamsRes.data || []).map((stream) => ({
                id: `stream-${stream.id}`,
                course_title: stream.name,
                qualification: "11th/12th Stream",
                domain_id: stream.domain_id,
                domains: stream.domains,
                type: "stream",
              }));

              const formattedCourses = (coursesRes.data || []).map((course) => ({
                ...course,
                type: "course",
              }));

              finalCourses = [...formattedStreams, ...formattedCourses];
            }
          }
        } else {
          if (qualification === "10th") {
            const streamsPromise = supabase.from("streams").select("id, name, domain_id, domains(name)");
            const coursesPromise = supabase.from("courses").select("*, domains(name)").eq("qualification", "10th");

            const [streamsRes, coursesRes] = await Promise.all([streamsPromise, coursesPromise]);

            const formattedStreams = (streamsRes.data || []).map((stream) => ({
              id: `stream-${stream.id}`,
              course_title: stream.name,
              qualification: "11th/12th Stream",
              domain_id: stream.domain_id,
              domains: stream.domains,
              type: "stream",
            }));

            const formattedCourses = (coursesRes.data || []).map((course) => ({
              ...course,
              qualification: course.level === "diploma" ? "After 10th (Diploma)" : course.qualification,
              type: "course",
            }));

            finalCourses = [...formattedStreams, ...formattedCourses];
          } else {
            const { data: profile } = await supabase.from("12th_profile_data").select("stream").eq("email", email).maybeSingle();
            const stream = profile?.stream;
            const STREAM_MAP = { PCM: [1, 2, 7], PCB: [3, 2, 7], PCMB: [1, 2, 3, 7], Commerce: [4, 5, 6], Arts: [6, 7, 5] };

            if (stream && STREAM_MAP[stream]) {
              const { data: res } = await supabase.from("courses").select("*, domains(name)").in("domain_id", STREAM_MAP[stream]).eq("qualification", "12th");
              finalCourses = (res || []).map((c) => ({ ...c, type: "course" }));
            }
          }
        }

        if (selectedCareer !== "all") {
          const { data: mapping } = await supabase.from("course_career_mapping").select("course_id").eq("career_id", selectedCareer);
          const allowedIds = (mapping || []).map((m) => m.course_id);
          finalCourses = finalCourses.filter((c) => c.type === "stream" || allowedIds.includes(c.id));
        }

        setCourses(finalCourses);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [email, qualification, activeTab, selectedCareer, demandFilter]);

  const filteredCourses = courses.filter((c) =>
    c.course_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedDomains = filteredCourses.reduce((acc, course) => {
    const dId = course.domain_id;
    const dName = course.domains?.name || "General";
    if (!acc[dId]) {
      acc[dId] = { name: dName, items: [] };
    }
    acc[dId].items.push(course);
    return acc;
  }, {});

  if (loading) return null;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION - MATCHING OTHER PAGES */}
      <section ref={heroRef} className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-visible">
        {/* Floating shapes */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
        <Sparkles className="absolute top-10 right-10 w-12 h-12 text-white/20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            Suggested Courses
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            {activeTab === "interest" ? "Based on your Interests" : "Based on your Eligibility"}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* FILTERS - IMPROVED LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-10">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Tab Toggle */}
          <div className="flex justify-center">
            <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
              <button
                onClick={() => setActiveTab("interest")}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${
                  activeTab === "interest"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                <Target className="inline w-4 h-4 mr-2" />
                My Interests
              </button>
              <button
                onClick={() => setActiveTab("eligible")}
                className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${
                  activeTab === "eligible"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              > 
              <GraduationCap className="inline w-4 h-4 mr-2" />
                All Eligible
              </button>
            </div>
          </div>

          {/* Career Filter */}
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition"
          >
            <option value="all">All Career Goals</option>
            {careers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* COURSES GRID */}
        {Object.keys(groupedDomains).length > 0 ? (
          Object.entries(groupedDomains).map(([domainId, { name: domainName, items }]) => (
            <div key={domainId} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 pl-4 border-l-4 border-indigo-600">
                {domainName}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((course) => (
                  <div
                    key={course.id}
                    className={`p-6 rounded-2xl shadow-sm border hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
                      course.type === "stream"
                        ? "bg-indigo-50 border-indigo-200"
                        : "bg-white border-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                          course.type === "stream"
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {domainName}
                      </span>
                      {course.demand && (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                          <Sparkles className="w-3 h-3 fill-emerald-700" /> IN DEMAND
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 leading-tight mb-3">
                      {course.course_title}
                    </h3>

                    {course.type === "stream" && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        Select this stream in 11th & 12th to pursue careers in {domainName}.
                      </p>
                    )}

                   <div className="mt-auto pt-4 border-t border-gray-200">
                   <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">
                     After {qualification === "10th" ? "10th" : "12th"}
                      </span>
                  </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <p className="text-gray-400 font-medium text-lg mb-4">
              No courses found matching your criteria.
            </p>
            <button
              onClick={() => setActiveTab("eligible")}
              className="text-indigo-600 font-bold hover:underline"
            >
              Check Eligible Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
}