/*import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Calendar,
  MapPin,
  IndianRupee,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Timer,
  ExternalLink,
  X,
  GraduationCap,
  Users,
  Search,
  ChevronRight,
  Filter,
} from "lucide-react";
import gsap from "gsap";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Scholarships() {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // --- STATES ---
  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  const [userData, setUserData] = useState({
    qual: null,
    locations: [],
    firstPref: null,
  });

  const [scholarships, setScholarships] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // --- UI FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterGender, setFilterGender] = useState("All Genders");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  const [selectedSch, setSelectedSch] = useState(null); // For Modal

 
  useEffect(() => {
    const init = async () => {
      try {
        const email =
          sessionStorage.getItem("userEmail") ||
          sessionStorage.getItem("signUpEmail");
        if (!email) {
          setChecking(false);
          return;
        }

        // 1. Fetch Profile
        const { data: mainProfile, error } = await supabase
          .from("profiles")
          .select("qualification")
          .eq("email", email)
          .maybeSingle();

        if (error || !mainProfile) {
          setCanAccess(false);
        } else {
          setCanAccess(true);

          let derivedQual = "10th";
          if (
            mainProfile.qualification &&
            mainProfile.qualification.includes("12")
          )
            derivedQual = "12th";

          // 2. Fetch Preference Locations
          let userLocs = [];
          let firstLocation = null;

          const table =
            derivedQual === "12th" ? "12th_profile_data" : "10th_profile_data";
          const { data: prefData } = await supabase
            .from(table)
            .select("preferred_locations")
            .eq("email", email)
            .maybeSingle();

          if (prefData && prefData.preferred_locations) {
            if (Array.isArray(prefData.preferred_locations)) {
              userLocs = prefData.preferred_locations;
            } else {
              userLocs = prefData.preferred_locations
                .split(",")
                .map((s) => s.trim());
            }
            if (userLocs.length > 0) firstLocation = userLocs[0];
          }

          setUserData({
            qual: derivedQual,
            locations: userLocs,
            firstPref: firstLocation,
          });

          // 3. Fetch Scholarships
          const { data: schData } = await supabase
            .from("scholarships")
            .select("*")
            .order("deadline", { ascending: true });

          setScholarships(schData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    let result = [...scholarships];

    // 1. SEARCH
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. FILTER: TYPE
    if (filterType !== "All Types") {
      result = result.filter((s) => s.type === filterType);
    }

    // 3. FILTER: GENDER (Female / Any only)
    if (filterGender !== "All Genders") {
      result = result.filter(
        (s) =>
          s.gender &&
          (s.gender === filterGender || s.gender === "Any")
      );
    }

    // 4. FILTER: CATEGORY
    if (filterCategory !== "All Categories") {
      result = result.filter(
        (s) =>
          s.category &&
          (s.category.includes(filterCategory) ||
            s.category.includes("Any"))
      );
    }

    // 5. LOCATION LOGIC (India + ALL preferred locations)
    result = result.filter((s) => {
      const region = (s.region || "India").toLowerCase();

      // Always keep national scholarships
      if (region === "india") return true;

      // Keep any scholarship from any preferred location
      if (userData.locations.length > 0) {
        return userData.locations.some(
          (loc) => loc.toLowerCase() === region
        );
      }

      // If there are no preferred locations, hide non‑India
      return false;
    });

    // 6. PRIORITY SORTING:
    //    - Open scholarships first
    //    - Within open/closed, first preferred state on top
    if (userData.firstPref) {
      const pref = userData.firstPref.toLowerCase();
      const now = new Date();

      result.sort((a, b) => {
        const regionA = (a.region || "India").toLowerCase();
        const regionB = (b.region || "India").toLowerCase();

        const isOpenA = new Date(a.deadline) >= now;
        const isOpenB = new Date(b.deadline) >= now;

        // 1) Open before closed
        if (isOpenA && !isOpenB) return -1;
        if (!isOpenA && isOpenB) return 1;

        // 2) Within same open/closed group, first preferred state first
        const isPrefA = regionA === pref;
        const isPrefB = regionB === pref;

        if (isPrefA && !isPrefB) return -1;
        if (!isPrefA && isPrefB) return 1;

        // 3) Otherwise keep original relative order
        return 0;
      });
    }

    setFilteredList(result);
  }, [scholarships, searchTerm, userData, filterType, filterGender, filterCategory]);

  const getStatus = (dateStr) => {
    const now = new Date();
    const end = new Date(dateStr);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (diff < 0)
      return {
        text: "Closed",
        style: "bg-gray-100 text-gray-500 border-gray-200",
        icon: AlertCircle,
      };
    if (diff <= 30)
      return {
        text: `Closing in ${diff} days`,
        style: "bg-red-50 text-red-600 border-red-200 font-bold",
        icon: Timer,
      };
    return {
      text: "Open",
      style: "bg-green-50 text-green-600 border-green-200",
      icon: CheckCircle,
    };
  };

  if (checking) return null;

  return (
    <>
    
      {!canAccess && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 text-center max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-2">Profile Incomplete</h2>
            <p className="text-gray-600 mb-4">
              Please complete your profile to view scholarships.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => navigate("/profile")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col min-h-screen bg-slate-50 font-[Poppins]">
        
     
        <header
          ref={heroRef}
          className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden"
        >
     
        <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg flex items-center justify-center gap-3 flex-wrap">
              <GraduationCap className="w-12 h-12 text-yellow-300" /> Scholarships
            </h1>
            
          </div>
                  <Sparkles className="absolute top-10 right-10 w-16 h-16 opacity-20" />
          
        </header>

      
        <div className="max-w-7xl mx-auto w-full px-6 -mt-8 relative z-20">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-purple-100 flex flex-col xl:flex-row gap-4 items-center justify-between">
    
            <div className="flex items-center gap-3 w-full xl:w-1/3 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scholarships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none text-gray-700 w-full"
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-2 w-full xl:w-auto">
              <select
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm outline-none focus:border-blue-500 cursor-pointer bg-white"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All Types">All Types</option>
                <option value="Merit">Merit Based</option>
                <option value="Means">Means Based</option>
                <option value="Minority">Minority</option>
                <option value="Gender">Gender Specific</option>
                <option value="Disability">Disability</option>
              </select>

              <select
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm outline-none focus:border-blue-500 cursor-pointer bg-white"
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
              >
                <option value="All Genders">All Genders</option>
                <option value="Female">Female</option>
                <option value="Any">Any</option>
              </select>

              <select
                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm outline-none focus:border-blue-500 cursor-pointer bg-white"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="All Categories">All Categories</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="Minority">Minority</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 py-12 max-w-7xl mx-auto w-full">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((s) => {
              const status = getStatus(s.deadline);
              const StatusIcon = status.icon;
              const isPriority =
                userData.firstPref &&
                s.region &&
                s.region.toLowerCase() === userData.firstPref.toLowerCase();

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group relative"
                >
                 { s.region && s.region !== "India" && (
  <div
    className="absolute top-0 right-0
               bg-indigo-600
               text-white text-[10px] font-bold px-3 py-1
               rounded-bl-xl rounded-tr-xl
               flex items-center gap-1 shadow-sm z-10"
  >
    <MapPin className="w-3 h-3" /> {s.region}
  </div>
)}


                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition">
                      <IndianRupee className="w-6 h-6" />
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${status.style}`}
                    >
                      <StatusIcon className="w-3 h-3" /> {status.text}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 leading-tight mb-1">
                    {s.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium mb-4 uppercase tracking-wide">
                    {s.provider}
                  </p>

                  <div className="space-y-3 mb-6 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="font-semibold text-gray-900">
                        {s.amount_benefit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        Deadline:{" "}
                        {new Date(s.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSch(s)}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {filteredList.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">No scholarships found.</p>
              <button
                onClick={() => {
                  setFilterType("All Types");
                  setFilterGender("All Genders");
                  setFilterCategory("All Categories");
                  setSearchTerm("");
                }}
                className="text-blue-600 font-bold mt-2 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {selectedSch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedSch(null)}
            ></div>
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-fade-in-up custom-scrollbar">
              <div className="sticky top-0 bg-white border-b z-20">
                <div className="bg-gradient-to-r from-[#5c3cf0] to-[#7a5cff] p-6 rounded-t-3xl text-white flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedSch.region !== "India" && (
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {selectedSch.region}
                        </span>
                      )}
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                        {selectedSch.type}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold">
                      {selectedSch.name}
                    </h2>
                    <p className="text-sm opacity-90 mt-1">
                      by {selectedSch.provider}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSch(null)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full text-green-700">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-bold uppercase">
                      Scholarship Value
                    </p>
                    <p className="text-xl font-bold text-green-900">
                      {selectedSch.amount_benefit}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" /> About Scheme
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedSch.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-400 font-bold uppercase">
                      Income Limit
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedSch.income_limit
                        ? `₹${selectedSch.income_limit.toLocaleString()}`
                        : "No Limit"}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="block text-xs text-gray-400 font-bold uppercase">
                      Gender
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedSch.gender}
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 col-span-2">
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">
                      Eligible Categories
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedSch.category &&
                        selectedSch.category.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-1 bg-white border border-gray-200 text-xs rounded text-gray-600"
                          >
                            {c}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase">
                      Eligibility Criteria
                    </h3>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 text-xs text-orange-800">
                      {selectedSch.eligibility_details}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase">
                      Documents Needed
                    </h3>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                      {selectedSch.documents_needed &&
                        selectedSch.documents_needed.map((doc) => (
                          <li key={doc}>{doc}</li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <a
                    href={selectedSch.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition active:scale-95 shadow-xl shadow-gray-200"
                  >
                    Apply on Official Portal{" "}
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}*/

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Timer,
  ExternalLink,
  X,
  GraduationCap,
  Search,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

