// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { GoogleGenAI } from "@google/genai";
// import { supabase } from "./supabase";

// const AptitudeTest = () => {
//   const navigate = useNavigate();

//   // 🔐 Gemini API (COMMENT THIS BEFORE FINAL COMMIT)
//   const ai = new GoogleGenAI({
//     apiKey: "dummy"
//   });

//   const [questions, setQuestions] = useState([]);
//   const [index, setIndex] = useState(0);
//   const [answers, setAnswers] = useState({});
//   const [confirm, setConfirm] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [isCompleted, setIsCompleted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [finalResult, setFinalResult] = useState(null);

//   /* =========================
//      FETCH QUESTIONS
//   ========================= */
//   useEffect(() => {
//     const fetchQuestions = async () => {
//       const { data, error } = await supabase
//         .from("questions")
//         .select("qid, ques, A, B, C, D")
//         .order("qid", { ascending: true });

//       if (error) {
//         console.error("❌ Question fetch error:", error);
//         return;
//       }

//       const mapped = data.map(q => ({
//         id: q.qid,
//         text: q.ques,
//         options: [q.A, q.B, q.C, q.D],
//       }));

//       setQuestions(mapped);
//       setLoading(false);
//     };

//     fetchQuestions();
//   }, []);

//   /* =========================
//      ANSWER HANDLER
//   ========================= */
//   const handleAnswer = (choiceIndex) => {
//     const letter = ["A", "B", "C", "D"][choiceIndex];
//     const qid = questions[index].id;

//     setAnswers(prev => ({ ...prev, [qid]: letter }));

//     if (index < questions.length - 1) {
//       setIndex(index + 1);
//     } else {
//       setIsCompleted(true);
//     }
//   };

//   /* =========================
//      FINAL SUBMIT
//   ========================= */
//   const handleFinalSubmit = async () => {
//     setIsSubmitting(true);

//     const qualification = sessionStorage.getItem("qualification"); // 10th / 12th
//     const stream = sessionStorage.getItem("stream") || "N/A";
//     const email =
//       sessionStorage.getItem("userEmail") ||
//       sessionStorage.getItem("signUpEmail");

//     if (!email) {
//       alert("❌ Email not found. Please login again.");
//       setIsSubmitting(false);
//       return;
//     }

//     const payload = {
//       prompt_id: "CAREER_GUIDANCE_V4_DOMAIN_FILTERED",
//       prompt: `You are a professional career guidance analyzer. Strictly adhere to the following steps and output format using ONLY the provided 'student_data' and the analysis key (A: Creative, B: Technical/Mechanical/Structured, C: Commerce/Finance/Management, D: Biological/Medical/Research):

// 1. Tally the student's 'answers' (Q1-Q20) into the four clusters (A, B, C, D). Note Q14 and Q19 should be ignored if 'N/A' is used.

// 2. Determine the dominant cluster (highest count).

// 3. CRITICAL STEP: Filter Outcome Recommendations.

// Select FIVE if standard 12th or THREE if standard 10th specializations for the 'final_outcome_recommendation'
// from the 12th-grade list (['mech','civil','comp','aids','aiml','it','robotics','biomedical','biotechnology','cardiologist','mbbs','bba','bcom','chartered_accountant','law','fashion_design','animation'])
// or from the 10th grade-list (['comp','Bio','Arts','Commerce','cultural sciences']).

// Respect stream constraints strictly.

// 4. OUTPUT FORMAT (MANDATORY)

// Return ONLY valid JSON. No markdown. No explanations.

// {
//   "tallied_answers": { "A": number, "B": number, "C": number, "D": number },
//   "dominant_cluster_analysis": {
//     "type": "A | B | C | D",
//     "count": number,
//     "description": "string"
//   },
//   "final_outcome_recommendation": [
//     {
//       "type": "A | B | C | D | A/C | C/A | B/D",
//       "field": "string",
//       "description": "string"
//     }
//   ],
//   "justification": "string"
// }

// If invalid, return {}.`,
//       student_data: {
//         student_grade: sessionStorage.getItem("qualification"),
//         current_stream: sessionStorage.getItem("stream") || "N/A",
//         answers,
//       },
//     };


//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: [
//           {
//             role: "user",
//             parts: [{ text: JSON.stringify(payload) }],
//           },
//         ],
//       });

//       const rawText = response.text;

