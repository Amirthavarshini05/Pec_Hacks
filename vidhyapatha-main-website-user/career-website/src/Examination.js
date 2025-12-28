import React, { useState, useEffect, useRef } from "react";
import { Award, Calendar, ExternalLink, Clock, Sparkles, ChevronRight, X, FileText, Timer, BookOpen, AlertCircle, CheckCircle, DollarSign, BarChart3, GraduationCap, Users, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Examinations() {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);
  const [exams, setExams] = useState([]);
  
  const [userData, setUserData] = useState({
    age: null,
    stream: null,
    qual: null,
    locations: [] 
  });

  const [searchName, setSearchName] = useState("");
  const [filterType, setFilterType] = useState("Eligible");
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");
        
        if (!email) {
            setChecking(false);
            return;
        }

        const { data: mainProfile, error: mainError } = await supabase
          .from("profiles")
          .select("dob, qualification")
          .eq("email", email)
          .maybeSingle();

        if (mainError || !mainProfile) {
          setCanAccess(false);
        } else {
          setCanAccess(true);
          
          let derivedQual = "10th";
          if (mainProfile.qualification && mainProfile.qualification.includes("12")) {
             derivedQual = "12th";
          }

          let derivedStream = null;
          let rawLocations = null;

          if (derivedQual === "12th") {
             const { data: profile12 } = await supabase
                .from("12th_profile_data")
                .select("stream, preferred_locations")
                .eq("email", email)
                .maybeSingle();
             
             if (profile12) {
                derivedStream = profile12.stream ? profile12.stream.trim().toUpperCase() : null;
                rawLocations = profile12.preferred_locations;
             }
          } else {
             const { data: profile10 } = await supabase
                .from("10th_profile_data")
                .select("preferred_locations")
                .eq("email", email)
                .maybeSingle();
             
             if (profile10) {
                rawLocations = profile10.preferred_locations;
             }
          }

          let derivedAge = null;
          if (mainProfile.dob) {
            const dob = new Date(mainProfile.dob);
            const today = new Date();
            derivedAge = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
               derivedAge--;
            }
          }

          let userLocs = [];
          if (rawLocations) {
              if (Array.isArray(rawLocations)) {
                  userLocs = rawLocations;
              } else if (typeof rawLocations === 'string') {
                  userLocs = rawLocations.split(',').map(s => s.trim());
              }
          }

          setUserData({ age: derivedAge, qual: derivedQual, stream: derivedStream, locations: userLocs });

          const { data: examData } = await supabase
            .from("examinations")
            .select("*")
            .order('exam_date', { ascending: true });

          setExams(examData || []);
        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setChecking(false);
      }
    };

    init();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.name.toLowerCase().includes(searchName.toLowerCase()) || 
                          (exam.short_name && exam.short_name.toLowerCase().includes(searchName.toLowerCase()));
    if (!matchesSearch) return false;

    const examRegion = exam.region || "India";
    
    if (examRegion !== "India") {
        if (userData.locations.length > 0) {
            const isPreferred = userData.locations.some(
                loc => loc.toLowerCase() === examRegion.toLowerCase()
            );
            if (!isPreferred) return false; 
        } else {
            return false; 
        }
    }

    if (filterType === "Eligible") {
        if (userData.qual === "10th" && (exam.qual_level === "12th" || exam.qual_level === "Graduate")) return false;

        if (userData.qual === "12th") {
            if (userData.stream) {
                if (exam.allowed_streams && exam.allowed_streams.length > 0) {
                    const allowedUpper = exam.allowed_streams.map(s => s.toUpperCase());
                    
                    let isStreamMatch = allowedUpper.includes(userData.stream);

                    if (userData.stream === 'PCMB') {
                        if (allowedUpper.includes('PCM') || 
                            allowedUpper.includes('PCB') || 
                            allowedUpper.includes('PCMB') ||
                            allowedUpper.includes('SCIENCE')) {
                            isStreamMatch = true;
                        }
                    }

                    if (!isStreamMatch) return false;
                }
            } else {
                if (exam.allowed_streams && exam.allowed_streams.length > 0) return false;
            }
        }

        if (userData.age && exam.max_age && userData.age > exam.max_age) return false;
    }

    return true;
  });

  const getStatus = (exam) => {
    if (userData.qual === "10th" && (exam.qual_level === "12th" || exam.qual_level === "Graduate")) {
        return { text: "Future Goal", style: "bg-purple-100 text-purple-700 border-purple-200", icon: Sparkles };
    }
    if (userData.qual === "12th" && exam.qual_level === "Graduate") {
        return { text: "Future Goal", style: "bg-purple-100 text-purple-700 border-purple-200", icon: Sparkles };
    }

    if (userData.age && exam.min_age && userData.age < exam.min_age) {
        const diff = exam.min_age - userData.age;
        return { text: `Eligible in ${diff} Yr${diff > 1 ? 's' : ''}`, style: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock };
    }

    const now = new Date();
    const start = new Date(exam.application_start);
    const end = new Date(exam.application_end);

    if (now < start) return { text: "Upcoming", style: "bg-blue-100 text-blue-700 border-blue-200", icon: Calendar };
    if (now >= start && now <= end) {
        const diff = Math.ceil(Math.abs(end - now) / (1000 * 60 * 60 * 24));
        if (diff <= 7) return { text: `Closing in ${diff} days!`, style: "bg-red-100 text-red-700 border-red-200 font-bold", icon: Timer };
        return { text: "Applications Open", style: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle };
    }
    return { text: "Closed", style: "bg-gray-100 text-gray-500 border-gray-200", icon: AlertCircle };
  };

