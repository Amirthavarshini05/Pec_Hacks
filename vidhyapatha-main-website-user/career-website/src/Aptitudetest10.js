import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
const user_id = localStorage.getItem("user_id");

// --- Helper Functions ---
const shuffle = (arr) => {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const insertControlsRandomly = (initialBank, controlBank) => {
  const initial = shuffle(initialBank);
  const newList = [...initial];
  const controlPairs = [];

  const controlPairsData = [];
  for (let i = 0; i < controlBank.length; i += 2) {
    controlPairsData.push([controlBank[i], controlBank[i + 1]]);
  }

  for (let [cq1, cq2] of controlPairsData) {
    const idx1 = Math.floor(Math.random() * (newList.length + 1));
    newList.splice(idx1, 0, cq1);

    const idx2 = Math.floor(Math.random() * (newList.length + 1));
    newList.splice(idx2, 0, cq2);

    controlPairs.push([newList.indexOf(cq1), newList.indexOf(cq2)]);
  }

  return [newList, controlPairs];
};

const AptitudeTest10 = () => {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [controlPairs, setControlPairs] = useState([]);
  const [answers, setAnswers] = useState({});
  const [answerTimes, setAnswerTimes] = useState([]);
  const [scores, setScores] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showResults, setShowResults] = useState(false);
  // Add this near the other useState hooks
  const [finalResults, setFinalResults] = useState(null);

  

  // --- Fetch quiz data on mount ---
  useEffect(() => {
    // Local dummy quiz data (replaces backend)
    const qb = [
      {
        id: "q1",
        question: "I enjoy solving puzzles and logical problems.",
        options: [
          { text: "Strongly Agree", category: "Logic" },
          { text: "Agree", category: "Logic" },
          { text: "Neutral", category: "Other" },
          { text: "Disagree", category: "Other" },
        ],
      },
      {
        id: "q2",
        question: "I like working with numbers and patterns.",
        options: [
          { text: "Strongly Agree", category: "Numeric" },
          { text: "Agree", category: "Numeric" },
          { text: "Neutral", category: "Other" },
          { text: "Disagree", category: "Other" },
        ],
      },
      {
        id: "q3",
        question: "I prefer reading and writing over hands-on activities.",
        options: [
          { text: "Strongly Agree", category: "Verbal" },
          { text: "Agree", category: "Verbal" },
          { text: "Neutral", category: "Other" },
          { text: "Disagree", category: "Other" },
        ],
      },
    ];

    // control bank (pairs that should be consistent)
    const cb = [
      {
        id: "c1",
        question: "I enjoy solving puzzles and logical problems.",
        options: [
          { text: "Strongly Agree", category: "Logic" },
          { text: "Agree", category: "Logic" },
        ],
      },
      {
        id: "c2",
        question: "I enjoy solving puzzles and logical problems. (control)",
        options: [
          { text: "Strongly Agree", category: "Logic" },
          { text: "Agree", category: "Logic" },
        ],
      },
    ];

    const domainSet = new Set();
    [...qb, ...cb].forEach((q) => q.options.forEach((opt) => domainSet.add(opt.category)));

    const initialScores = {};
    domainSet.forEach((d) => (initialScores[d] = 0));

    const [shuffledQuestions, cPairs] = insertControlsRandomly(qb, cb);

    setQuestions(shuffledQuestions);
    setControlPairs(cPairs);
    setScores(initialScores);
  }, []);

  const currentQuestion = questions[currentIndex];
  // backend removed; no user_id needed
  // --- Handlers ---
  const handleAnswer = (option) => {
    const elapsed = (Date.now() - startTime) / 1000;
    setAnswerTimes((prev) => [...prev, elapsed]);
    setStartTime(Date.now());

    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }));

    // Update score
    setScores((prev) => ({
      ...prev,
      [option.category]: prev[option.category] + 1,
    }));

    // Next question
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const results = computeResults();
      setFinalResults(results); 
      setShowResults(true);
    }

  };

  // --- Compute results dynamically ---
  const computeResults = () => {
    const totalAnswers = Object.values(scores).reduce((a, b) => a + b, 0);
    const sortedScoresFull = Object.entries(scores)
      .map(([domain, count]) => ({
        domain,
        count,
        percent: totalAnswers ? (count / totalAnswers) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // ✅ Pick top 3 domains
    const topDomains = sortedScoresFull.slice(0, 3).map((d) => d.domain);

    // ✅ Only numbers (floats) go to backend
    const sortedScores = sortedScoresFull.map((d) => d.percent);

    // Reliability
    const threshold = 3;
    const fastAnswers = answerTimes.filter((t) => t < threshold).length;
    const speedRel =
      answerTimes.length > 0
        ? (1 - fastAnswers / answerTimes.length) * 100
        : 100;

    let contradictions = 0;
    for (const [a, b] of controlPairs) {
      const idA = questions[a].id;
      const idB = questions[b].id;
      if (answers[idA]?.category !== answers[idB]?.category) contradictions++;
    }
    const controlRel =
      controlPairs.length > 0
        ? (1 - contradictions / controlPairs.length) * 100
        : 100;

    const reliability = (speedRel + controlRel) / 2;

    return {
      sortedScores,
      topDomains,
      fastAnswers,
      controlRel,
      speedRel,
      reliability,
    };
  };

const handleGoToDashboard = async () => {
  if (!finalResults) return;

  console.log("Final Results:", finalResults);
  console.log("User ID:", user_id);

  if (finalResults.reliability > 45) {
    try {
      const response = await fetch(
        `http://localhost:8000/submit-results/10/${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalResults),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error("Backend error:", error);
        alert("Failed to save interests");
        return;
      }

      const data = await response.json();
      console.log("Interest saved successfully:", data);

      navigate("/courses");
    } catch (err) {
      console.error("Network / server error:", err);
      alert("Server error. Please try again.");
    }
  } else {
    alert("Your answers were not reliable enough. Please retake the test.");
    navigate("/aptitude-test");
  }
};




  const TOTAL_QUESTIONS = questions.length;
  const progressRatio = currentIndex / (TOTAL_QUESTIONS || 1);
  const ballX = progressRatio * 520;

  // --- Render ---
  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-700">
        ⏳ Loading quiz...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <main className="flex-1 px-8 py-6">
        <div className="w-full mx-auto flex gap-6">
          {/* Sidebar */}
          <div className="w-1/4 bg-white shadow-lg rounded-lg p-6 mr-6 h-fit">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Quiz Progress
            </h3>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Questions Answered:</span>{" "}
              {currentIndex} / {TOTAL_QUESTIONS}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-500 h-2.5 rounded-full"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
            <p className="text-gray-500 text-sm">
              Answer honestly for better recommendations
            </p>
          </div>

          {/* Main Quiz */}
          <div className="w-2/5 min-w-0">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Aptitude Test
            </h2>
            {!showResults ? (
              <div className="bg-white shadow-lg rounded-lg p-8 mb-6">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">
                  {currentQuestion?.question}
                </h3>
                <div className="space-y-3">
                  {shuffle(currentQuestion.options).map((opt, idx) => (
                    <button
                      key={idx}
                      className="block w-full text-left p-3 border rounded-lg hover:border-blue-600 transition"
                      onClick={() => handleAnswer(opt)}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Progress Game */}
          <div className="w-[610px] flex-shrink-0">
            <div className="bg-white shadow-lg rounded-lg p-4 relative overflow-hidden h-96">
              <h3 className="text-lg font-semibold mb-3 text-center">
                Progress Game
              </h3>
              <div className="relative w-full h-full bg-gradient-to-b from-blue-50 to-green-100 rounded-lg overflow-hidden">
                <div className="absolute bottom-10 left-0 right-0 h-4 bg-green-600 rounded"></div>

                {/* Ball */}
                <motion.div
                  className="absolute bottom-12 text-5xl"
                  initial={{ x: 0, rotate: 0 }}
                  animate={{ x: ballX, rotate: ballX * 2 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  ⚽
                </motion.div>

                {/* Cat */}
                <motion.div
                  className="absolute bottom-12 text-5xl"
                  initial={{ x: -40 }}
                  animate={{
                    x: ballX - 40,
                    y: [0, -10, 0],
                    rotate: [0, -10, 10, 0],
                  }}
                  transition={{
                    x: { duration: 0.7, ease: "easeInOut" },
                    y: { repeat: Infinity, duration: 0.6, ease: "easeInOut" },
                    rotate: {
                      repeat: Infinity,
                      duration: 1,
                      ease: "easeInOut",
                    },
                  }}
                >
                  🐱
                </motion.div>

                {showResults && (
                  <motion.div
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 text-xl font-bold text-green-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    🎉 The cat pushed the ball to the goal!
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      {showResults && finalResults && (
  <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
    <h2 className="text-2xl font-bold mb-4 text-center text-indigo-700">
      🎉 Your Results
    </h2>

    <ul className="mb-6 space-y-2">
      {finalResults.topDomains.map((d, idx) => (
        <li key={idx} className="text-lg">✅ {d}</li>
      ))}
    </ul>
    <button
      onClick={handleGoToDashboard}
      className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
    >
      Explore my Courses
    </button>
  </div>
)}

      <footer className="bg-gray-800 text-white text-center py-4">
        &copy; 2025 Career Website. All rights reserved.
      </footer>
    </div>
  );
};

export default AptitudeTest10;