export default function Scholarships() {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  // --- STATES ---
  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  const [userData, setUserData] = useState({
    qual: null,
    locations: [],
    firstPref: null,
  });

  const [scholarships, setScholarships] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  // --- UI FILTERS ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All Types");
  const [filterGender, setFilterGender] = useState("All Genders");
  const [filterCategory, setFilterCategory] = useState("All Categories");

  const [selectedSch, setSelectedSch] = useState(null); // For Modal

  /* =========================================
     1. INIT: DATA FETCHING
     ========================================= */
  useEffect(() => {
    const init = async () => {
      try {
        const email =
          sessionStorage.getItem("userEmail") ||
          sessionStorage.getItem("signUpEmail");
        if (!email) {
          setChecking(false);
          return;
        }

        // 1. Fetch Profile
        const { data: mainProfile, error } = await supabase
          .from("profiles")
          .select("qualification")
          .eq("email", email)
          .maybeSingle();

        if (error || !mainProfile) {
          setCanAccess(false);
        } else {
          setCanAccess(true);

          let derivedQual = "10th";
          if (
            mainProfile.qualification &&
            mainProfile.qualification.includes("12")
          )
            derivedQual = "12th";

          // 2. Fetch Preference Locations
          let userLocs = [];
          let firstLocation = null;

          const table =
            derivedQual === "12th" ? "12th_profile_data" : "10th_profile_data";
          const { data: prefData } = await supabase
            .from(table)
            .select("preferred_locations")
            .eq("email", email)
            .maybeSingle();

          if (prefData && prefData.preferred_locations) {
            if (Array.isArray(prefData.preferred_locations)) {
              userLocs = prefData.preferred_locations;
            } else {
              userLocs = prefData.preferred_locations
                .split(",")
                .map((s) => s.trim());
            }
            if (userLocs.length > 0) firstLocation = userLocs[0];
          }

          setUserData({
            qual: derivedQual,
            locations: userLocs,
            firstPref: firstLocation,
          });

          // 3. Fetch Scholarships
          const { data: schData } = await supabase
            .from("scholarships")
            .select("*")
            .order("deadline", { ascending: true });

          setScholarships(schData || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  /* =========================================
     2. SMART FILTERING & SORTING
     ========================================= */
  useEffect(() => {
    let result = [...scholarships];

    // 1. SEARCH
    if (searchTerm) {
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. FILTER: TYPE
    if (filterType !== "All Types") {
      result = result.filter((s) => s.type === filterType);
    }

    // 3. FILTER: GENDER (Female / Any only)
    if (filterGender !== "All Genders") {
      result = result.filter(
        (s) =>
          s.gender &&
          (s.gender === filterGender || s.gender === "Any")
      );
    }

    // 4. FILTER: CATEGORY
    if (filterCategory !== "All Categories") {
      result = result.filter(
        (s) =>
          s.category &&
          (s.category.includes(filterCategory) ||
            s.category.includes("Any"))
      );
    }

    // 5. LOCATION LOGIC (India + ALL preferred locations)
    result = result.filter((s) => {
      const region = (s.region || "India").toLowerCase();

      // Always keep national scholarships
      if (region === "india") return true;

      // Keep any scholarship from any preferred location
      if (userData.locations.length > 0) {
        return userData.locations.some(
          (loc) => loc.toLowerCase() === region
        );
      }

      // If there are no preferred locations, hide non‑India
      return false;
    });

    // 6. PRIORITY SORTING:
    if (userData.firstPref) {
      const pref = userData.firstPref.toLowerCase();
      const now = new Date();

      result.sort((a, b) => {
        const regionA = (a.region || "India").toLowerCase();
        const regionB = (b.region || "India").toLowerCase();

        const isOpenA = new Date(a.deadline) >= now;
        const isOpenB = new Date(b.deadline) >= now;

        if (isOpenA && !isOpenB) return -1;
        if (!isOpenA && isOpenB) return 1;

        const isPrefA = regionA === pref;
        const isPrefB = regionB === pref;

        if (isPrefA && !isPrefB) return -1;
        if (!isPrefA && isPrefB) return 1;

        return 0;
      });
    }

    setFilteredList(result);
  }, [scholarships, searchTerm, userData, filterType, filterGender, filterCategory]);

  const getStatus = (dateStr) => {
    const now = new Date();
    const end = new Date(dateStr);
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (diff < 0)
      return { text: "Closed", style: "bg-gray-100 text-gray-500 border-gray-200", icon: AlertCircle };
    if (diff <= 30)
      return { text: `Closing in ${diff} days`, style: "bg-red-50 text-red-600 border-red-200 font-bold", icon: Timer };
    return { text: "Open", style: "bg-green-50 text-green-600 border-green-200", icon: CheckCircle };
  };

  if (checking) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* PROFILE INCOMPLETE */}
      {!canAccess && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Profile Incomplete</h2>
            <p className="text-gray-600 mb-6">Please complete your profile to view scholarships.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate("/profile")} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <header ref={heroRef} className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 flex items-center justify-center gap-3">
            Scholarships <GraduationCap className="w-10 h-10 text-yellow-300" />
          </h1>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All Types">All Types</option>
            <option value="Merit">Merit Based</option>
            <option value="Means">Means Based</option>
            <option value="Minority">Minority</option>
            <option value="Gender">Gender Specific</option>
            <option value="Disability">Disability</option>
          </select>

          <select
            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="All Genders">All Genders</option>
            <option value="Female">Female</option>
            <option value="Any">Any</option>
          </select>

          <select
            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All Categories">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="Minority">Minority</option>
          </select>
        </div>
      </div>

      {/* SCHOLARSHIP CARDS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <p className="text-gray-400 font-medium text-lg">No scholarships found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredList.map((s) => {
              const status = getStatus(s.deadline);
              const StatusIcon = status.icon;

              return (
                <div key={s.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition flex flex-col h-full">
                  {/* Region Badge */}
                  {s.region && s.region !== "India" && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3" /> {s.region}
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    
                    <span className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 ${status.style}`}>
                      <StatusIcon className="w-3 h-3" /> {status.text}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1">{s.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{s.provider}</p>

                  <div className="space-y-3 mb-6 text-sm text-gray-600 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{s.amount_benefit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Deadline: {new Date(s.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedSch(s)}
                    className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHOLARSHIP MODAL */}
      {selectedSch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedSch(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl">
            <div className="sticky top-0 bg-white border-b z-20">
              <div className="bg-gradient-to-r from-[#5c3cf0] to-[#7a5cff] p-6 rounded-t-3xl text-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {selectedSch.region !== "India" && (
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedSch.region}
                      </span>
                    )}
                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">{selectedSch.type}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{selectedSch.name}</h2>
                  <p className="text-sm opacity-90 mt-1">by {selectedSch.provider}</p>
                </div>
                <button onClick={() => setSelectedSch(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-4">
                
                <div>
                  <p className="text-xs text-green-600 font-bold uppercase">Scholarship Value</p>
                  <p className="text-xl font-bold text-green-900">{selectedSch.amount_benefit}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> About Scheme
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{selectedSch.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* OFFICIAL WEBSITE LINK */}
{selectedSch.link && (
  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
    <p className="block text-xs text-gray-400 font-bold uppercase mb-1">
      Official Website
    </p>
    <a
      href={selectedSch.link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm font-semibold text-blue-400 flex items-center gap-2 hover:underline"
    >
      Visit Scholarship Website <ExternalLink className="w-4 h-4" />
    </a>
  </div>
)}

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-400 font-bold uppercase">Income Limit</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedSch.income_limit ? `₹${selectedSch.income_limit.toLocaleString()}` : "No Limit"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-400 font-bold uppercase">Gender</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedSch.gender}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-400 font-bold uppercase">Category</span>
                  <span className="text-sm font-semibold text-gray-800">{selectedSch.category}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="block text-xs text-gray-400 font-bold uppercase">Deadline</span>
                  <span className="text-sm font-semibold text-gray-800">{new Date(selectedSch.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedSch.apply_link && (
                <a
                  href={selectedSch.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 text-center rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                >
                  Apply Now <ExternalLink className="inline w-4 h-4 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


