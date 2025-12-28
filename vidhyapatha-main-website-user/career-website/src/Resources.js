// import React, { useState, useEffect, useRef } from "react";
// import gsap from "gsap";
// import { Sparkles } from "lucide-react";
// import { supabase } from "./supabase";

// /* ---------- ICONS ---------- */

// const GradientIcons = {
//   Science: (
//     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
//       <span className="text-white text-2xl">🧪</span>
//     </div>
//   ),
//   Commerce: (
//     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 flex items-center justify-center">
//       <span className="text-white text-2xl">💼</span>
//     </div>
//   ),
//   Arts: (
//     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
//       <span className="text-white text-2xl">🎨</span>
//     </div>
//   ),
//   Default: (
//     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
//       <span className="text-white text-2xl">📘</span>
//     </div>
//   ),
// };

// /* ---------- STREAM DETECTION ---------- */
// const SubjectIcons = {
//   Physics: "⚛️",
//   Chemistry: "🧪",
//   Biology: "🧬",
//   Botany: "🌱",
//   Zoology: "🐾",
//   Mathematics: "📐",
//   Maths: "📐",

//   Accountancy: "📊",
//   Economics: "💹",
//   "Business Studies": "🏢",
//   Commerce: "💼",
//   CSE:"💻",
//   ECE:"📡",
//   History: "🏛️",
//   Geography: "🌍",
//   PoliticalScience: "🗳️",
//   English: "📖",
//   Tamil: "📝",
// };

// const getStreamFromSubject = (subject = "") => {
//   const science = [
//     "Physics",
//     "Chemistry",
//     "Biology",
//     "Botany",
//     "Zoology",
//     "Mathematics",
//     "Maths",
//   ];

//   const commerce = [
//     "Accountancy",
//     "Economics",
//     "Business Studies",
//     "Commerce",
//   ];

//   if (science.includes(subject)) return "Science";
//   if (commerce.includes(subject)) return "Commerce";
//   return "Arts";
// };

// /* ---------- COMPONENT ---------- */

// export default function EBooks() {
//   const heroRef = useRef(null);

//   const [category, setCategory] = useState("12");
//   const [subjects, setSubjects] = useState([]);
//   const [selectedSubject, setSelectedSubject] = useState(null);

//   const [searchSubject, setSearchSubject] = useState("");
//   const [searchResource, setSearchResource] = useState("");
//   const [language, setLanguage] = useState("All");

//   const [loading, setLoading] = useState(true);

//   /* ---------- ANIMATION ---------- */

//   useEffect(() => {
//     if (heroRef.current) {
//       gsap.fromTo(
//         heroRef.current,
//         { opacity: 0, y: -40 },
//         { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
//       );

//       gsap.to(".floating-shape", {
//         y: "-=20",
//         repeat: -1,
//         yoyo: true,
//         duration: 2,
//         ease: "sine.inOut",
//         stagger: 0.3,
//       });
//     }
//   }, []);

//   const SubjectIcon = ({ subject, stream }) => {
//   const icon = SubjectIcons[subject];

//   return (
//     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
//       <span className="text-white text-2xl">
//         {icon || (stream === "Science" ? "🔬" : stream === "Commerce" ? "💼" : "🎨")}
//       </span>
//     </div>
//   );
// };


//   /* ---------- FETCH SUPABASE DATA ---------- */

//   useEffect(() => {
//     const fetchResources = async () => {
//       setLoading(true);

//       const { data, error } = await supabase
//         .from("resource")
//         .select("*")
//         .eq("category", category === "12" ? "12th" : "College")
//         .order("created_at", { ascending: false });
//       console.log("Supabase data:", data);
//       console.log("Error:", error);


//       if (error) {
//         console.error("Supabase error:", error);
//         setLoading(false);
//         return;
//       }

//       const grouped = {};

// data.forEach((row) => {
//   if (!grouped[row.subjects]) {
//     grouped[row.subjects] = {
//       id: row.subjects,
//       title: row.subjects,
//       stream: getStreamFromSubject(row.subjects),
//       resources: [],
//     };
//   }

//   grouped[row.subjects].resources.push({
//     id: row.id,
//     name: row.title || row.subjects,
//     file: row.data,
//     description: row.description,
//     language: row.language?.trim(), // ✅ normalize
//   });
// });


//       setSubjects(Object.values(grouped));
//       setSelectedSubject(null);
//       setLoading(false);
//     };
    
//     fetchResources();
    
//   }, [category]);

//   /* ---------- FILTER SUBJECTS ---------- */

//   const filteredSubjects = subjects.filter((s) =>
//     s.title.toLowerCase().includes(searchSubject.toLowerCase())
//   );

//   /* ---------- UI ---------- */

//   return (
//     <div className="flex flex-col min-h-screen font-[Poppins]">
//       {/* HERO */}
//       <section
//         ref={heroRef}
//         className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6 rounded-b-3xl overflow-hidden"
//       >
//          {/* Floating shapes */}
//         <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
//         <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
//         <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
//         <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>

