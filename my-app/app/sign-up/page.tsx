"use client";

import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Lock, Mail, User, BookOpen, Calendar, ArrowRight, ArrowLeft, Loader2,
    ChevronDown, Award, Sparkles, Code, CheckCircle2, BarChart3, Star, Cpu
} from "lucide-react";
import { useRouter } from "next/navigation";

const BRANCHES = ["CE", "IT", "ENTC", "E & CE", "AIDS"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const TECH_STACKS = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Node.js",
    "Express", "MongoDB", "PostgreSQL", "Python", "Java", "C++", "C", "C#",
    "Flutter", "React Native", "Docker", "AWS", "Azure", "TensorFlow", "PyTorch",
    "Arduino", "Verilog", "MATLAB", "Solidity", "ROS", "OpenCV",
];
const INTERESTS = [
    "Web Dev", "AI/ML", "Data Science", "Cloud/DevOps", "Cybersecurity",
    "Embedded/IoT", "VLSI", "Robotics", "Blockchain", "NLP", "Computer Vision",
    "Data Engineering", "Signal Processing", "Telecom/5G",
];

const TOTAL_STEPS = 6;

const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                    i + 1 <= current ? "w-8 bg-primary" : "w-2 bg-white/10"
                }`} />
            </div>
        ))}
    </div>
);

export default function SignUpPage() {
    const { login } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        otp: "",
        birthdate: "",
        branch: "",
        year: "",
        skills: [] as string[],
        interests: [] as string[],
        // KNN fields
        cgpa: "",
        projects_count: "",
        internship_experience: "",
        certifications: "",
        hackathon_count: "",
        coding_platform_rating: "",
        communication_score: 5,
        aptitude_score: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const set = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));
    const toggleArr = (key: "skills" | "interests", val: string) =>
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].includes(val) ? prev[key].filter((s: string) => s !== val) : [...prev[key], val]
        }));

    const handleInitSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5000/api/auth/signup-init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
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
            const res = await fetch("http://localhost:5000/api/auth/verify-otp", {
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

    const handleCompleteSignup = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5000/api/auth/complete-signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    birthdate: formData.birthdate,
                    branch: formData.branch,
                    year: formData.year,
                    skills: formData.skills,
                    interests: formData.interests,
                    cgpa: parseFloat(formData.cgpa) || 0,
                    projects_count: parseInt(formData.projects_count) || 0,
                    internship_experience: parseInt(formData.internship_experience) || 0,
                    certifications: parseInt(formData.certifications) || 0,
                    hackathon_count: parseInt(formData.hackathon_count) || 0,
                    coding_platform_rating: parseInt(formData.coding_platform_rating) || 0,
                    communication_score: formData.communication_score,
                    aptitude_score: parseFloat(formData.aptitude_score) || 50,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Onboarding failed");
            login(data.token, data.user);
            router.push("/profile");
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
                className="max-w-2xl w-full glass-panel p-8 rounded-3xl"
            >
                <StepIndicator current={step} />

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-clash font-bold text-white mb-2">
                        {step === 1 && "Create Account"}
                        {step === 2 && "Verify Email"}
                        {step === 3 && "About You"}
                        {step === 4 && "Skills & Interests"}
                        {step === 5 && "Academic Metrics"}
                        {step === 6 && "Self Assessment"}
                    </h1>
                    <p className="text-gray-400">
                        {step === 1 && "Start your journey with CareerForge"}
                        {step === 2 && `Enter the 6-digit code sent to ${formData.email}`}
                        {step === 3 && "Your birthdate, branch, and year"}
                        {step === 4 && "Select your known technologies and interests"}
                        {step === 5 && "Used by our KNN model for career scoring"}
                        {step === 6 && "Be honest — this improves recommendation accuracy"}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">

                    {/* ── Step 1: Create Account ───────────────── */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <form onSubmit={handleInitSignup} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            placeholder="John Doe" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            placeholder="you@university.edu" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            placeholder="••••••••" />
                                    </div>
                                </div>
                                <button type="submit" disabled={isLoading}
                                    className="w-full py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2">
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Next <ArrowRight className="w-5 h-5" /></>}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* ── Step 2: Verify OTP ────────────────────── */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400 text-center block">Verification Code</label>
                                    <input type="text" name="otp" value={formData.otp} onChange={handleChange} required maxLength={6}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-center text-3xl font-bold tracking-[1em] text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                        placeholder="000000" />
                                </div>
                                <div className="flex gap-4">
                                    <button type="button" onClick={() => setStep(1)}
                                        className="flex-1 py-3 mt-4 bg-white/5 border border-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-all">
                                        Back
                                    </button>
                                    <button type="submit" disabled={isLoading}
                                        className="flex-[2] py-3 mt-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2">
                                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Verify OTP <ArrowRight className="w-5 h-5" /></>}
                                    </button>
                                </div>
                                <p className="text-center text-xs text-gray-500 mt-4">
                                    Didn&apos;t get the code? <button type="button" onClick={handleInitSignup} className="text-secondary hover:underline">Resend</button>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {/* ── Step 3: Birthdate + Branch + Year ─────── */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Date of Birth</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                        <input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} required
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all"
                                            style={{ colorScheme: "dark" }} />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Engineering Branch</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {BRANCHES.map(b => (
                                            <button key={b} type="button" onClick={() => set("branch", b.toLowerCase().replace(" & ", "").replace(" ", ""))}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                                    formData.branch === b.toLowerCase().replace(" & ", "").replace(" ", "")
                                                        ? "bg-primary/20 border-primary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Current Year</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {YEARS.map(y => (
                                            <button key={y} type="button" onClick={() => set("year", y)}
                                                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                                                    formData.year === y
                                                        ? "bg-secondary/20 border-secondary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>
                                                {y}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(2)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(4)} disabled={!formData.birthdate || !formData.branch || !formData.year}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 4: Skills & Interests ────────────── */}
                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Technologies You Know</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {TECH_STACKS.map(skill => (
                                            <button key={skill} type="button" onClick={() => toggleArr("skills", skill)}
                                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                                                    formData.skills.includes(skill)
                                                        ? "bg-primary/20 border-primary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>
                                                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${formData.skills.includes(skill) ? "opacity-100" : "opacity-0"}`} />
                                                {skill}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Career Interests</label>
                                    <div className="flex flex-wrap gap-2">
                                        {INTERESTS.map(interest => (
                                            <button key={interest} type="button" onClick={() => toggleArr("interests", interest)}
                                                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                                                    formData.interests.includes(interest)
                                                        ? "bg-secondary/20 border-secondary text-white"
                                                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                                }`}>
                                                {interest}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(3)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(5)} disabled={formData.skills.length === 0}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 5: Academic Metrics ──────────────── */}
                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: "CGPA", key: "cgpa", placeholder: "e.g. 8.5", type: "number", hint: "Out of 10", required: true },
                                    { label: "Projects Completed", key: "projects_count", placeholder: "e.g. 4", type: "number", hint: "Personal + academic" },
                                    { label: "Internship Duration", key: "internship_experience", placeholder: "e.g. 3", type: "number", hint: "Total months" },
                                    { label: "Certifications", key: "certifications", placeholder: "e.g. 2", type: "number", hint: "Online or industry certs" },
                                    { label: "Hackathons Participated", key: "hackathon_count", placeholder: "e.g. 1", type: "number", hint: "Including online hackathons" },
                                ].map(({ label, key, placeholder, type, hint, required }) => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-sm text-gray-400">{label} {required && <span className="text-primary">*</span>}</label>
                                        <input
                                            type={type} min="0"
                                            value={(formData as any)[key]}
                                            onChange={e => set(key, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder-gray-600"
                                        />
                                        <p className="text-xs text-gray-600">{hint}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(4)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(6)} disabled={!formData.cgpa}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 6: Self Assessment ───────────────── */}
                    {step === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                            <div className="space-y-6">
                                {/* Coding Platform Rating */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Coding Platform Rating <span className="text-gray-600">(LeetCode / HackerRank / CodeChef)</span></label>
                                    <input type="number" min="0" max="2500"
                                        value={formData.coding_platform_rating}
                                        onChange={e => set("coding_platform_rating", e.target.value)}
                                        placeholder="e.g. 1200 (enter 0 if not on any platform)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder-gray-600" />
                                </div>

                                {/* Communication Score */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400">
                                        Communication Skills — <span className="text-white font-medium">{formData.communication_score}/10</span>
                                    </label>
                                    <input type="range" min="1" max="10" step="1"
                                        value={formData.communication_score}
                                        onChange={e => set("communication_score", parseInt(e.target.value))}
                                        className="w-full accent-primary cursor-pointer" />
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>1 — Basic</span>
                                        <span>5 — Average</span>
                                        <span>10 — Excellent</span>
                                    </div>
                                </div>

                                {/* Aptitude Score */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Aptitude Score <span className="text-gray-600">(from placement test / mock, 0–100)</span></label>
                                    <input type="number" min="0" max="100"
                                        value={formData.aptitude_score}
                                        onChange={e => set("aptitude_score", e.target.value)}
                                        placeholder="e.g. 75 (leave blank if unknown)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder-gray-600" />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(5)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleCompleteSignup} disabled={isLoading}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your profile...</>
                                    ) : (
                                        <><Cpu className="w-5 h-5" /> Complete Profile & Run AI Analysis</>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>

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
