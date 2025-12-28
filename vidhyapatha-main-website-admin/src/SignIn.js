// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "./supabase"; // adjust path

// function SignIn({ onLogin }) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       alert("Please enter both email and password.");
//       return;
//     }

//     setLoading(true);

//     try {
//       // 1️⃣ Sign in via Supabase Auth
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       console.log("Sign-in response data:", data);
//       if (error) {
//         // 🎯 Explicit email confirmation gate
//         if (
//           error.message.toLowerCase().includes("email not confirmed") ||
//           error.message.toLowerCase().includes("confirm")
//         ) {
//           alert("Email not yet confirmed. Please check your inbox.");
//           return;
//         }

//         alert("Login failed: " + error.message);
//         return;
//       }

//       // 2️⃣ Optional: fetch user profile
//       const { data: profileData, error: profileError } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("email",data.user.email)
//         .single();

//       if (profileError) {
//         console.log("Profile fetch error:", profileError);
//       }

//       console.log("Logged in user profile:", profileData);

//       // 3️⃣ Set local storage / state
//       sessionStorage.setItem("isAuthenticated", "true");
//       sessionStorage.setItem("userName", profileData?.fullname || "User");
//       sessionStorage.setItem("userEmail", data.user.email);
//       console.log("User logged in:", profileData?.fullname);

//       onLogin?.(); // callback if any
//       navigate("/dashboard");
//     } catch (err) {
//       console.log("Unexpected error:", err);
//       alert("An unexpected error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   return (
//     <div className="bg-white min-h-screen flex items-center justify-center">
//       <div className="bg-[#FEF9F2] p-20 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-[#8B5E34]">
//         <h2 className="text-4xl font-bold text-center mb-10 text-[#8B5E34]">
//           Sign In
//         </h2>

//         <form onSubmit={handleSubmit}>
//           <div className="mb-8">
//             <label className="block text-[#8B5E34] text-base font-semibold mb-3">
//               Email
//             </label>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-5 px-6 text-lg text-[#8B5E34] bg-[#FEF9F2] focus:outline-none focus:ring-2 focus:ring-[#A47148]"
//               required
//             />
//           </div>

//           <div className="mb-10">
//             <label className="block text-[#8B5E34] text-base font-semibold mb-3">
//               Password
//             </label>
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="shadow appearance-none border rounded w-full py-5 px-6 text-lg text-[#8B5E34] bg-[#FEF9F2] focus:outline-none focus:ring-2 focus:ring-[#A47148]"
//               required
//             />
//           </div>

//           <div className="flex items-center justify-between">
//             <button
//               className="bg-gradient-to-r from-[#8B5E34] to-[#A47148] hover:scale-105 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-transform text-lg"
//               type="submit"
//             >
//               Sign In
//             </button>

//             <Link
//               to="/signup"
//               className="inline-block align-baseline font-semibold text-base text-[#8B5E34] hover:text-[#A47148]"
//             >
//               Create an account
//             </Link>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default SignIn;


import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

function SignIn({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const [errors, setErrors] = useState({
        email: "",
        password: "",
        general: "",
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ email: "", password: "", general: "" });

        if (!email) {
            setErrors((prev) => ({ ...prev, email: "Email is required" }));
            return;
        }

        if (!password) {
            setErrors((prev) => ({ ...prev, password: "Password is required" }));
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (
                    error.message.toLowerCase().includes("email not confirmed") ||
                    error.message.toLowerCase().includes("confirm")
                ) {
                    setErrors((prev) => ({
                        ...prev,
                        email: "Email not yet confirmed. Please check your inbox.",
                    }));
                    return;
                }

                setErrors((prev) => ({
                    ...prev,
                    general: error.message,
                }));
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", data.user.email)
                .single();

            if (profileError) {
                console.log("Profile fetch error:", profileError);
            }

            sessionStorage.setItem("isAuthenticated", "true");
            sessionStorage.setItem("userName", profileData?.fullname || "User");
            sessionStorage.setItem("userEmail", data.user.email);
            sessionStorage.setItem("qualification", profileData?.qualification);

            onLogin?.();
            navigate("/dashboard");
        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                general: "An unexpected error occurred.",
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#EEF0FF] min-h-screen flex items-center justify-center">
            <div className="bg-[#F5F6FF] p-20 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-[#C7CBFF]">
                <h2 className="text-4xl font-bold text-center mb-10 text-[#444EE7]">
                    Sign In
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* EMAIL */}
                    <div className="mb-8">
                        <label className="block text-[#444EE7] text-base font-semibold mb-3">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`shadow appearance-none border rounded w-full py-5 px-6 text-lg bg-[#F5F6FF] focus:outline-none focus:ring-2
                                ${
                                    errors.email
                                        ? "border-red-500 focus:ring-red-300"
                                        : "border-[#C7CBFF] focus:ring-[#6B74FF]"
                                }`}
                        />

                        {errors.email && (
                            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                <span className="font-bold">!</span>
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-10">
                        <label className="block text-[#444EE7] text-base font-semibold mb-3">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`shadow appearance-none border rounded w-full py-5 px-6 text-lg bg-[#F5F6FF] focus:outline-none focus:ring-2
                                ${
                                    errors.password
                                        ? "border-red-500 focus:ring-red-300"
                                        : "border-[#C7CBFF] focus:ring-[#6B74FF]"
                                }`}
                        />

                        {errors.password && (
                            <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                                <span className="font-bold">!</span>
                                <span>{errors.password}</span>
                            </div>
                        )}
                    </div>

                    {/* GENERAL ERROR */}
                    {errors.general && (
                        <div className="mb-6 rounded-xl bg-red-100 border border-red-400 text-red-700 px-4 py-3 text-center text-sm font-medium">
                            {errors.general}
                        </div>
                    )}

                    {/* ACTIONS */}
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-gradient-to-r from-[#444EE7] to-[#6B74FF] hover:scale-105 text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-transform text-lg"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                        <Link
                            to="/signup"
                            className="inline-block align-baseline font-semibold text-base text-[#444EE7] hover:text-[#6B74FF]"
                        >
                            Create an account
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignIn;
