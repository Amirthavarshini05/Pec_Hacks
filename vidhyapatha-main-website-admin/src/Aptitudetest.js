import React, { useState, useEffect } from "react";

const SuggestedCourses = () => {
  const [selectedFilter, setSelectedFilter] = useState("interest");
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userQualification, setUserQualification] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const [demandFilter, setDemandFilter] = useState("");
  const [streamFilter, setStreamFilter] = useState("");
  const [careerFilter, setCareerFilter] = useState("");

  const streamOptions = ["Arts & Science", "Engineering", "Medical", "Applied Science", "Teacher Training"];
  const careerOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Data Scientist",
    "Doctor",
    "Nurse",
    "Teacher",
  ];

  // Build mock courses data
  const buildMockData = () => {
    const interestCourses = [];
    const allCourses = [];

    streamOptions.forEach((stream, idx) => {
      interestCourses.push({
        id: 200 + idx,
        title: `B.Sc / B.A in ${stream}`,
        type: "stream",
        demand: idx % 2 === 0 ? "high" : "medium",
        stream,
        careers: [`${stream} Researcher`, `${stream} Specialist`, `${stream} Consultant`],
      });
    });

    careerOptions.forEach((career, idx) => {
      allCourses.push({
        id: 300 + idx,
        title: career,
        type: "occupation",
        demand: idx % 3 === 0 ? "high" : "medium",
        career,
      });
    });

    return {
      "12": {
        interest: interestCourses,
        all: [...interestCourses, ...allCourses],
      },
    };
  };

  const courseData = buildMockData();

  const fetchCourses = (qualification, filter) => {
    setIsLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = courseData[qualification]?.[filter] || [];
        resolve(data);
      }, 400);
    });
  };

  useEffect(() => {
    const profileData = { qualification: "12" };
    setUserQualification(profileData.qualification);

    fetchCourses("12", "interest").then((data) => {
      setRecommendedCourses(data);
      setIsLoading(false);
    });
  }, []);

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setDemandFilter("");
    setStreamFilter("");
    setCareerFilter("");

    fetchCourses(userQualification, filter).then((data) => {
      setRecommendedCourses(data);
      setIsLoading(false);
    });
  };

  const getFilteredCourses = () => {
    let courses = [...recommendedCourses];
    if (demandFilter === "high") courses = courses.filter((c) => c.demand === "high");
    if (streamFilter) courses = courses.filter((c) => c.stream === streamFilter);
    if (careerFilter) courses = courses.filter((c) => c.career === careerFilter);
    return courses;
  };

  const filteredCourses = getFilteredCourses();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="text-center py-12 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Suggested Courses for You</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Explore diploma, ITI, and degree options based on your qualification and interests.
        </p>
      </header>

      {/* TOGGLE */}
      <div className="flex justify-center mt-8">
        <div className="bg-white rounded-full shadow-md flex p-2 space-x-4">
          <button
            onClick={() => handleFilterChange("interest")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedFilter === "interest" ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Based on My Interests
          </button>
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-6 py-2 rounded-full font-medium transition ${
              selectedFilter === "all" ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All Eligible Courses
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap justify-center gap-10 mt-6">
        <select
          value={demandFilter}
          onChange={(e) => setDemandFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm bg-white text-gray-700"
        >
          <option value="">All</option>
          <option value="high">Demand</option>
        </select>

        <select
          value={streamFilter}
          onChange={(e) => setStreamFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm bg-white text-gray-700"
        >
          <option value="">All Streams</option>
          {streamOptions.map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>

        <select
          value={careerFilter}
          onChange={(e) => setCareerFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border shadow-sm bg-white text-gray-700"
        >
          <option value="">All Careers</option>
          {careerOptions.map((career) => (
            <option key={career} value={career}>
              {career}
            </option>
          ))}
        </select>
      </div>

      {/* COURSES */}
      <main className="flex-1 px-6 md:px-12 lg:px-20 py-10">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading courses...</div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onMouseEnter={() => setHoveredId(course.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition cursor-pointer self-start"
              >
                {/* Demand Tag */}
                {course.demand === "high" && (
                  <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    ✅ Demand
                  </span>
                )}

                <h4 className="font-semibold text-lg text-gray-800 mb-2">{course.title}</h4>

                <p className="text-sm text-gray-500">
                  {course.type === "stream" ? `Stream: ${course.stream}` : `Career: ${course.career}`}
                </p>

                {/* Expandable Section on Hover */}
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    hoveredId === course.id ? "max-h-40 mt-3" : "max-h-0"
                  }`}
                >
                  {course.careers && (
                    <>
                      <h5 className="font-semibold text-gray-700 mb-1">Possible Careers:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {course.careers.map((career, i) => (
                          <li key={i}>{career}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">No courses found.</div>
        )}
      </main>

      <footer className="bg-gray-100 text-gray-600 text-center py-6 mt-auto border-t border-gray-200">
        &copy; 2025 Career Advisor. All rights reserved.
      </footer>
    </div>
  );
};

export default SuggestedCourses;