if (checking) return null;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      
      {!canAccess && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-2xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Profile Incomplete</h2>
            <p className="text-gray-600 mb-6">Please complete your profile to view exams.</p>
            <button onClick={() => navigate("/profile")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition transform hover:scale-105">
              Go to Profile
            </button>
          </div>
        </div>
      )}

      {/* HERO SECTION - MATCHING OTHER PAGES */}
      <header ref={heroRef} className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
        <Sparkles className="absolute top-10 right-10 w-12 h-12 text-white/20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg flex items-center justify-center gap-3 flex-wrap">
            <FileText className="w-12 h-12 text-yellow-300" /> 
            Entrance Exams
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            {userData.stream ? `Curated for ${userData.stream} Students` : "Find exams matching your profile"}
          </p>
        </div>
      </header>

      {/* CONTROLS - IMPROVED */}
      <div className="max-w-7xl mx-auto w-full px-6 -mt-8 relative z-20">
        <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative flex-grow w-full md:w-auto">
             <input 
               type="text" 
               placeholder="Search exams (e.g. JEE, NDA)..." 
               value={searchName}
               onChange={(e) => setSearchName(e.target.value)}
               className="w-full pl-4 pr-4 py-3 rounded-2xl border-2 border-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
             />
           </div>
           <div className="flex bg-gray-50 p-1.5 rounded-xl border border-gray-200">
              <button 
                onClick={() => setFilterType("Eligible")} 
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${filterType === "Eligible" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-white"}`}
              >
                For Me
              </button>
              <button 
                onClick={() => setFilterType("All")} 
                className={`px-6 py-2.5 rounded-lg text-sm font-bold transition ${filterType === "All" ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-white"}`}
              >
                All Exams
              </button>
           </div>
        </div>
      </div>

      {/* EXAM GRID */}
      <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
         {filteredExams.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
               <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-400 font-medium text-lg mb-4">No exams found matching your criteria.</p>
               <button onClick={() => setFilterType("All")} className="text-indigo-600 font-bold hover:underline">
                 View all exams
               </button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExams.map(exam => {
                const status = getStatus(exam);
                const StatusIcon = status.icon;
                
                return (
                    <div key={exam.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full relative group">
                        
                       {exam.region && exam.region !== 'India' && (
  <div className="absolute top-0 right-0
                  bg-indigo-600
                  text-white text-xs font-bold
                  px-3 py-1.5
                  rounded-bl-xl rounded-tr-2xl
                  flex items-center gap-1 z-10 shadow-md">
    <MapPin className="w-3 h-3" /> {exam.region}
  </div>
)}


                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:scale-110 transition border border-indigo-100">
                                <Award className="w-6 h-6" />
                            </div>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${status.style}`}>
                                <StatusIcon className="w-3 h-3" /> {status.text}
                            </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{exam.short_name || exam.name}</h3>
                        <p className="text-sm text-gray-500 font-semibold mb-4">{exam.provider}</p>
                        
                        <div className="space-y-3 mb-6 text-sm text-gray-600 flex-grow">
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <span>Age: <span className="font-bold text-gray-800">{exam.min_age}-{exam.max_age}</span></span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                                <Calendar className="w-4 h-4 text-indigo-500" />
                                <span className="font-semibold">Exam: {new Date(exam.exam_date).toLocaleDateString()}</span>
                            </div>
                        </div>

                        <button 
                          onClick={() => setSelectedExam(exam)} 
                          className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                        >
                            View Details <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                );
                })}
            </div>
         )}
      </div>

      {/* DETAILED MODAL - WITH HIDDEN SCROLLBAR */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedExam(null)}></div>
           <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] relative z-10 shadow-2xl flex flex-col overflow-hidden">
              
              {/* Fixed Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl text-white flex justify-between items-start flex-shrink-0 shadow-lg">
                 <div className="flex-1 pr-4">
                     <div className="flex items-center gap-3 flex-wrap mb-2">
                         <h2 className="text-2xl md:text-3xl font-bold">{selectedExam.name}</h2>
                         {selectedExam.region && selectedExam.region !== 'India' && (
                             <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                                 <MapPin className="w-3 h-3"/> {selectedExam.region}
                             </span>
                         )}
                     </div>
                     <div className="flex items-center gap-2 opacity-90">
                         <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">{selectedExam.short_name}</span>
                         <span className="text-sm">by {selectedExam.provider}</span>
                     </div>
                 </div>
                 <button 
                   onClick={() => setSelectedExam(null)} 
                   className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition transform hover:scale-110 hover:rotate-90 duration-300 flex-shrink-0"
                 >
                   <X className="w-6 h-6"/>
                 </button>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 scrollbar-hidden">
                <div className="p-8 space-y-6">
                 {selectedExam.allowed_streams && selectedExam.allowed_streams.length > 0 && (
                    <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Who Can Apply?</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedExam.allowed_streams.map(s => (
                                <span key={s} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 text-sm font-bold rounded-full shadow-sm">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                 )}

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                       <DollarSign className="w-5 h-5 text-green-500 mb-2" />
                       <span className="text-xs text-gray-500 uppercase font-bold">Fees</span>
                       <span className="text-base font-bold text-gray-800">{selectedExam.fees}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                       <BarChart3 className="w-5 h-5 text-orange-500 mb-2" />
                       <span className="text-xs text-gray-500 uppercase font-bold">Difficulty</span>
                       <span className="text-base font-bold text-gray-800">{selectedExam.difficulty}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                       <FileText className="w-5 h-5 text-blue-500 mb-2" />
                       <span className="text-xs text-gray-500 uppercase font-bold">Pattern</span>
                       <span className="text-sm font-bold text-gray-800 line-clamp-1" title={selectedExam.pattern}>{selectedExam.pattern}</span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center text-center">
                       <GraduationCap className="w-5 h-5 text-purple-500 mb-2" />
                       <span className="text-xs text-gray-500 uppercase font-bold">Age Limit</span>
                       <span className="text-base font-bold text-gray-800">{selectedExam.min_age} - {selectedExam.max_age}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      {selectedExam.website && (
  <div className="flex justify-start">
    <a
      href={selectedExam.website}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition"
    >
      Official Website <ExternalLink className="w-4 h-4" />
    </a>
  </div>
)}

                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600"/> About Exam
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {selectedExam.description}
                            </p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-base font-bold text-gray-800 mb-3">Syllabus Overview</h3>
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-orange-900 text-sm">
                                {selectedExam.syllabus_hint || "Please refer to the official website for detailed syllabus."}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                            <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-indigo-600"/> Important Dates
                            </h3>
                            <div className="space-y-4 relative">
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200"></div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Applications Start</p>
                                    <p className="text-sm font-bold text-gray-800">{new Date(selectedExam.application_start).toLocaleDateString()}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-purple-500 rounded-full border-2 border-white"></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Applications End</p>
                                    <p className="text-sm font-bold text-gray-800">{new Date(selectedExam.application_end).toLocaleDateString()}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Exam Date</p>
                                    <p className="text-sm font-bold text-gray-800">{new Date(selectedExam.exam_date).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* <div className="pt-4">
                    <a 
                      href={selectedExam.website} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg group"
                    >
                       Visit Official Website <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                 </div> */}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

