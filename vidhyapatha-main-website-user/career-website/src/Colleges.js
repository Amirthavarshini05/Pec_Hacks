import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Sparkles,
  MapPin,
  Building2,
  GraduationCap,
  Phone,
  Mail,
  Globe,
  Users,
  BookOpen,
  Wifi,
  Utensils,
  Truck,
  Dumbbell,
  CircleAlert
} from "lucide-react";
import gsap from "gsap";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

const toRad = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 == null ||
    lon1 == null ||
    lat2 == null ||
    lon2 == null
  ) return Infinity;

  const R = 6371; // Earth radius (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};


export default function Colleges() {
  /* ===============================
    1. STATE MANAGEMENT
    ============================== */
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");
  const [selectedCollegeType, setSelectedCollegeType] = useState("");


  // User Data
  const [userPreferences, setUserPreferences] = useState([]);
  const [userStream, setUserStream] = useState(null);

  const [selectedCollege, setSelectedCollege] = useState(null);

  const heroRef = useRef(null);
  const navigate = useNavigate();

  /* ===============================
    2. CHECK ACCESS & FETCH DATA
    ============================== */
  useEffect(() => {
    const init = async () => {
      try {
        const rawQual = sessionStorage.getItem("qualification");
        const email =
          sessionStorage.getItem("userEmail") ||
          sessionStorage.getItem("signUpEmail");

        const qualification =
          rawQual === "10" || rawQual === "10th"
            ? "10"
            : rawQual === "12" || rawQual === "12th"
              ? "12"
              : null;

        if (!qualification || !email) {
          setCanAccess(false);
          setChecking(false);
          return;
        }

        const table =
          qualification === "10"
            ? "10th_profile_data"
            : "12th_profile_data";

        let queryColumns = "preferred_locations";
        if (qualification === "12") queryColumns += ", stream";

        const { data: profile, error: profileError } = await supabase
          .from(table)
          .select(queryColumns)
          .eq("email", email)
          .maybeSingle();



        if (profileError || !profile) {
          console.error("Profile Error:", profileError);
          setCanAccess(false);
        } else {
          setCanAccess(true);


          if (qualification === "12" && profile.stream) {
            setUserStream(profile.stream);
          }

          const { data: geoProfile, error: geoError } = await supabase
            .from("profiles")
            .select("latitude, longitude")
            .eq("email", email)
            .maybeSingle();

          let userLat = null;
          let userLon = null;

          if (geoError) {
            console.error("Geo fetch error:", geoError);
          } else if (geoProfile) {
            userLat = Number(geoProfile.latitude);
            userLon = Number(geoProfile.longitude);
            console.log("User Latitude:", userLat);
            console.log("User Longitude:", userLon);
          } else {
            console.warn("No geolocation found for user");
          }

          const { data: collegeData, error: collegeError } = await supabase
            .from("colleges")
            .select("*");

          if (collegeError) {
            console.error("Error fetching colleges:", collegeError);
            return;
          }

          // Normalize preferred locations
          const preferredLocations = Array.isArray(profile.preferred_locations)
            ? [...new Set(profile.preferred_locations.map(loc => loc.toLowerCase()))]
            : [];

          // 1️⃣ Filter by preferred locations
          const filteredColleges = (collegeData || []).filter(college =>
            preferredLocations.includes((college.state || "").toLowerCase())
          );

          // 2️⃣ Attach distance to each college
          const collegesWithDistance = filteredColleges.map(college => {
            const distanceKm = getDistanceKm(
              userLat,
              userLon,
              Number(college.latitude),
              Number(college.longitude)
            );

            return {
              ...college,
              distanceKm
            };
          });

          // 3️⃣ Sort by nearest first
          const sortedColleges = collegesWithDistance.sort(
            (a, b) => a.distanceKm - b.distanceKm
          );

          console.log("Sorted Colleges (by distance):", sortedColleges);

          setColleges(sortedColleges);

        }
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setChecking(false);
        setLoading(false);
      }
    };

    init();
  }, []);

  /* ===============================
    3. ELIGIBILITY MAPPING
    ============================== */
  const getEligibleDomains = (studentStream) => {
    if (!studentStream) return [];

    const s = studentStream.toUpperCase();

    const map = {
      PCM: ["Engineering", "Science", "Design", "Management", "Law", "Arts", "Commerce"],
      PCB: ["Medical", "Science", "Design", "Management", "Law", "Arts"],
      PCMB: ["Engineering", "Medical", "Science", "Design", "Management", "Law", "Arts", "Commerce"],
      COMMERCE: ["Commerce", "Management", "Law", "Arts", "Design"],
      ARTS: ["Arts", "Law", "Design", "Management"]
    };

    return map[s] || [];
  };

  /* ===============================
    4. ANIMATION
    ============================== */
  useEffect(() => {
    // Animation removed for cleaner experience
  }, [loading]);

  /* ===============================
    5. FILTERING (NO LOCATION LOGIC)
    ============================== */
  const filteredColleges = colleges.filter((college) => {
  const searchValue = search.trim().toLowerCase();
const searchNumber = Number(searchValue);

const matchesSearch =
  !searchValue ||
  college.name?.toLowerCase().includes(searchValue) ||
  college.district?.toLowerCase().includes(searchValue) ||
  college.state?.toLowerCase().includes(searchValue) ||
  (
    !isNaN(searchNumber) &&
    college.distanceKm !== Infinity &&
    college.distanceKm <= searchNumber
  );


  const collegeStream = Array.isArray(college.stream)
    ? college.stream[0]
    : college.stream;

  const matchesDomain = selectedDomain
    ? collegeStream === selectedDomain
    : true;

  const matchesMedium = selectedMedium
    ? college.medium === selectedMedium
    : true;

  // 🔹 NEW: Government / Private filter
  const matchesType = selectedCollegeType
    ? (college.type || "").toLowerCase().includes(selectedCollegeType)
    : true;

  let isEligible = true;
  if (userStream) {
    const eligibleDomains = getEligibleDomains(userStream);
    if (
      eligibleDomains.length > 0 &&
      !eligibleDomains.includes(collegeStream)
    ) {
      isEligible = false;
    }
  }

  return (
    matchesSearch &&
    matchesDomain &&
    matchesMedium &&
    matchesType &&   // 👈 added here
    isEligible
  );
});

  const availableDomains = [
    ...new Set(
      colleges
        .map((c) => (Array.isArray(c.stream) ? c.stream[0] : c.stream))
        .filter(Boolean)
    )
  ];

  const validDropdownDomains = userStream
    ? availableDomains.filter((d) =>
      getEligibleDomains(userStream).includes(d)
    )
    : availableDomains;

  const uniqueMediums = [
    ...new Set(colleges.map((c) => c.medium).filter(Boolean))
  ];

  /* ===============================
    6. RENDER
    ============================== */
  if (checking) return null;

  return (
    <div className="min-h-screen bg-slate-50">

      {!canAccess && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-3 text-gray-800">Profile Incomplete</h2>
            <p className="text-gray-600 mb-6">
              To view colleges based on your preferences, please complete your profile setup first.
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate("/profile")} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">
                Go to Profile
              </button>
              <button onClick={() => navigate("/dashboard")} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-200 transition">
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMPLIFIED HERO */}
      <section ref={heroRef} className="bg-indigo-600 text-white py-20 px-6 rounded-b-[3rem] shadow-xl text-center relative overflow-hidden">
        {/* Floating shapes - No animation */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>
        <Sparkles className="absolute top-10 right-10 w-12 h-12 text-white/20" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-8 flex items-center justify-center gap-3">
            Suggested Colleges <GraduationCap className="w-10 h-10 md:w-12 md:h-12 text-yellow-300" />
          </h1>
        </div>
      </section>

      {/* FILTERS */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full md:w-auto">
            <Search className="absolute left-4 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or district or state..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
  className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
  value={selectedCollegeType}
  onChange={(e) => setSelectedCollegeType(e.target.value)}
>
  <option value="" classname="text-gray-500">All Types</option>
  <option value="government">Government</option>
  <option value="private">Private</option>
</select>


          <select
            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
          >
            <option value="">All Eligible Domains</option>
            {validDropdownDomains.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

         {/*} <select
            className="w-full md:w-48 p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={selectedMedium}
            onChange={(e) => setSelectedMedium(e.target.value)}
          >
            <option value="">All Mediums</option>
            {uniqueMediums.map(m => <option key={m} value={m}>{m}</option>)}
          </select>*/}
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-20 text-indigo-600 font-bold">Loading colleges...</div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed">
            <p className="text-gray-400 font-medium text-lg">
              {userStream
                ? `No eligible colleges found for ${userStream} in your preferred locations.`
                : "No colleges found matching your criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredColleges.map((college) => {
              const collegeStream = Array.isArray(college.stream) ? college.stream[0] : college.stream;
              return (
                <div key={college.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-3">
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        {collegeStream}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <MapPin className="w-3 h-3" /> {college.district}, {college.state}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 leading-tight">{college.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{college.address}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        <span className="font-medium">Degrees:</span>
                        {college.degrees?.slice(0, 3).join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0 mt-auto">
                    <button
                      onClick={() => setSelectedCollege(college)}
                      className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition active:scale-95"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ENHANCED MODAL WITH ALL NEW FIELDS - FIXED */}
      {selectedCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCollege(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] relative z-10 shadow-2xl flex flex-col overflow-hidden">
            {/* Fixed Header */}
            <div className="bg-white p-6 border-b flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800 pr-8">{selectedCollege.name}</h2>
              <button onClick={() => setSelectedCollege(null)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition">✕</button>
            </div>

            {/* Scrollable Content - Hidden Scrollbar */}
            <div className="overflow-y-auto flex-1 scrollbar-hidden">
              <div className="p-6 space-y-6">
              {/* BASIC INFO GRID */}
              <div className="bg-indigo-50 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center"><span className="block text-gray-500 font-bold uppercase text-xs mb-1">Rank</span><span className="font-semibold text-xl text-gray-800">{selectedCollege.rank || "N/A"}</span></div>
                <div className="text-center"><span className="block text-gray-500 font-bold uppercase text-xs mb-1">Type</span><span className="font-semibold text-gray-800">{selectedCollege.type}</span></div>
                <div className="text-center"><span className="block text-gray-500 font-bold uppercase text-xs mb-1">Rating</span><span className="font-semibold text-gray-800">{selectedCollege.rating ? `${selectedCollege.rating}/5` : "N/A"}</span></div>
                <div className="text-center"><span className="block text-gray-500 font-bold uppercase text-xs mb-1">Medium</span><span className="font-semibold text-gray-800">{selectedCollege.medium}</span></div>
              </div>

              {/* LOCATION & CONTACT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    Location
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-gray-800">{selectedCollege.address}</p>
                    <p className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {selectedCollege.district}, {selectedCollege.state}
                    </p>
                    {selectedCollege.geo && (
                      <p className="text-gray-500 text-xs">Lat: {selectedCollege.geo.lat}, Long: {selectedCollege.geo.long}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-indigo-500" />
                    Contact
                  </h3>
                  <div className="space-y-2 text-sm">
                    {selectedCollege.contact && Array.isArray(selectedCollege.contact) && selectedCollege.contact.map((phone, i) => (
                      <p key={i} className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4" /> {phone}
                      </p>
                    ))}
                    {selectedCollege.email && Array.isArray(selectedCollege.email) && selectedCollege.email.map((email, i) => (
                      <p key={i} className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4" /> {email}
                      </p>
                    ))}
                    {selectedCollege.website && (
                      <a href={selectedCollege.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium">
                        <Globe className="w-4 h-4" /> Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* COURSES & ELIGIBILITY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" />
                    Courses Offered
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollege.degrees?.map((deg, i) => (
                      <span key={i} className="px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200">
                        {deg}
                      </span>
                    ))}
                  </div>
                  {selectedCollege.duration && (
                    <p className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                      <CircleAlert className="w-4 h-4" /> Duration: <span className="font-semibold">{selectedCollege.duration}</span>
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CircleAlert className="w-5 h-5 text-indigo-500" />
                    Admission Details
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><span className="font-bold text-gray-800">Eligibility:</span> {selectedCollege.eligible}</li>
                    <li><span className="font-bold text-gray-800">Mode:</span> {selectedCollege.admission_mode}</li>
                    <li><span className="font-bold text-gray-800">Fees:</span> {selectedCollege.fees}</li>
                    {selectedCollege.admission_date && <li><span className="font-bold text-gray-800">Date:</span> {selectedCollege.admission_date}</li>}
                  </ul>
                </div>
              </div>

              {/* FACILITIES */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-500" />
                  Facilities
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                  {selectedCollege.hostel && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Building2 className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.hostel}</span>
                    </div>
                  )}
                  {selectedCollege.lab && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.lab}</span>
                    </div>
                  )}
                  {selectedCollege.lib && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <BookOpen className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.lib}</span>
                    </div>
                  )}
                  {selectedCollege.net && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.net}</span>
                    </div>
                  )}
                  {selectedCollege.food && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Utensils className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.food}</span>
                    </div>
                  )}
                  {selectedCollege.transport && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Truck className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.transport}</span>
                    </div>
                  )}
                  {selectedCollege.sports && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Dumbbell className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.sports}</span>
                    </div>
                  )}
                  {selectedCollege.disable && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <CircleAlert className="w-4 h-4 text-green-500" />
                      <span className="font-medium text-gray-700">{selectedCollege.disable}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* PLACEMENTS & CUT-OFFS */}
              {(selectedCollege.placements || selectedCollege.cutoff || selectedCollege.career || selectedCollege.alumini) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t">
                  {selectedCollege.placements && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Placements
                      </h3>
                      <p className="text-sm text-gray-700 bg-green-50 p-4 rounded-xl">{selectedCollege.placements}</p>
                    </div>
                  )}

                  {selectedCollege.cutoff && Object.keys(selectedCollege.cutoff).length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Cutoffs</h3>
                      <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-2">
                        {Object.entries(selectedCollege.cutoff).map(([exam, details]) => (
                          <div key={exam} className="p-3 bg-white rounded-lg border-l-4 border-indigo-500">
                            <span className="font-bold uppercase text-indigo-600 text-xs">{exam.replace('_', ' ')}:</span>
                            <div className="ml-2 mt-1">
                              {typeof details === 'object'
                                ? Object.entries(details).map(([cat, val]) => (
                                  <span key={cat} className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs mr-2 mb-1">
                                    {cat}: {val}
                                  </span>
                                ))
                                : <span className="font-semibold">{details}</span>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCollege.career && (
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Career Opportunities</h3>
                      <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-xl">{selectedCollege.career}</p>
                    </div>
                  )}

                  {selectedCollege.alumini && (
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-gray-800 mb-3">Alumni Network</h3>
                      <p className="text-sm text-gray-700 bg-purple-50 p-4 rounded-xl">{selectedCollege.alumini}</p>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}