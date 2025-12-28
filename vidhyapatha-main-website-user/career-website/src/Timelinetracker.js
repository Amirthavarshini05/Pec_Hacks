import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { supabase } from "./supabase";

const TimelineTracker = () => {
  const heroRef = useRef(null);

  /* ---------------- HERO ANIMATION ---------------- */
  useEffect(() => {
    if (!heroRef.current) return;

    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }
    );

    gsap.to(".floating-shape", {
      y: "-=20",
      repeat: -1,
      yoyo: true,
      duration: 2,
      ease: "sine.inOut",
      stagger: 0.3,
    });
  }, []);

  /* ---------------- SUPABASE DATA ---------------- */
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchTimelineEvents();
  }, []);

  const fetchTimelineEvents = async () => {
    try {

      const email = sessionStorage.getItem("signUpEmail") || sessionStorage.getItem("userEmail");
      

      const qualification = sessionStorage.getItem("qualification");
      let locationData = null; // use let if you want to reassign

      if (qualification === "10") {
        const { data , error} = await supabase
          .from("10th_profile_data")
          .select("preferred_locations")
          .eq("email", email)
          .single();
          console.log("10th profile data fetch error:", error);
        locationData = data?.preferred_locations || [];
      } else {
        const { data, error } = await supabase
          .from("12th_profile_data")
          .select("preferred_locations")
          .eq("email", email)
          .single();
          console.log("12th profile data fetch error:", error);
        locationData = data?.preferred_locations || [];
      }

      console.log("Fetched location data:", locationData);


      const { data: exams } = await supabase
        .from("examinations")
        .select("name, exam_date, application_start, application_end")
        .in("region", locationData);

      const examEvents =
        exams?.flatMap((exam) => [
          {
            _id: `exam-${exam.name}-exam`,
            title: exam.name,
            date: exam.exam_date,
            event_type: "Exam",
            source_name: "Examination",
          },
          {
            _id: `exam-${exam.name}-start`,
            title: `${exam.name} Application Starts`,
            date: exam.application_start,
            event_type: "Application Start",
            source_name: "Examination",
          },
          {
            _id: `exam-${exam.name}-end`,
            title: `${exam.name} Application Ends`,
            date: exam.application_end,
            event_type: "Application Deadline",
            source_name: "Examination",
          },
        ]) || [];

      const { data: scholarships } = await supabase
        .from("scholarships")
        .select("name, deadline")
        .in("region", locationData);;

      const scholarshipEvents =
        scholarships?.map((s) => ({
          _id: `sch-${s.name}`,
          title: s.name,
          date: s.deadline,
          event_type: "Scholarship Deadline",
          source_name: "Scholarship",
        })) || [];

      const all = [...examEvents, ...scholarshipEvents]
        .filter((e) => e.date)
        .map((e) => {
          const d = new Date(e.date);
          const dateKey = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          return { ...e, dateKey };
        });

      setEvents(all);
    } catch (err) {
      console.error("Timeline fetch error:", err);
    }
  };

  /* ---------------- DATE FILTERS ---------------- */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  const next30 = addDays(today, 30);
  const prev30 = addDays(today, -30);

  const upcomingSorted = events
    .filter((e) => new Date(e.date) >= today && new Date(e.date) <= next30)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const previousSorted = events
    .filter((e) => new Date(e.date) < today && new Date(e.date) >= prev30)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  /* ---------------- CALENDAR ---------------- */
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const [monthIndex, setMonthIndex] = useState(today.getMonth());

  const getCalendarDays = (year, month) => {
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    const prev = new Date(year, month, 0).getDate();

    const days = [];
    for (let i = first - 1; i >= 0; i--) {
      days.push({ day: prev - i, isCurrent: false });
    }
    for (let d = 1; d <= total; d++) {
      days.push({ day: d, isCurrent: true });
    }
    while (days.length % 7 !== 0) {
      days.push({ day: "", isCurrent: false });
    }
    return days;
  };

  const days = getCalendarDays(today.getFullYear(), monthIndex);

  const dateKey = (day, isCurrent) =>
    isCurrent
      ? `${today.getFullYear()}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`
      : "other";

  const dailySummaries = {};
  events.forEach((e) => {
    if (!dailySummaries[e.dateKey]) {
      dailySummaries[e.dateKey] = [];
    }
    dailySummaries[e.dateKey].push(e);
  });


  const dayCell = (isCurrent, hasEvent, isActive, isToday) => ({
    borderRadius: "12px",
    padding: "14px 0",
    border: isCurrent
      ? hasEvent
        ? isActive
          ? "2px solid #2563eb"
          : "1px dashed rgba(37, 99, 235, 0.4)"
        : "1px dashed rgba(37, 99, 235, 0.2)"
      : "1px solid rgba(200,200,200,0.3)",
    backgroundColor: isActive ? "#2563eb" : isToday ? "#bfdbfe" : "#fff",
    color: isActive ? "#fff" : hasEvent ? "#1e40af" : "rgba(120,120,120,0.6)",
    fontWeight: hasEvent ? "600" : "400",
    fontSize: "15px",
    transition: "all 0.3s ease",
    cursor: hasEvent ? "pointer" : "default",
    opacity: hasEvent ? 1 : 0.5,
    position: "relative",
  });

  


  //--------------- UI ---------------- 
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <section
        ref={heroRef}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20 px-6 md:px-16 rounded-b-3xl overflow-hidden shadow-lg"
      >
        <div className="floating-shape absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="floating-shape absolute -bottom-16 -right-12 w-48 h-48 bg-white/20 rounded-full"></div>
        <div className="floating-shape absolute top-12 right-32 w-20 h-20 bg-white/15 rounded-full"></div>
        <div className="floating-shape absolute top-8 left-1/2 w-12 h-12 bg-white/20 rounded-full"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            📅 Timeline Tracker
          </h1>
          <p className="text-lg opacity-90">
            Stay on top of your events and deadlines
          </p>
        </div>
      </section>

      <div className="flex flex-1 p-8 gap-6">
        <main className="flex-1">
          <div className="bg-gradient-to-r from-sky-200 to-blue-400 rounded-2xl p-8 shadow">
            <div className="flex justify-center mb-6 gap-3 flex-wrap">
              {months.map((m, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMonthIndex(i);
                    setHoveredDate(null);
                    setSelectedDate(null);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold ${monthIndex === i
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-800"
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "10px",
                textAlign: "center",
                minHeight: "400px",
              }}
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="font-bold opacity-80">
                  {d}
                </div>
              ))}

              {days.map((d, i) => {
                const key = dateKey(d.day, d.isCurrent);
                const hasEvent = d.isCurrent && dailySummaries[key];
                const isToday =
                  d.isCurrent && d.day === today.getDate();
                const isActive =
                  selectedDate === key ||
                  (hoveredDate === key && selectedDate !== key);

                return (
                  <div
                    key={i}
                    style={dayCell(d.isCurrent, hasEvent, isActive, isToday)}
                    onMouseEnter={() => hasEvent && setHoveredDate(key)}
                    onMouseLeave={() => setHoveredDate(null)}
                    onClick={() => hasEvent && setSelectedDate(key)}
                  >
                    {d.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/*UPCOMING EVENTS*/}
          <div className="mt-6 bg-white border-2 border-green-300 rounded-2xl p-6 shadow">
            <h3 className="font-bold text-green-900 mb-3">
              ⏭ Upcoming Events {/*(Next 30 Days)*/}
            </h3>
            {upcomingSorted.length === 0
              ? <p className="text-sm text-gray-500">No upcoming events</p>
              : upcomingSorted.map((e) => (
                <p key={e._id} className="text-sm text-green-800">
                  {new Date(e.date).toLocaleDateString()} —{" "}
                  {e.event_type === "Scholarship Deadline" ? (
                    <span className="font-bold">{e.title} (Deadline)</span>
                  ) : e.event_type === "Exam" ? (
                    <span className="font-bold">{e.title} (Exam Date)</span>
                  ) : e.event_type === "Application Start" ? (
                    <span className="font-bold">{e.title} (Application Starts)</span>
                  ) : e.event_type === "Application Deadline" ? (
                    <span className="font-bold">{e.title} (Application Ends)</span>
                  ) : (
                    e.title
                  )}
                </p>
              ))}
          </div>

          {/*PREVIOUS EVENTS */}
          <div className="mt-6 bg-white border-2 border-red-300 rounded-2xl p-6 shadow">
            <h3 className="font-bold text-red-900 mb-3">
              ⏮ Previous Events {/*(Last 30 Days)*/}
            </h3>
            {previousSorted.length === 0
              ? <p className="text-sm text-gray-500">No previous events</p>
              : previousSorted.map((e) => (
                <p key={e._id} className="text-sm text-red-800">
                  {new Date(e.date).toLocaleDateString()} —{" "}
                  {e.event_type === "Scholarship Deadline" ? (
                    <span className="font-bold">{e.title} Deadline</span>
                  ) : e.event_type === "Exam" ? (
                    <span className="font-bold">{e.title} (Exam Date)</span>
                  ) : e.event_type === "Application Start" ? (
                    <span className="font-bold">{e.title} (Application Starts)</span>
                  ) : e.event_type === "Application Deadline" ? (
                    <span className="font-bold">{e.title} (Application Ends)</span>
                  ) : (
                    e.title
                  )}
                </p>
              ))}
          </div>

        </main>

        {/* DAILY SUMMARY SIDEBAR */}
        <aside
          className="w-80 bg-white rounded-xl shadow p-5 border border-gray-200"
          style={{
            height: "525px",    // fixed starting height
            maxHeight: "90vh",  // grows if needed
            overflowY: "auto"   // scroll if content exceeds maxHeight
          }}
        >
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            🗓 Daily Summary
          </h2>
          <div className="text-gray-700 text-sm space-y-1">
            {selectedDate && dailySummaries[selectedDate]
              ? dailySummaries[selectedDate].map((e, idx) => (
                <span key={idx} className="block">
                  {e.event_type === "Scholarship Deadline" ? (
                    <strong>{e.title} (Deadline)</strong>
                  ) : e.event_type === "Exam" ? (
                    <strong>{e.title} (Exam Date)</strong>
                  ) : e.event_type === "Application Start" ? (
                    <strong>{e.title} (Application Starts)</strong>
                  ) : e.event_type === "Application Deadline" ? (
                    <strong>{e.title} (Application Ends)</strong>
                  ) : (
                    e.title
                  )}
                </span>
              ))
              : hoveredDate && dailySummaries[hoveredDate]
                ? dailySummaries[hoveredDate].map((e, idx) => (
                  <span key={idx} className="block">
                    {e.event_type === "Scholarship Deadline" ? (
                      <strong>{e.title} (Deadline)</strong>
                    ) : e.event_type === "Exam" ? (
                      <strong>{e.title} (Exam Date)</strong>
                    ) : e.event_type === "Application Start" ? (
                      <strong>{e.title} (Application Starts)</strong>
                    ) : e.event_type === "Application Deadline" ? (
                      <strong>{e.title} (Application Ends)</strong>
                    ) : (
                      e.title
                    )}
                  </span>
                ))
                : "Hover over or click a date to see the event."}
          </div>
        </aside>


      </div>

      <footer className="bg-gray-100 text-gray-600 text-center py-4 border-t">
        &copy; 2025 Career Website. All rights reserved.
      </footer>
    </div>
  );
};

export default TimelineTracker;