//         <div className="relative z-10 text-center">
//           <h1 className="text-4xl font-extrabold">📚 Explore E-Books</h1>
//           <p className="mt-3 text-blue-100">
//             Learn with curated digital study materials
//           </p>
//         </div>

//         <Sparkles className="absolute top-10 right-10 w-16 h-16 opacity-20" />
//       </section>

//       <main className="flex-grow bg-gray-50">
//         <div className="max-w-6xl mx-auto px-6 py-10">

//         {/* CONTROLS BAR */}
// <div className="max-w-7xl mx-auto w-full px-6 -mt-16 relative z-20">
//   <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100 flex flex-col xl:flex-row gap-6 items-center justify-between">

//     {/* SEARCH + CATEGORY */}
//     {!selectedSubject && (
//       <div className="flex flex-wrap gap-6 justify-between w-full">
//         <input
//           type="text"
//           placeholder="Search subjects..."
//           className="p-3 border rounded-xl w-full md:w-80"
//           value={searchSubject}
//           onChange={(e) => setSearchSubject(e.target.value)}
//         />

//         <select
//           className="p-3 border rounded-xl w-full md:w-56"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         >
//           <option value="12">12th</option>
//           <option value="college">College</option>
//         </select>
//       </div>
//     )}

//   </div>
// </div>


//           {/* BACK */}
//           {selectedSubject && (
//             <button
//               className="mb-6 px-4 py-2 bg-gray-200 rounded-lg"
//               onClick={() => setSelectedSubject(null)}
//             >
//               ← Back
//             </button>
//           )}

//           {/* LOADING */}
//           {loading && (
//             <p className="text-center text-gray-500">
//               Loading resources...
//             </p>
//           )}

//           {/* SUBJECT GRID */}
//           {!loading && !selectedSubject && (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
//               {filteredSubjects.map((sub) => (
//                 <div
//                   key={sub.id}
//                   onClick={() => setSelectedSubject(sub)}
//                   className="p-6 bg-white shadow rounded-xl hover:shadow-xl cursor-pointer flex flex-col items-center"
//                 >
//                   <SubjectIcon subject={sub.title} stream={sub.stream} />
//                   <h3 className="text-xl font-bold mt-4">{sub.title}</h3>
//                 </div>
//               ))}

//               {filteredSubjects.length === 0 && (
//                 <p className="text-gray-500">No subjects found.</p>
//               )}
//             </div>
//           )}

//           {/* RESOURCES */}
//           {selectedSubject && (
//             <>
//               <div className="flex gap-4 mb-6">
//                 <input
//                   type="text"
//                   placeholder="Search resources..."
//                   className="p-3 border rounded-lg w-80"
//                   value={searchResource}
//                   onChange={(e) => setSearchResource(e.target.value)}
//                 />

//                 <select
//                   className="p-3 border rounded-lg w-40 ml-auto"
//                   value={language}
//                   onChange={(e) => setLanguage(e.target.value)}
//                 >
//                   <option value="All">All Languages</option>
//                   <option value="English">English</option>
//                   <option value="Tamil">Tamil</option>
//                 </select>
//               </div>

//               <div className="space-y-4">
//                 {selectedSubject.resources
//   .filter((r) => {
//   const langMatch =
//     language === "All" ||
//     r.language?.toLowerCase() === language.toLowerCase();

//   const searchMatch =
//     r.name?.toLowerCase().includes(searchResource.toLowerCase());

//   return langMatch && searchMatch;
// })

//   .map((res) => (
//     <div key={res.id} className="p-4 bg-white shadow rounded-xl">
//       <a
//         href={res.file}
//         target="_blank"
//         rel="noreferrer"
//         className="block p-3 bg-gray-50 rounded-md hover:bg-gray-100"
//       >
//         📄 <strong>{res.name}</strong>
//         <p className="text-sm text-gray-500 mt-1">
//           {res.description}
//         </p>
//       </a>
//     </div>
//   ))}


//                 {selectedSubject.resources.length === 0 && (
//                   <p className="text-gray-500">No resources found.</p>
//                 )}
//               </div>
//             </>
//           )}
//         </div>
//       </main>

//       <footer className="bg-white text-center py-4 border-t">
//         © 2025 Career Website
//       </footer>
//     </div>
//   );
// }
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Search, ArrowLeft, BookOpen } from "lucide-react";
import { supabase } from "./supabase";

/* ---------- ICONS ---------- */

const SubjectIcons = {
  Physics: "⚛️",
  Chemistry: "🧪",
  Biology: "🧬",
  Botany: "🌱",
  Zoology: "🐾",
  Mathematics: "📐",
  Maths: "📐",
  Accountancy: "📊",
  Economics: "💹",
  "Business Studies": "🏢",
  Commerce: "💼",
  CSE: "💻",
  ECE: "📡",
  History: "🏛️",
  Geography: "🌍",
  PoliticalScience: "🗳️",
  English: "📖",
  Tamil: "📝",
};

const getStreamFromSubject = (subject = "") => {
  const science = ["Physics", "Chemistry", "Biology", "Botany", "Zoology", "Mathematics", "Maths"];
  const commerce = ["Accountancy", "Economics", "Business Studies", "Commerce"];
  if (science.includes(subject)) return "Science";
  if (commerce.includes(subject)) return "Commerce";
  return "Arts";
};

