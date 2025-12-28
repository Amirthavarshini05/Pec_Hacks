import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabase";

function SignUp({ onSignup }) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        password: "",
        general: "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({ name: "", email: "", password: "", general: "" });

        if (!form.name) {
            setErrors((prev) => ({ ...prev, name: "Full name is required" }));
            return;
        }

        if (!form.email) {
            setErrors((prev) => ({ ...prev, email: "Email is required" }));
            return;
        }

        if (!form.password) {
            setErrors((prev) => ({ ...prev, password: "Password is required" }));
            return;
        }

        setLoading(true);

        const { data: existing, error: checkError } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", form.email)
            .maybeSingle();

        if (checkError) {
            setErrors((prev) => ({
                ...prev,
                general: "Something went wrong. Try again.",
            }));
            setLoading(false);
            return;
        }

        if (existing) {
            setErrors((prev) => ({
                ...prev,
                general: "User already exists. Please sign in.",
            }));
            setLoading(false);
            return;
        }

        const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
        });

        if (error) {
            setErrors((prev) => ({ ...prev, general: error.message }));
            setLoading(false);
            sessionStorage.clear();
            return;
        }

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("signUpEmail", form.email);

        const { error: profileError } = await supabase.from("profiles").insert({
            fullname: form.name,
            email: form.email,
        });

        if (profileError) {
            setErrors((prev) => ({
                ...prev,
                general: "Error creating profile. Try again.",
            }));
            setLoading(false);
            return;
        }

        onSignup?.();
        navigate("/profile-setup-basic");
        setLoading(false);
    };

    return (
        <div className="bg-[#EEF0FF] min-h-screen flex items-center justify-center">
            <div className="bg-[#F5F6FF] p-20 rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-[#C7CBFF]">
                <h2 className="text-4xl font-bold text-center mb-10 text-[#444EE7]">
                    Sign Up
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="mb-8">
                        <label className="block text-[#444EE7] font-semibold mb-3">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className={`shadow border rounded w-full py-5 px-6 text-lg bg-[#F5F6FF] focus:outline-none focus:ring-2
                            ${
                                errors.name
                                    ? "border-red-500 focus:ring-red-300"
                                    : "border-[#C7CBFF] focus:ring-[#6B74FF]"
                            }`}
                        />
                        {errors.name && (
                            <div className="mt-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                                <span className="font-bold">!</span>{" "}
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-8">
                        <label className="block text-[#444EE7] font-semibold mb-3">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className={`shadow border rounded w-full py-5 px-6 text-lg bg-[#F5F6FF] focus:outline-none focus:ring-2
                            ${
                                errors.email
                                    ? "border-red-500 focus:ring-red-300"
                                    : "border-[#C7CBFF] focus:ring-[#6B74FF]"
                            }`}
                        />
                        {errors.email && (
                            <div className="mt-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                                <span className="font-bold">!</span>{" "}
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-10">
                        <label className="block text-[#444EE7] font-semibold mb-3">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className={`shadow border rounded w-full py-5 px-6 text-lg bg-[#F5F6FF] focus:outline-none focus:ring-2
                            ${
                                errors.password
                                    ? "border-red-500 focus:ring-red-300"
                                    : "border-[#C7CBFF] focus:ring-[#6B74FF]"
                            }`}
                        />
                        {errors.password && (
                            <div className="mt-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                                <span className="font-bold">!</span>{" "}
                                <span>{errors.password}</span>
                            </div>
                        )}
                    </div>

                    {/* General error */}
                    {errors.general && (
                        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl text-center text-sm">
                            {errors.general}
                        </div>
                    )}

                    <div className="flex items-center justify-between mb-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`bg-gradient-to-r from-[#444EE7] to-[#6B74FF] text-white font-bold py-4 px-10 rounded-xl shadow-lg transition-transform text-lg
                            ${
                                loading
                                    ? "opacity-60 cursor-not-allowed"
                                    : "hover:scale-105"
                            }`}
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>

                        <Link
                            to="/signin"
                            className="font-semibold text-[#444EE7] hover:text-[#6B74FF]"
                        >
                            Already have an account?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