//       // 🧹 Clean Gemini output
//       const cleaned = rawText
//         .replace(/```json|```/g, "")
//         .replace(/[^\x20-\x7E]/g, "")
//         .trim();

//       const match = cleaned.match(/\{[\s\S]*\}/);
//       if (!match) throw new Error("No JSON from Gemini");

//       const parsed = JSON.parse(match[0]);
//       setFinalResult(parsed);

//       const recommendedFields =
//         parsed.final_outcome_recommendation?.map(r => r.field) || [];

//       /* =========================
//          SAVE TO SUPABASE
//       ========================= */
// const { error } = await supabase
//   .from("interest")
//   .upsert(
//     {
//       student_id: email,
//       interest: {
//         recommended_fields: recommendedFields,
//       },
//     },
//     { onConflict: "student_id" }
//   );

//       if (error) {
//         console.error("❌ Supabase insert error:", error);
//         alert("Failed to save aptitude result");
//         setIsSubmitting(false);
//         return;
//       }

//       sessionStorage.setItem("aptitudeDone", "true");

//     } catch (err) {
//       console.error("❌ Aptitude error:", err);
//       alert("Unable to analyze aptitude now.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   /* =========================
//      LOADING
//   ========================= */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Loading aptitude test…
//       </div>
//     );
//   }

//   /* =========================
//      RESULT SCREEN
//   ========================= */
//   if (finalResult) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
//         <div className="bg-white p-8 rounded-xl shadow-xl max-w-3xl w-full">
//           <h2 className="text-2xl font-bold text-center mb-4">
//             Aptitude Result
//           </h2>

//           <ul className="space-y-3">
//             {finalResult.final_outcome_recommendation.map((r, i) => (
//               <li key={i} className="border p-3 rounded">
//                 <strong>{r.field}</strong>
//                 <p className="text-sm">{r.description}</p>
//               </li>
//             ))}
//           </ul>

//           <button
//             onClick={() => navigate("/courses")}
//             className="mt-6 w-full bg-blue-600 text-white py-3 rounded"
//           >
//             Go to Courses
//           </button>
//         </div>
//       </div>
//     );
//   }

//   /* =========================
//      QUESTION UI
//   ========================= */
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
//         <h2 className="text-sm text-gray-500 mb-2">
//           Question {index + 1} / {questions.length}
//         </h2>

//         <h1 className="text-xl font-bold mb-6">
//           {questions[index].text}
//         </h1>

//         <div className="space-y-4">
//           {questions[index].options.map((opt, i) => (
//             <button
//               key={i}
//               onClick={() => handleAnswer(i)}
//               className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 rounded-lg"
//             >
//               {opt}
//             </button>
//           ))}
//         </div>

//         {isCompleted && (
//           <div className="mt-6 text-center">
//             <button
//               onClick={() => setConfirm(true)}
//               className="bg-green-600 text-white px-6 py-3 rounded-lg"
//             >
//               Submit Test
//             </button>
//           </div>
//         )}