const SubjectIcon = ({ subject, stream }) => {
  const icon = SubjectIcons[subject];
  return (
    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg mx-auto">
      <span className="text-white text-2xl">
        {icon || (stream === "Science" ? "🔬" : stream === "Commerce" ? "💼" : "🎨")}
      </span>
    </div>
  );
};

/* ---------- COMPONENT ---------- */

export default function EBooks() {
  const heroRef = useRef(null);

  const EMAIL =
    sessionStorage.getItem("userEmail") ||
    sessionStorage.getItem("signUpEmail");

  const [category, setCategory] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [searchSubject, setSearchSubject] = useState("");
  const [searchResource, setSearchResource] = useState("");
  const [language, setLanguage] = useState("All");
  const [loading, setLoading] = useState(true);

  /* ---------- FETCH PROFILE ---------- */

  useEffect(() => {
    const fetchProfile = async () => {
      if (!EMAIL) return;

      const { data } = await supabase
        .from("profiles")
        .select("qualification")
        .eq("email", EMAIL)
        .maybeSingle();

      if (!data?.qualification) return;

      const q = data.qualification.toLowerCase();
      if (q.includes("10")) setCategory("12th");
      else if (q.includes("12")) setCategory("College");
    };

    fetchProfile();
  }, [EMAIL]);

  /* ---------- FETCH RESOURCES ---------- */

  useEffect(() => {
    if (!category) return;

    const fetchResources = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("resource")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      const grouped = {};

      data?.forEach((row) => {
        if (!grouped[row.subjects]) {
          grouped[row.subjects] = {
            id: row.subjects,
            title: row.subjects,
            stream: getStreamFromSubject(row.subjects),
            resources: [],
          };
        }

        grouped[row.subjects].resources.push({
          id: row.id,
          name: row.title || row.subjects,
          file: row.data,
          description: row.description,
          language: row.language?.trim(),
        });
      });

      setSubjects(Object.values(grouped));
      setSelectedSubject(null);
      setLoading(false);
    };

    fetchResources();
  }, [category]);

  const filteredSubjects = subjects.filter((s) =>
    s.title.toLowerCase().includes(searchSubject.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* HERO */}
      <section
        ref={heroRef}
        className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden"
      >
        <Sparkles className="absolute top-10 right-10 w-12 h-12 text-white/20" />
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-12 h-12 text-yellow-300" />
          Explore E-Books
        </h1>
        <p className="text-lg opacity-90">
          Curated study materials for <b>{category}</b>
        </p>
      </section>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-6 py-12">

          {/* BACK BUTTON – OUTSIDE CONTAINER */}
          {selectedSubject && (
            <button
              className="mb-4 flex items-center gap-2 px-5 py-3 bg-white shadow rounded-2xl font-bold hover:bg-gray-100"
              onClick={() => setSelectedSubject(null)}
            >
              <ArrowLeft size={16} /> Back to Subjects
            </button>
          )}

          {/* CONTROLS BAR */}
          <div className="mb-10 relative z-20">
            <div className="bg-white p-6 rounded-3xl shadow-2xl border flex flex-col lg:flex-row gap-4">
              {!selectedSubject ? (
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    className="w-full pl-12 pr-4 py-3 rounded-2xl border-2"
                    value={searchSubject}
                    onChange={(e) => setSearchSubject(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="relative flex-grow">
                    <Search className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search resources..."
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border-2"
                      value={searchResource}
                      onChange={(e) => setSearchResource(e.target.value)}
                    />
                  </div>

                  <select
                    className="p-3 rounded-2xl border-2"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="All">All Languages</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* SUBJECT GRID */}
          {!loading && !selectedSubject && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((sub) => (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className="group p-6 bg-white rounded-2xl shadow hover:shadow-xl cursor-pointer text-center"
                >
                  <SubjectIcon subject={sub.title} stream={sub.stream} />
                  <h3 className="text-xl font-bold mt-4">{sub.title}</h3>
                  <p className="text-sm text-gray-500">
                    {sub.resources.length} Resources
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* RESOURCE LIST (NO DOWNLOAD ICON) */}
          {!loading && selectedSubject && (
            <div className="space-y-4">
              {selectedSubject.resources
                .filter(
                  (r) =>
                    (language === "All" ||
                      r.language?.toLowerCase() === language.toLowerCase()) &&
                    r.name.toLowerCase().includes(searchResource.toLowerCase())
                )
                .map((res) => (
                  <a
                    key={res.id}
                    href={res.file}
                    target="_blank"
                    rel="noreferrer"
                    className="block p-5 bg-white rounded-2xl shadow hover:shadow-lg"
                  >
                    <h4 className="font-bold text-lg">{res.name}</h4>
                    {res.description && (
                      <p className="text-sm text-gray-600">{res.description}</p>
                    )}
                  </a>
                ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white text-center py-4 border-t">
        © 2025 Career Guidance Website
      </footer>
    </div>
  );
}
