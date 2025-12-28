// import React, { useState, useEffect, useRef } from "react";
// import { XCircle, Sparkles, CheckCircle2, ArrowRightCircle, BookOpen, Layout } from "lucide-react";
// import gsap from "gsap";
// import { supabase } from "./supabase";

// const RoadmapPage = ({ course, goBack }) => {
//   const [roadmap, setRoadmap] = useState({});
//   const [selectedSkill, setSelectedSkill] = useState(null);
//   const [requiredSkills, setRequiredSkills] = useState([]);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const heroRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       // 1. Safety check to ensure course object exists
//       if (!course || !course.id) return;

//       setLoading(true);
//       try {
//         const { data: steps } = await supabase
//           .from('career_roadmap_steps')
//           .select(`*, roadmap_step_resources (*)`)
//           .eq('career_id', course.id)
//           .order('order_index');
        
//         if (steps) {
//           const grouped = steps.reduce((acc, s) => {
//             if (!acc[s.level]) acc[s.level] = [];
//             acc[s.level].push({ 
//               id: s.id, 
//               title: s.title, 
//               desc: s.description, 
//               resources: s.roadmap_step_resources || [] 
//             });
//             return acc;
//           }, {});
//           setRoadmap(grouped);
//         }

//         const { data: assets } = await supabase
//           .from('career_assets')
//           .select('name, asset_type')
//           .eq('career_id', course.id);

//         if (assets) {
//           setRequiredSkills(assets.filter(a => a.asset_type === 'skill').map(a => a.name));
//           setProjects(assets.filter(a => a.asset_type === 'project').map(a => a.name));
//         }
//       } catch (err) { 
//         console.error("Database error:", err); 
//       } finally { 
//         setLoading(false); 
//       }
//     };

//     fetchData();
//   }, [course]);

//   // 2. Simple Entrance Animation
//   useEffect(() => {
//     if (!loading && heroRef.current) {
//       gsap.fromTo(heroRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
//     }
//   }, [loading]);

//   // Loading state while fetching
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white font-bold text-indigo-600">
//         Loading Roadmap...
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-indigo-50/30 flex flex-col font-sans">
      
//       {/* --- INDIGO HERO SECTION --- */}
//       <section ref={heroRef} className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl overflow-hidden">
//         <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
//         <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>

//         <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
//           <button 
//             onClick={goBack} 
//             className="absolute left-0 top-0 bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold shadow-md hover:bg-gray-100 transition-all"
//           >
//             Back
//           </button>
          
//           {/* RENDER TITLE DIRECTLY TO AVOID SPLIT ERRORS */}
//           <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight text-center leading-tight">
//             {course.title || "Career Roadmap"}
//           </h1>
          
//           <p className="text-indigo-100 max-w-2xl text-lg font-medium text-center">
//             Your step-by-step master guide to reaching your goal.
//           </p>
//           <Sparkles className="mt-6 w-12 h-12 text-white/30 animate-pulse" />
//         </div>
//       </section>

//       {/* --- VERTICAL TIMELINE ROADMAP --- */}
//       <main className="max-w-4xl mx-auto px-6 py-20 w-full">
//         <div className="relative">
//           {/* Central Vertical Line */}
//           <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-200 -translate-x-1/2 rounded-full"></div>

//           {Object.entries(roadmap).map(([level, items]) => (
//             <div key={level} className="mb-20 relative">
//               {/* Level Indicator Badge */}
//               <div className="flex justify-center mb-12">
//                 <span className="relative z-10 bg-indigo-600 px-6 py-2 rounded-full text-sm font-black text-white uppercase tracking-widest shadow-lg">
//                   {level} Phase
//                 </span>
//               </div>

//               <div className="space-y-12">
//                 {items.map((step, idx) => (
//                   <div 
//                     key={step.id} 
//                     className={`relative flex flex-col md:flex-row items-center gap-8 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
//                   >
//                     {/* The Timeline Circle Dot */}
//                     <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-indigo-600 rounded-full -translate-x-1/2 z-20 shadow-md"></div>
                    