//         {confirm && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
//             <div className="bg-white p-6 rounded-xl text-center">
//               <p className="mb-4">Confirm submission?</p>
//               <div className="flex gap-4 justify-center">
//                 <button onClick={() => setConfirm(false)}>Cancel</button>
//                 <button
//                   onClick={handleFinalSubmit}
//                   disabled={isSubmitting}
//                   className={`px-4 py-2 rounded text-white ${isSubmitting ? "bg-gray-400" : "bg-blue-600"
//                     }`}
//                 >
//                   {isSubmitting ? "Analyzing..." : "Confirm"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

 //export default AptitudeTest;


 
 /*import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

const AptitudeTest = () => {
  const navigate = useNavigate();

 
  const ai = new GoogleGenAI({ 
    apiKey: "AIzaSyAdf65db865PMqC2qS3HIjUfBk7ZXzY2Ac" 
  });

  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("qid, ques, A, B, C, D")
        .order("qid", { ascending: true });

      if (error) {
        console.error("❌ Question fetch error:", error);
        return;
      }

      const mapped = data.map((q) => ({
        id: q.qid,
        text: q.ques,
        options: [q.A, q.B, q.C, q.D],
      }));

      setQuestions(mapped);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

 
  const handleAnswer = (choiceIndex) => {
    const letter = ["A", "B", "C", "D"][choiceIndex];
    const qid = questions[index].id;

    setAnswers((prev) => ({ ...prev, [qid]: letter }));

    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      setIsCompleted(true);
    }
  };


  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    const email =
      sessionStorage.getItem("userEmail") ||
      sessionStorage.getItem("signUpEmail");

    if (!email) {
      alert("❌ Email not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    

    const payload = {
      prompt_id: "CAREER_GUIDANCE_V5_OPEN_RESPONSE",
      prompt: `
You are a professional career aptitude analyst.

Analyze the student's SHORT ANSWER responses semantically.
Do NOT invent data. Use ONLY the provided responses.

Cluster each answer into one or more of the following aptitude domains:
A: Creative / Design / Expression
B: Technical / Mechanical / Logical / Structured
C: Commerce / Business / Finance / Management
D: Biological / Medical / Research / Life Sciences

Steps:
1. Semantically evaluate all 10 responses.
2. Assign each response to one or more clusters (A/B/C/D).
3. Tally total influence per cluster.
4. Identify the dominant cluster.
5. Based on student grade:
   - If 12th → select EXACTLY 12 outcomes without repetition
   - If 10th → select EXACTLY 4 outcomes without repetition

IMPORTANT:
- DO NOT modify or invent outcome lists.
- Respect stream constraints strictly.
- Output MUST be valid JSON ONLY.

12th-grade outcomes:
['mech','civil','comp','aids','aiml','it','robotics','biomedical','biotechnology','cardiologist','mbbs','bba','bcom','chartered_accountant','law','fashion_design','animation']

10th-grade outcomes:
['comp','Bio','Arts','Commerce','cultural sciences']

OUTPUT FORMAT (MANDATORY):

{
  "semantic_cluster_scores": { "A": number, "B": number, "C": number, "D": number },
  "dominant_cluster_analysis": {
    "type": "A | B | C | D",
    "description": "string"
  },
  "final_outcome_recommendation": [
    {
      "type": "any combination",
      "field": "string",
      "description": "string"
    }
  ],
  "justification": "string"
}

If analysis is not possible, return {}.
      `,
      student_data: {
        student_grade: sessionStorage.getItem("qualification"),
        current_stream: sessionStorage.getItem("stream") || "N/A",
        responses: answers,
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(payload) }],
          },
        ],
      });

      const cleaned = response.text
        .replace(/```json|```/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .trim();

      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON from Gemini");

      const parsed = JSON.parse(match[0]);
      setFinalResult(parsed);

      const recommendedFields =
        parsed.final_outcome_recommendation?.map((r) => r.field) || [];

      
      const { error } = await supabase.from("interest").upsert(
        {
          student_id: email,
          interest: { recommended_fields: recommendedFields },
        },
        { onConflict: "student_id" }
      );

      if (error) {
        console.error("❌ Supabase error:", error);
        alert("Failed to save result");
      }

      sessionStorage.setItem("aptitudeDone", "true");
    } catch (err) {
      console.error("❌ Aptitude error:", err);
      alert("Unable to analyze aptitude now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading aptitude test…
      </div>
    );
  }


  if (finalResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-3xl w-full">
          <h2 className="text-2xl font-bold text-center mb-4">
            Aptitude Result
          </h2>

          <ul className="space-y-3">
            {finalResult.final_outcome_recommendation.map((r, i) => (
              <li key={i} className="border p-3 rounded">
                <strong>{r.field}</strong>
                <p className="text-sm">{r.description}</p>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/courses")}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded"
          >
            Go to Courses
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
        <h2 className="text-sm text-gray-500 mb-2">
          Question {index + 1} / {questions.length}
        </h2>

        <h1 className="text-xl font-bold mb-6">
          {questions[index].text}
        </h1>

        <div className="space-y-4">
          {questions[index].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 rounded-lg"
            >
              {opt}
            </button>
          ))}
        </div>

        {isCompleted && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setConfirm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg"
            >
              Submit Test
            </button>
          </div>
        )}

        {confirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center">
              <p className="mb-4">Confirm submission?</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setConfirm(false)}>Cancel</button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white ${
                    isSubmitting ? "bg-gray-400" : "bg-blue-600"
                  }`}
                >
                  {isSubmitting ? "Analyzing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;*/



