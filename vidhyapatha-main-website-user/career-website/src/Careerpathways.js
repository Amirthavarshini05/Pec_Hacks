// import React, { useState, useEffect, useRef } from "react";
// import { Search, ChevronRight, Target, TrendingUp, GraduationCap } from "lucide-react";
// import { supabase } from "./supabase";
// import RoadmapPage from "./RoadmapPage";

// const CareerPathways = () => {
//   const heroRef = useRef(null);
  
//   const [allCareers, setAllCareers] = useState([]);      
//   const [careerData, setCareerData] = useState({ categories: [], data: {} });
//   const [userQual, setUserQual] = useState("");
//   const [activeTab, setActiveTab] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCareer, setSelectedCareer] = useState(null);
//   const [selectedFilter, setSelectedFilter] = useState("interest"); 
//   const [loading, setLoading] = useState(true);

//   const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");

//   useEffect(() => {
//     const fetchPathways = async () => {
//       setLoading(true);
//       try {
//         // 1. Get User Qualification from Profiles
//         const { data: profile } = await supabase.from("profiles").select("qualification").eq("email", email).maybeSingle();
//         const currentQual = profile?.qualification?.includes("12") ? "12th" : "10th";
//         setUserQual(currentQual);

//         let finalCareers = [];

//         // --- TAB 1: BASED ON MY INTERESTS (Using interest_key mapping) ---
//         if (selectedFilter === "interest") {
//           const { data: iData } = await supabase.from("interest").select("interest").eq("student_id", email).maybeSingle();
//           const userTags = iData?.interest?.recommended_fields || [];

//           if (userTags.length > 0) {
//             // Map raw tags to interest_keys via interest_master table
//             const { data: masterData } = await supabase.from("interest_master").select("interest_key").in("raw_interest", userTags);
//             const interestKeys = [...new Set((masterData || []).map(row => row.interest_key))];

//             if (interestKeys.length > 0) {
//               const { data: res } = await supabase
//                 .from("careers")
//                 .select("*, domains(name)")
//                 .in("interest_key", interestKeys);
//               finalCareers = res || [];
//             }
//           }
//         } 
//         // --- TAB 2: ELIGIBLE CAREERS (Using Stream/Domain logic) ---
//         else {
//           if (currentQual === "10th") {
//             const { data: res } = await supabase.from("careers").select("*, domains(name)");
//             finalCareers = res || [];
//           } else {
//             // 12th graders: Filter by Stream from 12th_profile_data
//             const { data: profile12 } = await supabase.from("12th_profile_data").select("stream").eq("email", email).maybeSingle();
//             const stream = profile12?.stream;

//             const STREAM_MAP = {
//               "PCM": [1, 2, 7], "PCB": [3, 2, 7], "PCMB": [1, 2, 3, 7], "Commerce": [4, 5, 6], "Arts": [6, 7, 5]
//             };

//             if (stream && STREAM_MAP[stream]) {
//               const { data: res } = await supabase
//                 .from("careers")
//                 .select("*, domains(name)")
//                 .in("domain_id", STREAM_MAP[stream]);
//               finalCareers = res || [];
//             }
//           }
//         }

//         // Format data for the UI
//         const formatted = finalCareers.map(c => ({
//           id: c.id,
//           title: c.name,
//           description: `Learn the required skills and roadmap to build a successful career as a ${c.name}.`,
//           domainName: c.domains?.name || "General",
//           salary: "Competitive",
//           trending: true,
//           fullData: c 
//         }));

//         setAllCareers(formatted);

//       } catch (err) {
//         console.error("Error fetching pathways:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (email) fetchPathways();
//   }, [selectedFilter, email]);

//   /* Grouping Logic for Domain Tabs */
//   useEffect(() => {
//     const grouped = {};
//     allCareers.forEach((career) => {
//       const cat = career.domainName;
//       if (!grouped[cat]) grouped[cat] = [];
//       grouped[cat].push(career);
//     });

//     const categories = Object.keys(grouped);
//     setCareerData({ categories, data: grouped });
    
//     if (categories.length > 0 && !categories.includes(activeTab)) {
//       setActiveTab(categories[0]);
//     }
//   }, [allCareers]);

//   const handleCareerClick = (career) => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//     setSelectedCareer(career.fullData); 
//   };

//   if (selectedCareer) {
//     return <RoadmapPage course={selectedCareer} goBack={() => setSelectedCareer(null)} />;
//   }

//   const filteredItems = careerData.data[activeTab]?.filter(c => 
//     c.title.toLowerCase().includes(searchQuery.toLowerCase())
//   ) || [];

