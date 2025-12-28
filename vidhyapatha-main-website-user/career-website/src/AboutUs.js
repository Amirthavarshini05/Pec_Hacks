import React, { useRef, useEffect } from "react";
import { Users, BookOpen, CalendarCheck, Sparkles } from "lucide-react";
import gsap from "gsap";

const AboutUs = ({ goBack }) => {
  const heroRef = useRef(null);

  useEffect(() => {
    if (heroRef.current) {
      // Hero fade-in animation
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: -50 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
      );

      // Floating bubble animation
      gsap.to(".floating-shape", {
        y: "-=20",
        repeat: -1,
        yoyo: true,
        duration: 2,
        ease: "sine.inOut",
        stagger: 0.3,
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">

      {/* ---------------- HEADER WITH FLOATING BUBBLES ---------------- */}
      <header
        ref={heroRef}
        className="relative bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-20 px-6 md:px-16 overflow-hidden shadow-lg rounded-b-3xl"
      >

        {/* Floating shapes */}
        <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 flex justify-center items-center gap-3">
            <span className="animate-bounce text-yellow-300 text-5xl">🌟</span>
             About Us
          </h1>
          <p className="text-lg opacity-90">
            How we help students shape their future with the right guidance and opportunities.
          </p>
        </div>

        {/* Sparkle Icon */}
        <Sparkles className="absolute top-10 right-10 w-16 h-16 text-white opacity-20 animate-spin-slow" />
      </header>

      {/* ---------------- CONTENT ---------------- */}
      <main className="flex-1 p-6 md:p-12">
        
        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl font-semibold text-blue-600 mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Our mission is to empower students with the tools and information they need to make
            informed decisions about their education and career paths. We believe that
            everyone deserves a clear and personalized guide to their future.
          </p>
        </div>

        {/* Vision */}
        <div className="max-w-4xl mx-auto mb-12 text-center">
          <h2 className="text-3xl font-semibold text-blue-600 mb-4">Our Vision</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            Our vision is to become the leading platform for student guidance and career development,
            where every learner can explore their potential, discover opportunities, and achieve their
            dreams with confidence. We aim to bridge the gap between education and career success
            through innovation, personalized support, and a strong community.
          </p>
        </div>

        {/* Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Who We Are */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">Who We Are</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              We are a team of dedicated educators, career counselors, and developers who are passionate
              about helping the next generation succeed. Our platform is designed to be a comprehensive,
              easy-to-use resource for aptitude testing, course exploration, and career planning.
            </p>
          </div>

          {/* What We Offer */}
          <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600 mr-2" />
              <h3 className="text-xl font-semibold text-gray-800">What We Offer</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              {[
                "Personalized Aptitude Testing to identify your strengths and interests.",
                "A curated database of Suggested Courses tailored to your profile.",
                "Detailed insights into various Career Pathways and industries.",
                "A comprehensive Timeline Tracker to manage your college applications.",
                "A rich library of Resources, including scholarships and college information.",
                "Expert guidance and mentorship programs to support career decisions.",
                "Interactive tools and assessments to help plan your learning journey."
              ].map((item, index) => (
                <li key={index} className="flex gap-3">
                  <CalendarCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 py-6 border-t border-gray-200">
        © {new Date().getFullYear()} Career Website. All rights reserved.
      </footer>

    </div>
  );
};

export default AboutUs;