//                     {/* The Card */}
//                     <div className="w-full md:w-[45%]">
//                       <div 
//                         onClick={() => setSelectedSkill(step)}
//                         className="p-8 bg-white rounded-3xl shadow-md border border-indigo-50 hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group"
//                       >
//                         <h3 className="text-xl font-bold text-indigo-900 mb-3 group-hover:text-indigo-600">
//                           {step.title}
//                         </h3>
//                         <p className="text-gray-600 text-sm leading-relaxed">
//                           {step.desc}
//                         </p>
//                         <div className="mt-6 flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider">
//                           <BookOpen className="w-4 h-4" />
//                           View Details
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* --- BOTTOM SECTION: SKILLS & PROJECTS --- */}
//         <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-indigo-100 pt-20">
//           {/* Skills */}
//           <div>
//             <h2 className="text-2xl font-black text-indigo-900 mb-8 flex items-center gap-3">
//               <CheckCircle2 className="text-indigo-500" /> Required Skills
//             </h2>
//             <div className="flex flex-wrap gap-3">
//               {requiredSkills.map((s, i) => (
//                 <span key={i} className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-bold text-sm shadow-sm">
//                   {s}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Projects */}
//           <div>
//             <h2 className="text-2xl font-black text-indigo-900 mb-8 flex items-center gap-3">
//               <Layout className="text-indigo-500" /> Suggested Projects
//             </h2>
//             <div className="space-y-4">
//               {projects.map((p, i) => (
//                 <div key={i} className="p-5 bg-white border-2 border-indigo-50 rounded-2xl font-bold text-indigo-800 shadow-sm">
//                   {p}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* --- SIDE DRAWER FOR RESOURCES --- */}
//       {selectedSkill && (
//         <>
//           <div className="fixed inset-0 bg-indigo-900/20 backdrop-blur-sm z-40" onClick={() => setSelectedSkill(null)}></div>
//           <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-10 flex flex-col">
//             <button onClick={() => setSelectedSkill(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
//               <XCircle className="w-8 h-8" />
//             </button>
            
//             <h2 className="text-3xl font-black text-indigo-900 mb-6">{selectedSkill.title}</h2>
//             <p className="text-gray-600 mb-12 font-medium border-l-4 border-indigo-500 pl-4">{selectedSkill.desc}</p>

//             <h3 className="font-bold text-indigo-900 text-lg mb-6 uppercase tracking-tight">Learning Materials</h3>
//             <div className="space-y-4 overflow-y-auto">
//               {selectedSkill.resources.map((r, i) => (
//                 <a 
//                   key={i} 
//                   href={r.url} 
//                   target="_blank" 
//                   rel="noreferrer" 
//                   className="block p-5 rounded-2xl border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
//                 >
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{r.resource_type}</span>
//                       <p className="font-bold text-gray-800">{r.title}</p>
//                     </div>
//                     <ArrowRightCircle className="w-6 h-6 text-indigo-300 group-hover:text-indigo-600" />
//                   </div>
//                 </a>
//               ))}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default RoadmapPage;