//   return (
//     <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
//       {/* Hero Section */}
//       <section ref={heroRef} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 text-center rounded-b-[3rem] shadow-lg">
//         <h1 className="text-4xl font-extrabold mb-2">🚀 Career Pathways</h1>
//         <p className="opacity-90 font-medium">Your personalized career journey for future success.</p>
//       </section>

//       <main className="flex-1 flex flex-col items-center px-6 py-10">
//         {/* Search Bar */}
//         <div className="w-full max-w-xl mb-10">
//           <div className="bg-white rounded-2xl shadow-xl border p-2 flex items-center gap-3">
//             <Search className="ml-4 text-gray-400 w-6 h-6" />
//             <input
//               type="text"
//               placeholder="Search pathways..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full py-4 outline-none text-lg font-semibold bg-transparent"
//             />
//           </div>
//         </div>

//         {/* Filter Toggles */}
//         <div className="flex bg-white rounded-full shadow-lg p-1.5 mb-10 border">
//           <button 
//             onClick={() => setSelectedFilter("interest")} 
//             className={`px-8 py-3 rounded-full font-black text-sm transition-all ${selectedFilter === 'interest' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
//           >
//             <Target className="inline w-4 h-4 mr-2" /> Based on My Interest
//           </button>
//           <button 
//             onClick={() => setSelectedFilter("eligible")} 
//             className={`px-8 py-3 rounded-full font-black text-sm transition-all ${selectedFilter === 'eligible' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
//           >
//             <GraduationCap className="inline w-4 h-4 mr-2" /> Eligible Careers
//           </button>
//         </div>

//         {/* Content Container */}
//         <div className="w-full max-w-5xl bg-white rounded-[2rem] p-10 shadow-xl border border-gray-100">
//           <div className="flex overflow-x-auto space-x-4 mb-8 border-b pb-4 no-scrollbar">
//             {careerData.categories.map((tab) => (
//               <button 
//                 key={tab} 
//                 className={`px-6 py-2 rounded-full font-bold transition-all ${activeTab === tab ? "bg-indigo-100 text-indigo-700" : "text-gray-400 hover:bg-gray-50"}`} 
//                 onClick={() => setActiveTab(tab)}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           {loading ? (
//              <div className="text-center py-10 font-bold text-indigo-600">Finding your path...</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {filteredItems.map((career) => (
//                 <div 
//                   key={career.id} 
//                   className="p-8 bg-slate-50/50 rounded-3xl hover:bg-white hover:shadow-2xl border border-transparent transition-all cursor-pointer group" 
//                   onClick={() => handleCareerClick(career)}
//                 >
//                   <div className="flex justify-between items-start mb-6">
//                     <h3 className="font-black text-2xl text-slate-800 group-hover:text-indigo-600">{career.title}</h3>
//                     <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1">
//                       <TrendingUp className="w-3 h-3"/> Trending
//                     </div>
//                   </div>
//                   <p className="text-slate-600 mb-8 line-clamp-3 font-medium">{career.description}</p>
//                   <div className="flex justify-between items-center pt-5 border-t border-indigo-50">
//                       <span className="text-sm font-black text-green-600">{career.salary} Pay</span>
//                       <div className="p-2 bg-white rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
//                         <ChevronRight className="w-5 h-5" />
//                       </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {!loading && filteredItems.length === 0 && (
//             <div className="text-center py-10 text-gray-400">No pathways found for this category.</div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default CareerPathways;

import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronRight, Target, TrendingUp, GraduationCap, Sparkles } from "lucide-react";
import { supabase } from "./supabase";
import RoadmapPage from "./RoadmapPage";

