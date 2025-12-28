import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Building2, GraduationCap, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Dashboard = () => {
  const heroRef = useRef(null);
  const cardsRef = useRef([]);
  cardsRef.current = [];

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) cardsRef.current.push(el);
  };

  // Get user name from sessionStorage or fallback
  const name = sessionStorage.getItem("userName") || "User";

  const tips = [
    "Small steps today lead to big success tomorrow.",
    "Your choices shape your future — choose wisely!",
    "Learning never stops, and neither should you.",
    "Opportunities multiply when you prepare for them.",
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  useEffect(() => {
    // Hero animation
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    // Floating shapes
    gsap.to(".floating-shape", {
      y: "-=20",
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut",
      stagger: 0.3,
    });

    // Cards animation - slide from top
    cardsRef.current.forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: -50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          delay: i * 0.2,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: el,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });
  }, []);
 
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-600
        text-white py-20 px-6 md:px-16 rounded-b-3xl overflow-hidden shadow-lg"
      >
        {/* Floating shapes */}
        <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
            Welcome, {name}!
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-6">
            Discover opportunities, shape your career, and unlock your potential 🚀
          </p>

          <div className="flex justify-center gap-4">
            <Link
              to="/courses"
              className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105"
            >
              Explore Courses
            </Link>
            <Link
              to="/colleges"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 rounded-full text-white font-semibold shadow-lg transition transform hover:scale-105"
            >
              Browse Colleges
            </Link>
          </div>
        </div>

        <Sparkles className="absolute top-10 right-10 w-16 h-16 text-white opacity-20 animate-spin-slow" />
      </section>

      {/* Cards */}
      <main className="flex-1 px-6 md:px-16 py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div
            ref={addToRefs}
            className="relative bg-white rounded-2xl p-8 shadow-lg 
            hover:shadow-2xl hover:-translate-y-2 transition transform 
            overflow-hidden group cursor-pointer"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 
            bg-gradient-to-br from-green-400 to-green-600 rounded-full 
            opacity-30 group-hover:opacity-50 animate-pulse"></div>
            <BookOpen className="w-14 h-14 text-green-600 mb-5 animate-bounce-slow" />
            <h3 className="text-xl font-semibold mb-3">Explore Suggested Courses</h3>
            <p className="text-gray-600 mb-4">Find courses suited to your career path.</p>
            <Link to="/courses" className="text-green-600 font-medium hover:underline">
              Start Exploring →
            </Link>
          </div>

          {/* Card 2 */}
          <div
            ref={addToRefs}
            className="relative bg-white rounded-2xl p-8 shadow-lg 
            hover:shadow-2xl hover:-translate-y-2 transition transform 
            overflow-hidden group cursor-pointer"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 
            bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full 
            opacity-30 group-hover:opacity-50 animate-ping-slow"></div>
            <Building2 className="w-14 h-14 text-indigo-600 mb-5 animate-bounce-slow" />
            <h3 className="text-xl font-semibold mb-3">Find Colleges</h3>
            <p className="text-gray-600 mb-4">
              Get recommendations for top colleges for your field.
            </p>
            <Link to="/colleges" className="text-indigo-600 font-medium hover:underline">
              Browse Colleges →
            </Link>
          </div>

          {/* Card 3 */}
          <div
            ref={addToRefs}
            className="relative bg-white rounded-2xl p-8 shadow-lg 
            hover:shadow-2xl hover:-translate-y-2 transition transform 
            overflow-hidden group cursor-pointer"
          >
            <div className="absolute -top-8 -right-8 w-24 h-24 
            bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full 
            opacity-30 group-hover:opacity-50 animate-spin-slow"></div>
            <GraduationCap className="w-14 h-14 text-yellow-600 mb-5 animate-bounce-slow" />
            <h3 className="text-xl font-semibold mb-3">Check Scholarships</h3>
            <p className="text-gray-600 mb-4">Find financial support for your studies.</p>
            <Link to="/scholarships" className="text-yellow-600 font-medium hover:underline">
              View Scholarships →
            </Link>
          </div>
        </div>

        {/* Tip section */}
        <section className="mt-16 bg-blue-50 rounded-2xl p-6 shadow-inner text-center">
          <p className="text-lg italic text-blue-700 animate-pulse">💡 {randomTip}</p>
        </section>
      </main>

      <footer className="bg-white text-gray-600 text-center py-4 border-t border-gray-200 shadow-inner">
        &copy; 2025 Career Guidance Website. All rights reserved.
      </footer>
    </div>
  );
};

export default Dashboard;