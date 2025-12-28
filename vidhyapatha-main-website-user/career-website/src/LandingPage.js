import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, GraduationCap, Building2, Award, Target, Compass } from "lucide-react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

export default function Landing() {
  const features = [
    { title: "Aptitude Test", desc: "Know your strengths & skills.", icon: <BookOpen className="h-10 w-10 text-[#444EE7]" /> },
    { title: "Course Mapping", desc: "Find courses that fit your profile.", icon: <GraduationCap className="h-10 w-10 text-[#444EE7]" /> },
    { title: "Top Colleges", desc: "Get details about leading institutions.", icon: <Building2 className="h-10 w-10 text-[#444EE7]" /> },
    { title: "Scholarships", desc: "Discover opportunities to fund your studies.", icon: <Award className="h-10 w-10 text-[#444EE7]" /> },
  ];

  const steps = ["Take Aptitude Test", "Explore Courses", "Find Colleges", "Eligible Scholarships"];

  const heroImageRef = useRef(null);
  const buttonRef = useRef(null);
  const badgeRef = useRef(null);
  const featureRefs = useRef([]);
  const stepRefs = useRef([]);

  const [dragComplete, setDragComplete] = useState({});

  const addFeatureRef = (el) => { if (el && !featureRefs.current.includes(el)) featureRefs.current.push(el); };
  const addStepRef = (el) => { if (el && !stepRefs.current.includes(el)) stepRefs.current.push(el); };

  useLayoutEffect(() => {
    gsap.registerPlugin(Draggable);

    const ctx = gsap.context(() => {
      gsap.from(".hero-heading", { opacity: 0, y: 50, stagger: 0.15, duration: 1.2, ease: "back.out(1.7)" });

      gsap.from(heroImageRef.current, {
        x: 100,
        opacity: 0,
        rotation: -5,
        duration: 1.5,
        ease: "power3.out",
        onComplete: () => {
          gsap.to(heroImageRef.current, { y: -20, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
        }
      });

      gsap.from(buttonRef.current, { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.8, ease: "elastic.out(1,0.5)" });

      if (badgeRef.current) {
        gsap.to(badgeRef.current, { rotation: 6, y: -6, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });
      }

      featureRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, scale: 0.8, rotationX: -20, filter: "blur(8px)" },
          { opacity: 1, y: 0, scale: 1, rotationX: 0, filter: "blur(0px)", duration: 1.2, delay: i * 0.25, ease: "back.out(1.5)" }
        );
      });

      stepRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.6, y: 50, rotationY: -90 },
          { opacity: 1, scale: 1, y: 0, rotationY: 0, duration: 1, delay: i * 0.2, ease: "back.out(1.7)" }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    featureRefs.current.forEach((el, i) => {
      Draggable.create(el, {
        type: "x,y",
        edgeResistance: 0.65,
        bounds: { top: -100, left: -100, width: window.innerWidth, height: window.innerHeight },
        inertia: true,
        onDragEnd: function () {
          gsap.to(el, {
            x: 0, y: 0, duration: 0.5, ease: "back.out(1.5)",
            onComplete: () => {
              if (!dragComplete[i]) setDragComplete(prev => ({ ...prev, [i]: true }));
            }
          });
        }
      });
    });

    return () => featureRefs.current.forEach(el => { const d = Draggable.get(el); if (d) d.kill(); });
  }, [dragComplete]);

  return (
    <div className="font-['Poppins'] relative overflow-hidden bg-[#EEF0FF] min-h-screen text-gray-900">

      {/* HERO */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 md:px-20 py-20 gap-10 z-10">
        <div className="md:w-1/2 space-y-6 text-center md:text-left z-10">

          <div
            ref={badgeRef}
            className="inline-block bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 animate-bounce"
          >
            <Compass className="inline w-4 h-4 mr-1" /> Your Journey Starts Here
          </div>

          <h1 className="hero-heading text-5xl md:text-6xl font-extrabold text-[#2B2F9E]">
            Unlock Your Future
          </h1>

          <h2 className="hero-heading text-3xl md:text-4xl font-semibold italic text-[#444EE7] mt-2">
            With Confidence
          </h2>

          <p className="mt-4 md:text-lg text-[#2B2F9E] leading-relaxed">
            Explore your strengths, match with the right courses, and step into top colleges with clarity.
          </p>

          <div className="flex justify-center md:justify-start gap-4 mt-8 flex-wrap" ref={buttonRef}>
            <Link
              to="/aptitude-landing"
              className="px-8 py-3 bg-gradient-to-r from-[#444EE7] to-[#6B74FF] hover:scale-110 text-white rounded-xl shadow-lg font-semibold flex items-center gap-2"
            >
              <Target className="w-5 h-5" /> 🚀 Take the Quiz
            </Link>

            <Link
              to="/signin"
              className="px-8 py-3 border-2 border-[#444EE7] text-[#444EE7] rounded-xl hover:bg-[#DBDFFF] transition font-semibold"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="md:w-1/2 relative z-10">
          <img
            ref={heroImageRef}
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
            alt="Career Growth"
            className="rounded-3xl shadow-2xl w-full h-auto object-cover border-4 border-[#444EE7]"
          />
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 px-6 md:px-20 bg-[#DBDFFF]">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#2B2F9E] mb-2">Our Features</h2>
          <p className="text-gray-700">Drag the cards to interact with them ✨</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              ref={addFeatureRef}
              className="p-6 rounded-3xl bg-[#F5F6FF]/90 backdrop-blur-xl border border-[#C7CBFF] shadow-xl hover:shadow-2xl"
            >
              <div className="mb-4 flex justify-center">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2 text-center text-[#2B2F9E]">{feature.title}</h3>
              <p className="text-gray-700 text-center text-sm">{feature.desc}</p>

              <div className="mt-4 flex justify-center">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    dragComplete[i]
                      ? "bg-green-500/30 text-green-800"
                      : "bg-[#444EE7]/20 text-[#444EE7]"
                  }`}
                >
                  {dragComplete[i] ? "✓ Unlocked" : "Drag me"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-6 md:px-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-[#2B2F9E]">How It Works</h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 flex-wrap">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-6 w-full md:w-auto">
              <div
                ref={addStepRef}
                className="flex flex-col items-center p-8 bg-[#F5F6FF] rounded-3xl shadow-lg hover:-translate-y-2 transition border border-[#C7CBFF] min-w-[220px]"
              >
                <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white rounded-full font-bold text-xl mb-3 shadow-lg">
                  {i + 1}
                </div>
                <p className="text-[#444EE7] font-semibold">{step}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="hidden md:block w-12 h-1 bg-[#444EE7] rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-20 text-center bg-[#DBDFFF]">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-extrabold text-[#2B2F9E]">Ready to discover your path?</h2>
          <p className="text-gray-800 text-lg">
            Take the first step towards your bright future with our interactive tools.
          </p>

          <Link
            to="/aptitude-landing"
            className="inline-block px-10 py-4 bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white font-bold rounded-3xl shadow-lg hover:scale-105"
          >
            Start Now 🚀
          </Link>
        </div>
      </section>
    </div>
  );
}