/*import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";

const AptitudeTest = () => {
  const navigate = useNavigate();

  // 🔐 Gemini API (COMMENT BEFORE FINAL COMMIT)
  const ai = new GoogleGenAI({ apiKey: "AIzaSyBC3QTI-v-HILkaFZBS5Gf0VaFrzMNboLE" });

  const questions = [
    "What kind of problems do you enjoy solving the most?",
    "Describe an activity where you completely lose track of time.",
    "What subjects or topics excite you naturally?",
    "How do you usually approach a difficult challenge?",
    "What type of work environment do you imagine yourself thriving in?",
    "Do you prefer working with people, systems, ideas, or nature? Why?",
    "What motivates you more: creativity, stability, impact, or leadership?",
    "Describe a project or task you felt proud completing.",
    "If resources were unlimited, what would you love to learn deeply?",
    "How do you see yourself contributing to society in the future?"
  ];

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState("");
  const [finalResult, setFinalResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const handleNext = () => {
    if (!input.trim()) return;

    setAnswers(prev => ({
      ...prev,
      [`Q${index + 1}`]: input.trim(),
    }));

    setInput("");
    setIndex(index + 1);
  };

  
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    const email = 
    sessionStorage.getItem("userEmail") ||
      sessionStorage.getItem("signUpEmail");

    if (!email) {
      alert("Email not found. Please login again.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      prompt_id: "CAREER_GUIDANCE_V5_OPEN_RESPONSE",
      prompt: `
You are a professional career aptitude analyst.

Analyze the student's SHORT ANSWER responses semantically.
Do NOT invent data. Use ONLY the provided responses.

Cluster each answer into one or more of the following aptitude domains:
A: Creative / Design / Expression
B: Technical / Mechanical / Logical / Structured
C: Commerce / Business / Finance / Management
D: Biological / Medical / Research / Life Sciences

Steps:
1. Semantically evaluate all 10 responses.
2. Assign each response to one or more clusters (A/B/C/D).
3. Tally total influence per cluster.
4. Identify the dominant cluster.
5. Based on student grade:
   - If 12th → select EXACTLY 12 outcomes without repetition
   - If 10th → select EXACTLY 4 outcomes without repetition

IMPORTANT:
- DO NOT modify or invent outcome lists.
- Respect stream constraints strictly.
- Output MUST be valid JSON ONLY.

12th-grade outcomes:
['mech','civil','comp','aids','aiml','it','robotics','biomedical','biotechnology','cardiologist','mbbs','bba','bcom','chartered_accountant','law','fashion_design','animation']

10th-grade outcomes:
['comp','Bio','Arts','Commerce','cultural sciences']

OUTPUT FORMAT (MANDATORY):

{
  "semantic_cluster_scores": { "A": number, "B": number, "C": number, "D": number },
  "dominant_cluster_analysis": {
    "type": "A | B | C | D",
    "description": "string"
  },
  "final_outcome_recommendation": [
    {
      "type": "any combination",
      "field": "string",
      "description": "string"
    }
  ],
  "justification": "string"
}

If analysis is not possible, return {}.
      `,
      student_data: {
        student_grade: sessionStorage.getItem("qualification"),
        current_stream: sessionStorage.getItem("stream") || "N/A",
        responses: answers,
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: JSON.stringify(payload) }],
          },
        ],
      });

      const cleaned = response.text
        .replace(/```json|```/g, "")
        .replace(/[^\x20-\x7E]/g, "")
        .trim();


      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON output");
      console.log(match)

      const parsed = JSON.parse(match[0]);
      setFinalResult(parsed);

   
      const recommendedFields =
        parsed.final_outcome_recommendation?.map(r => r.field) || [];

      const { error } = await supabase
        .from("interest")
        .upsert(
          {
            student_id: email,
            interest: {
              recommended_fields: recommendedFields,
            },
          },
          { onConflict: "student_id" }
        );

      if (error) {
        console.error("❌ Supabase upsert error:", error);
        alert("Failed to save aptitude result.");
        return;
      }


    } catch (err) {
      console.error("❌ Gemini Analysis Error:", err);
      alert("Analysis unavailable right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

 
  if (finalResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-3xl w-full">
          <h2 className="text-2xl font-bold text-center mb-4">
            Career Aptitude Insights
          </h2>

          <ul className="space-y-4">
            {finalResult.final_outcome_recommendation.map((r, i) => (
              <li key={i} className="border p-4 rounded">
                <strong>{r.field}</strong>
                <p className="text-sm text-gray-600">{r.description}</p>
              </li>
            ))}
          </ul>

          <button
            onClick={() => navigate("/courses")}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded"
          >
            Explore Courses
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
        <h2 className="text-sm text-gray-500 mb-2">
          Question {index + 1} / {questions.length}
        </h2>

        <h1 className="text-xl font-bold mb-4">
          {questions[index]}
        </h1>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={4}
          placeholder="Write your answer here..."
          className="w-full border rounded p-3 mb-4"
        />

        {index < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="w-full bg-blue-600 text-white py-3 rounded"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded"
          >
            {isSubmitting ? "Analyzing..." : "Submit & Analyze"}
          </button>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;*/










