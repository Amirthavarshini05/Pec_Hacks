import React, { useEffect, useState } from "react";
import logo from "./assets/logo.png";


import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Bell, User } from "lucide-react";

// Supabase
import { supabase } from "./supabase";

// Pages
import Dashboard from "./Dashboard";
import Suggestedcourses from "./Suggestedcourses";
import Careerpathways from "./Careerpathways";
import Scholarships from "./Scholarships";
import Colleges from "./Colleges";
import LandingPage from "./LandingPage";
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import ProfileSetupBasic from "./ProfileSetupBasic";
import ProfileSetup10th from "./ProfileSetup10th";
import ProfileSetup12th from "./ProfileSetup12th";
import Resources from "./Resources";
import TimelineTracker from "./Timelinetracker";
import AboutUs from "./AboutUs";
import AptitudeLanding from "./AptitudeTestLanding";
import AptitudeTest1 from "./Aptitudetest10";
import AptitudeTest from "./Aptitudetest12";
import RoadmapPage from "./RoadmapPage";
import Examinations from "./Examination";
import ProfileView from "./ProfilePage";

// Auth Callback
import AuthCallback from "./auth/callback";

// --------------------------- NAVBAR ---------------------------
function Navbar({ onLogout }) {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/courses", label: "Courses" },
    { to: "/careerPaths", label: "Career Paths" },
    { to: "/colleges", label: "Colleges" },
    { to: "/scholarships", label: "Scholarships" },
    { to: "/exam", label: "Examinations" },
    { to: "/resources", label: "Resources" },
    
  ];

  return (

    <nav className="backdrop-blur-md bg-white/80 shadow-sm border-b border-gray-200 flex items-center justify-between px-8 py-4 sticky top-0 z-50">
      {/* Left Navigation Items */}
      {/* Left Section: Logo + Navigation */}
<div className="flex items-center space-x-8 w-[55%]">
  {/* Logo */}
  <img
    src={logo}
    alt="VidhyaPatha Logo"
    className="h-10 cursor-pointer"
    onClick={() => navigate("/dashboard")}
  />

  {/* Navigation Items */}
  <div className="flex items-center justify-between w-full">
    {navItems.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        style={{
          color: location.pathname === item.to ? "#2563eb" : "#222",
          fontWeight: location.pathname === item.to ? "bold" : "normal",
        }}
      >
        {item.label}
      </Link>
    ))}
  </div>
</div>


      {/* Right Side Section */}
      <div className="flex items-center space-x-4 relative">
        {/* Aptitude Test Button */}
        <button
          onClick={() => navigate("/aptitude-landing")}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Aptitude Test
        </button>

        {/* Bell */}
        <button className="relative">
          <Bell size={24} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)}>
            <User size={28} className="cursor-pointer" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-md z-50">
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>

              <Link
                to="/timeline"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                Timeline
              </Link>

              <Link
                to="/about"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                About Us
              </Link>

              <button
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setDropdownOpen(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// --------------------------- PRIVATE ROUTE ---------------------------
function PrivateRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

// --------------------------- MAIN APP ---------------------------
function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("isAuthenticated") === "true"
  );

  // useEffect(() => {
  //   const storedAuth = sessionStorage.getItem("isAuthenticated");
  //   if (storedAuth === "true") {
  //     setIsAuthenticated(true);
  //   }
  // }, []);


  const handleLogin = () => {
    sessionStorage.setItem("isAuthenticated", "true");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.clear();
    setIsAuthenticated(false);
  };

  const protectedPaths = [
    "/dashboard",
    "/courses",
    "/careerPaths",
    "/colleges",
    "/scholarships",
    "/resources",
    "/test",
    "/RoadmapPage",
    "/exam",
    "/timeline",
    "/about",
    "/profile",
  ];

  const showNavbar =
    isAuthenticated && protectedPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && location.pathname !== "/test" && <Navbar onLogout={handleLogout} />}

      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn onLogin={handleLogin} />} />
        <Route path="/signup" element={<SignUp onSignup={handleLogin} />} />
        <Route path="/profile-setup-basic" element={<ProfileSetupBasic />} />
        <Route path="/profile-setup-10th" element={<ProfileSetup10th />} />
        <Route path="/profile-setup-12th" element={<ProfileSetup12th />} />

        {/* Supabase Auth Callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Aptitude Landing Logic */}
        <Route
          path="/aptitude-landing"
          element={
            <AptitudeLanding />
          }
        />

        <Route path="/RoadmapPage" element={<RoadmapPage />} />

        {/* Private Pages */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Suggestedcourses />
            </PrivateRoute>
          }
        />

        <Route
          path="/careerPaths"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Careerpathways />
            </PrivateRoute>
          }
        />

        <Route
          path="/colleges"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Colleges />
            </PrivateRoute>
          }
        />

        <Route
          path="/scholarships"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Scholarships />
            </PrivateRoute>
          }
        />

        <Route
          path="/resources"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Resources />
            </PrivateRoute>
          }
        />

        <Route
          path="/timeline"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <TimelineTracker />
            </PrivateRoute>
          }
        />

        <Route
          path="/about"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AboutUs />
            </PrivateRoute>
          }
        />

        <Route
          path="/test"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AptitudeTest />
            </PrivateRoute>
          }
        />

        <Route
          path="/test1"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <AptitudeTest1 />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ProfileView />
            </PrivateRoute>
          }
        />

        <Route
          path="/exam"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Examinations />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

// --------------------------- APP WRAPPER ---------------------------
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