const CareerPathways = () => {
  const heroRef = useRef(null);
  
  const [allCareers, setAllCareers] = useState([]);      
  const [careerData, setCareerData] = useState({ categories: [], data: {} });
  const [userQual, setUserQual] = useState("");
  const [activeTab, setActiveTab] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("interest"); 
  const [loading, setLoading] = useState(true);

  const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");

  useEffect(() => {
    const fetchPathways = async () => {
      setLoading(true);
      try {
        const { data: profile } = await supabase.from("profiles").select("qualification").eq("email", email).maybeSingle();
        const currentQual = profile?.qualification?.includes("12") ? "12th" : "10th";
        setUserQual(currentQual);

        let finalCareers = [];

        if (selectedFilter === "interest") {
          const { data: iData } = await supabase.from("interest").select("interest").eq("student_id", email).maybeSingle();
          const userTags = iData?.interest?.recommended_fields || [];

          if (userTags.length > 0) {
            const { data: masterData } = await supabase.from("interest_master").select("interest_key").in("raw_interest", userTags);
            const interestKeys = [...new Set((masterData || []).map(row => row.interest_key))];

            if (interestKeys.length > 0) {
              const { data: res } = await supabase
                .from("careers")
                .select("*, domains(name)")
                .in("interest_key", interestKeys);
              finalCareers = res || [];
            }
          }
        } else {
          if (currentQual === "10th") {
            const { data: res } = await supabase.from("careers").select("*, domains(name)");
            finalCareers = res || [];
          } else {
            const { data: profile12 } = await supabase.from("12th_profile_data").select("stream").eq("email", email).maybeSingle();
            const stream = profile12?.stream;

            const STREAM_MAP = {
              "PCM": [1, 2, 7], "PCB": [3, 2, 7], "PCMB": [1, 2, 3, 7], "Commerce": [4, 5, 6], "Arts": [6, 7, 5]
            };

            if (stream && STREAM_MAP[stream]) {
              const { data: res } = await supabase
                .from("careers")
                .select("*, domains(name)")
                .in("domain_id", STREAM_MAP[stream]);
              finalCareers = res || [];
            }
          }
        }

        const formatted = finalCareers.map(c => ({
          id: c.id,
          title: c.name,
          description: `Learn the required skills and roadmap to build a successful career as a ${c.name}.`,
          domainName: c.domains?.name || "General",
          salary: "Competitive",
          trending: true,
          fullData: c 
        }));

        setAllCareers(formatted);

      } catch (err) {
        console.error("Error fetching pathways:", err);
      } finally {
        setLoading(false);
      }
    };

    if (email) fetchPathways();
  }, [selectedFilter, email]);

  useEffect(() => {
    const grouped = {};
    allCareers.forEach((career) => {
      const cat = career.domainName;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(career);
    });

    const categories = Object.keys(grouped);
    setCareerData({ categories, data: grouped });
    
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [allCareers]);

  const handleCareerClick = (career) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setSelectedCareer(career.fullData); 
  };

  if (selectedCareer) {
    return <RoadmapPage course={selectedCareer} goBack={() => setSelectedCareer(null)} />;
  }

  const filteredItems = careerData.data[activeTab]?.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Hero Section - MATCHING OTHER PAGES */}
      <section ref={heroRef} className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
        {/* Floating shapes */}
        <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
        <Sparkles className="absolute top-10 right-10 w-12 h-12 text-white/20 animate-spin-slow" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            🚀 Career Pathways
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            Your personalized career journey for future success
          </p>
        </div>
      </section>

      <main className="flex-1 flex flex-col items-center px-6 py-10">
        {/* Search Bar - MATCHING OTHER PAGES */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center mb-10">

  {/* 🔍 Search */}
  <div className="relative w-full">
    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search pathways..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
    />
  </div>

  {/* 🔀 Filter Toggle */}
  <div className="flex justify-center">
    <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-gray-200">
      <button
        onClick={() => setSelectedFilter("interest")}
        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${
          selectedFilter === "interest"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        <Target className="inline w-4 h-4 mr-2" />
        My Interests
      </button>

      <button
        onClick={() => setSelectedFilter("eligible")}
        className={`px-5 py-2.5 rounded-lg font-bold text-sm transition ${
          selectedFilter === "eligible"
            ? "bg-indigo-600 text-white shadow-sm"
            : "text-gray-500 hover:bg-gray-50"
        }`}
      >
        <GraduationCap className="inline w-4 h-4 mr-2" />
        Eligible Careers
      </button>
    </div>
  </div>

  {/* 🎯 Optional Right Column (keep empty or add filter later) */}
  <div className="hidden lg:block" />
</div>


        {/* Content Container */}
        <div className="w-full max-w-6xl bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          {/* Domain Tabs */}
          <div className="flex overflow-x-auto space-x-3 mb-6 pb-3 border-b border-gray-200 no-scrollbar">
            {careerData.categories.map((tab) => (
              <button 
                key={tab} 
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${activeTab === tab ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "text-gray-500 hover:bg-gray-50"}`} 
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {loading ? (
             <div className="text-center py-16 font-bold text-indigo-600">Finding your path...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((career) => (
                <div 
                  key={career.id} 
                  className="p-6 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl border border-gray-100 hover:border-indigo-200 transition-all cursor-pointer group" 
                  onClick={() => handleCareerClick(career)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-indigo-600 transition-colors leading-tight">
                      {career.title}
                    </h3>
                    {/* <div className="bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                     <TrendingUp className="w-3 h-3"/> Hot
                    </div>*/}
                  </div>
                  <p className="text-gray-600 mb-6 line-clamp-2 text-base leading-relaxed">{career.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-base font-bold text-green-600">{career.salary} Pay</span>
                      <div className="p-2 bg-white rounded-full text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && filteredItems.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-lg">
              No pathways found for this category.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CareerPathways;