import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import { supabase } from "./supabase";




const AptitudeTest = () => {
  const navigate = useNavigate();
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyCVbs0r9MBYGfG5qxf0EpE_S8WD0H5JtgM", // do not push this api key to the repository
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [confirm, setConfirm] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [finalText, setFinalText] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("qid, ques, A, B, C, D")
        .order("qid", { ascending: true }); // or order_no

      if (error) {
        console.error("Supabase error:", error);
        return;
      }

      const mapped = data.map((q) => ({
        id: q.qid,              // 🔑 CRITICAL: mapping qid → id
        text: q.ques,
        options: [q.A, q.B, q.C, q.D],
      }));

      setQuestions(mapped);
      setLoading(false);
    };

    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading aptitude test…</p>
      </div>
    );
  }


  /* =======================
     ANSWER HANDLER
     ======================= */

  const handleAnswer = (choiceIndex) => {
    const letter = ["A", "B", "C", "D"][choiceIndex];
    const qid = questions[index].id;

    setAnswers({ ...answers, [qid]: letter });

    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      // ✅ test completed
      setIsCompleted(true);
    }
  };

  /* =======================
     FINAL SUBMIT
     ======================= */

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const payload = {
      prompt_id: "CAREER_GUIDANCE_V4_DOMAIN_FILTERED",
      prompt: `You are a professional career guidance analyzer. Strictly adhere to the following steps and output format using ONLY the provided 'student_data' and the analysis key (A: Creative, B: Technical/Mechanical/Structured, C: Commerce/Finance/Management, D: Biological/Medical/Research):\n\n1. Tally the student's 'answers' (Q1-Q20) into the four clusters (A, B, C, D). Note Q14 and Q19 should be ignored if 'N/A' is used.\n\n2. Determine the *dominant cluster* (highest count).
      
      
      \n\n3. *CRITICAL STEP: Filter Outcome Recommendations.* 
  
      Select FIVE if standard 12th or THREE if standard 10th specializations for the 'final_outcome_recommendation' 
      from the 12th-grade list (['mech', 'civil', 'comp', 'aids', 'aiml', 'it', 'robotics', 'biomedical', 'biotechnology', 'cardiologist', 'mbbs', 'bba', 'bcom', 'chartered_accountant', 'law', 'fashion_design', 'animation']) if student is of class 12th else 
      from the 10th grade-list (['comp','Bio','Arts','Commerce','cultural sciences']). 
      
      The chosen fields *MUST* align with the dominant cluster *AND* be feasible based on the student's 'current_stream' as follows:\n    * *If current_stream is 'N/A' then the student has just completed class 10th grade so all the 10th grade-list is valid while if calss 12th then 'Science (PCM)' or 'Science (PCMB)':* All technical (B), creative (A), and limited science (D - focusing on B/D hybrids like Biomedical/Biotech) fields are valid. Pure Medical/Biological (like MBBS, Cardiologist, B.Sc. Pure Bio) are *ONLY* valid if PCMB stream is confirmed.\n    * *If current_stream is 'Commerce':* Only fields C and A (Business Law, Finance, Design Management) are valid.\n    * *If current_stream is 'Arts/Humanities':* Only fields A and C (Law, Design, Management) are valid.
      
      \n\n4. OUTPUT FORMAT (MANDATORY — NO DEVIATION ALLOWED)
Return ONLY valid JSON.
Do NOT include markdown, explanations, comments, or extra keys.
Do NOT rename any keys.
Do NOT nest or restructure objects differently.

The output MUST follow this EXACT schema:

{
  "tallied_answers": {
    "A": number,
    "B": number,
    "C": number,
    "D": number
  },
  "dominant_cluster_analysis": {
    "type": "A | B | C | D",
    "count": number,
    "description": "string"
  },
  "final_outcome_recommendation": [
    {
      "type": "A | B | C | D | A/C | C/A | B/D",
      "field": "string (must be from the allowed list)",
      "description": "string"
    }
  ],
  "justification": "string"
}

If you cannot comply with the schema, return an empty JSON object {}.`,

      student_data: {
        student_grade: sessionStorage.getItem("qualification"),
        current_stream: sessionStorage.getItem("stream")|| "N/A",
        answers,
      },
    };

    console.log("Payload to Gemini:", payload);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify(payload, null, 2),
              },
            ],
          },
        ],
      });

      // SDK gives you a clean accessor
      const rawText = response.text;
      console.log("Raw Gemini response text:", rawText);

      // Gemini often returns JSON as text → hard parse
      let parsed;
      try {
        // 1️⃣ Clean unwanted characters
        const cleaned = rawText
          .replace(/```json|```/g, "")
          .replace(/[^\x20-\x7E]/g, "") // ⬅️ THIS LINE FIXES IT
          .trim();

        // 2️⃣ Extract first valid JSON object
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
          throw new Error("No JSON object found in Gemini response");
        }

        // 3️⃣ Parse safely
        parsed = JSON.parse(jsonMatch[0]);

      } catch (err) {
        console.error("❌ Invalid JSON from Gemini");
        console.error("Reason:", err.message);
        console.log("🔍 Raw Gemini text:", rawText);
        return;
      }
      console.log("✅ Parsed Gemini response:", parsed);
      setFinalResult(parsed);
      const interests = parsed.final_outcome_recommendation.map(
        (rec) => rec.field
      );

      const email = sessionStorage.getItem("userEmail") || sessionStorage.getItem("signUpEmail");
      const { error } = await supabase
        .from("interest")
        .upsert(
          {
            student_id: email,
            interest: {
              recommended_fields: interests,
            },
          },{ onConflict: "student_id" }
        );

      if (error) {
        console.error("❌ Supabase insert failed:", error.message);
        return;
      }
    } catch (err) {
      console.error("Gemini error:", err);
      setFinalText("Unable to generate career analysis at this time.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================
     FINAL RESULT SCREEN
     ======================= */

  if (finalResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-4xl w-full space-y-8">

          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-700">
              Career Aptitude Analysis
            </h2>
            
          </div>
          {/* Dominant Cluster */}
          <div className="bg-green-50 border-l-4 border-green-600 p-5 rounded">
            <h3 className="font-semibold mb-1">Dominant Cluster</h3>
            <p className="text-gray-700">
              Cluster{" "}
              <span className="font-bold text-green-700 text-lg">
                {finalResult.dominant_cluster_analysis.type}
              </span>{" "}
              with{" "}
              <span className="font-bold">
                {finalResult.dominant_cluster_analysis.count}
              </span>{" "}
              responses
            </p>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Recommended Career Paths
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {finalResult.final_outcome_recommendation.map((rec, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-5 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-blue-700 capitalize">
                      {rec.field.replace(/_/g, " ")}
                    </h4>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {rec.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Justification */}
          <div className="bg-gray-100 p-5 rounded-lg">
            <h3 className="font-semibold mb-2">Why these were chosen</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {finalResult.justification}
            </p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <button
              onClick={() => {
                sessionStorage.setItem("aptitudeDone",true) 
                navigate("/courses")
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Explore Courses
            </button>
          </div>

        </div>
      </div>
    );
  }



  /* =======================
     QUESTION SCREEN
     ======================= */

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl w-full">
        <h2 className="text-sm text-gray-500 mb-2">
          Question {index + 1} / {questions.length}
        </h2>
        <h1 className="text-xl font-bold mb-6">{questions[index].text}</h1>

        <div className="space-y-4">
          {questions[index].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-3 rounded-lg"
            >
              {opt}
            </button>
          ))}
        </div>

        {isCompleted && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setConfirm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Submit Test
            </button>
          </div>
        )}


        {confirm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl text-center">
              <p className="mb-4">Confirm submission?</p>
              <div className="flex gap-4 justify-center">
                <button onClick={() => setConfirm(false)}>Cancel</button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded text-white ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                >
                  {isSubmitting ? "Analyzing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AptitudeTest;