import React, { useState, useEffect, useRef } from "react";
import { XCircle, Sparkles, CheckCircle2, ArrowRightCircle, BookOpen, Layout, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { supabase } from "./supabase";

const RoadmapPage = ({ course, goBack }) => {
  const [roadmap, setRoadmap] = useState({});
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!course || !course.id) return;

      setLoading(true);
      try {
        const { data: steps } = await supabase
          .from('career_roadmap_steps')
          .select(`*, roadmap_step_resources (*)`)
          .eq('career_id', course.id)
          .order('order_index');
        
        if (steps) {
          const grouped = steps.reduce((acc, s) => {
            if (!acc[s.level]) acc[s.level] = [];
            acc[s.level].push({ 
              id: s.id, 
              title: s.title, 
              desc: s.description, 
              resources: s.roadmap_step_resources || [] 
            });
            return acc;
          }, {});
          setRoadmap(grouped);
        }

        const { data: assets } = await supabase
          .from('career_assets')
          .select('name, asset_type')
          .eq('career_id', course.id);

        if (assets) {
          setRequiredSkills(assets.filter(a => a.asset_type === 'skill').map(a => a.name));
          setProjects(assets.filter(a => a.asset_type === 'project').map(a => a.name));
        }
      } catch (err) { 
        console.error("Database error:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchData();
  }, [course]);

  useEffect(() => {
    if (!loading && heroRef.current) {
      gsap.fromTo(heroRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1 });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-bold text-indigo-600">
        Loading Roadmap...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* FIXED HERO SECTION WITH BETTER BACK BUTTON */}
      <section ref={heroRef} className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16 px-6 rounded-b-[3rem] shadow-xl overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>

        {/* BACK BUTTON - FIXED POSITIONING */}
        <div className="relative z-10 max-w-5xl mx-auto mb-6">
          <button 
            onClick={goBack} 
            className="flex items-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold transition-all border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Careers
          </button>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight leading-tight">
            {course.title || "Career Roadmap"}
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg font-medium">
            Your step-by-step master guide to reaching your goal.
          </p>
          <Sparkles className="mt-4 w-10 h-10 text-white/30 animate-pulse mx-auto" />
        </div>
      </section>

      {/* VERTICAL TIMELINE ROADMAP - REDUCED SPACING */}
      <main className="max-w-4xl mx-auto px-6 py-12 w-full">
        <div className="relative">
          {/* Central Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-indigo-200 -translate-x-1/2 rounded-full"></div>

          {Object.entries(roadmap).map(([level, items]) => (
            <div key={level} className="mb-16 relative">
              {/* Level Indicator Badge */}
              <div className="flex justify-center mb-8">
                <span className="relative z-10 bg-indigo-600 px-6 py-2 rounded-full text-sm font-black text-white uppercase tracking-widest shadow-lg">
                  {level} Phase
                </span>
              </div>

              <div className="space-y-10">
                {items.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`relative flex flex-col md:flex-row items-center gap-6 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Timeline Circle Dot */}
                    <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-indigo-600 rounded-full -translate-x-1/2 z-20 shadow-md"></div>
                    
                    {/* The Card */}
                    <div className="w-full md:w-[45%]">
                      <div 
                        onClick={() => setSelectedSkill(step)}
                        className="p-6 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:border-indigo-400 transition-all cursor-pointer group"
                      >
                        <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-indigo-600">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {step.desc}
                        </p>
                        <div className="flex items-center gap-2 text-indigo-500 font-bold text-xs uppercase tracking-wider">
                          <BookOpen className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: SKILLS & PROJECTS - REDUCED SPACING */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-200 pt-12">
          {/* Skills */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-indigo-500 w-5 h-5" /> Required Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((s, i) => (
                <span key={i} className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Layout className="text-indigo-500 w-5 h-5" /> Suggested Projects
            </h2>
            <div className="space-y-3">
              {projects.map((p, i) => (
                <div key={i} className="p-4 bg-white border border-gray-100 rounded-xl font-semibold text-gray-700 shadow-sm text-sm">
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* SIDE DRAWER FOR RESOURCES */}
      {selectedSkill && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedSkill(null)}></div>
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-8 flex flex-col overflow-y-auto">
            <button onClick={() => setSelectedSkill(null)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors">
              <XCircle className="w-7 h-7" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4 pr-10">{selectedSkill.title}</h2>
            <p className="text-gray-600 mb-8 font-medium text-sm border-l-4 border-indigo-500 pl-4 leading-relaxed">{selectedSkill.desc}</p>

            <h3 className="font-bold text-gray-800 text-base mb-4 uppercase tracking-tight">Learning Materials</h3>
            <div className="space-y-3">
              {selectedSkill.resources.map((r, i) => (
                <a 
                  key={i} 
                  href={r.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="block p-4 rounded-xl border border-gray-200 hover:bg-indigo-50 hover:border-indigo-400 transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{r.resource_type}</span>
                      <p className="font-semibold text-gray-800 text-sm mt-1">{r.title}</p>
                    </div>
                    <ArrowRightCircle className="w-5 h-5 text-indigo-300 group-hover:text-indigo-600" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoadmapPage;