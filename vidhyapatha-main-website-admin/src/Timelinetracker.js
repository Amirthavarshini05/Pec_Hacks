// src/TimelineTracker.js
/*import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const eventTypes = ["Admission", "Scholarship", "Exam", "Interview"];

const TimelineTracker = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "XYZ University Application",
      type: "Admission",
      date: new Date(2025, 9, 1),
      description: "Submit all required documents before deadline.",
    },
    {
      id: 2,
      title: "ABC Foundation Scholarship Exam",
      type: "Scholarship",
      date: new Date(2025, 9, 25),
      description: "Online exam. Check guidelines on website.",
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    type: "Admission",
    date: "",
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // ---------------- Event Handlers ----------------
  const getEventsForDate = (date) =>
    events.filter(
      (e) =>
        e.date.toDateString() === date.toDateString()
    );

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = getEventsForDate(date);
      if (dayEvents.length > 0) return "highlight-event";
    }
    return null;
  };

  const onDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleAddEvent = async (e) => {
  e.preventDefault();
  if (!formData.title || !formData.date) return;

  const newEvent = {
    id: Date.now(),
    title: formData.title,
    type: formData.type,
    date: new Date(formData.date),
    description: formData.description,
  };

  // Update local state
  setEvents((prev) => [...prev, newEvent]);
  setFormData({ id: null, title: "", type: "Admission", date: "", description: "" });

  // 🔥 Send to FastAPI backend
  try {
    const res = await fetch("http://localhost:8000/send-emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newEvent.title,
        admission: newEvent.type,
        date: formData.date,
        desc: newEvent.description,
      }),
    });

    if (res.ok) {
      console.log("✅ Event also sent to backend");
    } else {
      console.error("❌ Backend error:", await res.text());
    }
  } catch (err) {
    console.error("🚨 Network error:", err);
  }
};
  const handleEditEvent = (event) => {
    setIsEditing(true);
    setFormData({
      id: event.id,
      title: event.title,
      type: event.type,
      date: event.date.toISOString().split("T")[0],
      description: event.description,
    });
  };

  const handleUpdateEvent = (e) => {
    e.preventDefault();
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === formData.id
          ? {
              ...ev,
              title: formData.title,
              type: formData.type,
              date: new Date(formData.date),
              description: formData.description,
            }
          : ev
      )
    );
    setIsEditing(false);
    setFormData({ id: null, title: "", type: "Admission", date: "", description: "" });
  };

  const handleDeleteEvent = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // ---------------- Separate past/upcoming ----------------
  const today = new Date();
  const pastEvents = events.filter((e) => e.date < today);
  const upcomingEvents = events.filter((e) => e.date >= today);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="text-center py-16 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-lg">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-3">📅 Academic Timeline Admin</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Manage all scholarships, exams, and admissions deadlines.
        </p>
      </header>

      <div className="flex flex-1 p-8 gap-8">
        <main className="flex-1">
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <Calendar
              onClickDay={onDateClick}
              tileClassName={tileClassName}
              className="rounded-lg border border-gray-200 w-full max-w-lg mx-auto"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">Past Events</h3>
            {pastEvents.length ? (
              <ul className="space-y-2">
                {pastEvents.map((e) => (
                  <li key={e.id} className="pl-4 py-2 border-l-4 border-gray-300 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        {e.date.toDateString()}
                      </p>
                      <p className="text-gray-800 font-medium">
                        {e.title} ({e.type})
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEditEvent(e)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDeleteEvent(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No past events</p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
            {upcomingEvents.length ? (
              <ul className="space-y-2">
                {upcomingEvents.map((e) => (
                  <li key={e.id} className="pl-4 py-2 border-l-4 border-blue-500 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-gray-500">
                        {e.date.toDateString()}
                      </p>
                      <p className="text-gray-800 font-medium">
                        {e.title} ({e.type})
                      </p>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => handleEditEvent(e)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => handleDeleteEvent(e.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No upcoming events</p>
            )}
          </div>
        </main>

        <aside className="w-96 bg-white rounded-2xl p-6 shadow-lg">
          {selectedDate && (
            <>
              <h3 className="text-2xl font-bold mb-4">Events on {selectedDate.toDateString()}</h3>
              {getEventsForDate(selectedDate).length ? (
                getEventsForDate(selectedDate).map((e) => (
                  <div key={e.id} className="border-l-4 border-blue-500 pl-4 py-2 mb-2">
                    <p className="font-medium">{e.title} ({e.type})</p>
                    <p className="text-sm text-gray-500">{e.description}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No events on this date.</p>
              )}
            </>
          )}

          <h3 className="text-2xl font-bold mt-6 mb-4">{isEditing ? "Edit Event" : "Add New Event"}</h3>
          <form onSubmit={isEditing ? handleUpdateEvent : handleAddEvent} className="space-y-3">
            <input
              type="text"
              name="title"
              placeholder="Event Title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            ></textarea>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              {isEditing ? "Update Event" : "Add Event"}
            </button>
            {isEditing && (
              <button
                type="button"
                className="w-full bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ id: null, title: "", type: "Admission", date: "", description: "" });
                }}
              >
                Cancel
              </button>
            )}
          </form>
        </aside>
      </div>

      <footer className="bg-gray-100 text-gray-600 text-center py-4 border-t border-gray-200 mt-auto">
        &copy; 2025 Academic Tracker
      </footer>

      <style>{`
        .highlight-event {
          background: linear-gradient(to right, #4338ca, #2563eb) !important;
          color: white !important;
          font-weight: bold;
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(147, 51, 234, 0.6);
        }
      `}</style>
    </div>
  );
};

export default TimelineTracker;*/

