"use client";

import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, User, BookOpen, Calendar, ArrowRight, Loader2, ChevronDown, Award, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: Info, 2: OTP, 3: Birthdate, 4: Domain
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        otp: "",
        birthdate: "",
        branch: "Computer Science",
        year: "1st Year",
        skills: "",
        interests: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleInitSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/signup-init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Signup failed");

            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: formData.email, otp: formData.otp }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Verification failed");

            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompleteSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/complete-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    skills: formData.skills.split(",").map(s => s.trim()).filter(s => s),
                    interests: formData.interests.split(",").map(s => s.trim()).filter(s => s)
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Onboarding failed");

            login(data.token, data.user);
            router.push('/profile');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full glass-panel p-8 rounded-3xl"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-clash font-bold text-white mb-2">
                        {step === 1 && "Create Account"}
                        {step === 2 && "Verify Email"}
                        {step === 3 && "Tell us more"}
                        {step === 4 && "Choose your path"}
                    </h1>
                    <p className="text-gray-400">
                        {step === 1 && "Start your journey with CareerForge"}
                        {step === 2 && `Enter the 6-digit code sent to ${formData.email}`}
                        {step === 3 && "We need your birthdate to customize your profile"}
                        {step === 4 && "Tell us your academic details"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleInitSignup} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="you@university.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400 text-center block">Verification Code</label>
                            <input
                                type="text"
                                name="otp"
                                value={formData.otp}
                                onChange={handleChange}
                                required
                                maxLength={6}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[1em] text-primary focus:outline-none focus:border-primary/50 transition-colors"
                                placeholder="000000"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 mt-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ArrowRight className="w-5 h-5" /></>}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            Didn't get the code? <button type="button" onClick={handleInitSignup} className="text-secondary hover:underline">Resend</button>
                        </p>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={(e) => { e.preventDefault(); setStep(4); }} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Date of Birth</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="date"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="flex-1 py-3 mt-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                className="flex-[2] py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <form onSubmit={handleCompleteSignup} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Branch</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                                    <select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none relative z-20 cursor-pointer"
                                    >
                                        <option className="bg-black" value="Computer Science">Computer Science</option>
                                        <option className="bg-black" value="Information Technology">Information Technology</option>
                                        <option className="bg-black" value="Electronics (ECE)">Electronics (ECE)</option>
                                        <option className="bg-black" value="Mechanical">Mechanical</option>
                                        <option className="bg-black" value="Civil">Civil</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-gray-400">Year</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-10 text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none relative z-20 cursor-pointer"
                                    >
                                        <option className="bg-black" value="1st Year">1st Year</option>
                                        <option className="bg-black" value="2nd Year">2nd Year</option>
                                        <option className="bg-black" value="3rd Year">3rd Year</option>
                                        <option className="bg-black" value="4th Year">4th Year</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-gray-500 z-10" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Skills (comma separated)</label>
                            <div className="relative">
                                <Award className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="React, Node.js, Python..."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-gray-400">Interests (comma separated)</label>
                            <div className="relative">
                                <Sparkles className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="interests"
                                    value={formData.interests}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Web Dev, AI, Data Science..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setStep(3)}
                                className="flex-1 py-3 mt-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Analyzing Profile...</span>
                                    </>
                                ) : (
                                    <>Finish & View Profile <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <p className="text-center mt-6 text-gray-400">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-secondary hover:underline font-medium">
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}
