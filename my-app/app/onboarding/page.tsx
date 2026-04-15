"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar, Code, CheckCircle2, ArrowRight, ArrowLeft,
    Loader2, BookOpen, Trophy, Star, Cpu, BarChart3
} from "lucide-react";

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

const TOTAL_STEPS = 5;

const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center justify-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
                <div className={`h-2 rounded-full transition-all duration-500 ${
                    i + 1 <= current ? "w-8 bg-primary" : "w-2 bg-white/10"
                }`} />
            </div>
        ))}
    </div>
);

interface StepCardProps { children: React.ReactNode; stepKey: string; }
const StepCard = ({ children, stepKey }: StepCardProps) => (
    <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3 }}
        className="glass-panel p-8 rounded-3xl"
    >
        {children}
    </motion.div>
);

export default function OnboardingPage() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        // Step 1
        dob: "",
        // Step 2
        branch: "",
        year: "",
        // Step 3
        skills: [] as string[],
        interests: [] as string[],
        // Step 4
        cgpa: "",
        projects_count: "",
        internship_experience: "",
        certifications: "",
        hackathon_count: "",
        // Step 5
        coding_platform_rating: "",
        communication_score: 5,
        aptitude_score: "",
    });

    const set = (key: string, value: any) => setFormData(prev => ({ ...prev, [key]: value }));
    const toggleArr = (key: "skills" | "interests", val: string) =>
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].includes(val) ? prev[key].filter(s => s !== val) : [...prev[key], val]
        }));

    const canNext = () => {
        if (step === 1) return !!formData.dob;
        if (step === 2) return !!formData.branch && !!formData.year;
        if (step === 3) return formData.skills.length > 0;
        if (step === 4) return !!formData.cgpa;
        return true;
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/onboarding`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    dob: formData.dob,
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

            const token = localStorage.getItem("token") || "";
            login(token, data.user);
            router.push("/profile");
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full">
                <StepIndicator current={step} />

                <AnimatePresence mode="wait">

                    {/* ── Step 1: Date of Birth ─────────────────────────── */}
                    {step === 1 && (
                        <StepCard stepKey="step1">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="text-primary w-6 h-6" />
                                <h1 className="text-3xl font-clash font-bold text-white">When is your birthday?</h1>
                            </div>
                            <p className="text-gray-400 mb-8">We use this to personalize your career insights.</p>
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={e => set("dob", e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors"
                                        style={{ colorScheme: "dark" }}
                                    />
                                </div>
                            </div>
                            <button onClick={() => setStep(2)} disabled={!canNext()}
                                className="w-full py-4 mt-8 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                                Next Step <ArrowRight className="w-5 h-5" />
                            </button>
                        </StepCard>
                    )}

                    {/* ── Step 2: Branch & Year ─────────────────────────── */}
                    {step === 2 && (
                        <StepCard stepKey="step2">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="text-secondary w-6 h-6" />
                                <h1 className="text-3xl font-clash font-bold text-white">Your Academic Background</h1>
                            </div>
                            <p className="text-gray-400 mb-8">Your branch helps us tailor domain recommendations.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Engineering Branch</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {BRANCHES.map(b => (
                                            <button key={b} onClick={() => set("branch", b.toLowerCase().replace(" & ", "").replace(" ", ""))}
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
                                            <button key={y} onClick={() => set("year", y)}
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
                                <button onClick={() => setStep(1)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(3)} disabled={!canNext()}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepCard>
                    )}

                    {/* ── Step 3: Skills & Interests ────────────────────── */}
                    {step === 3 && (
                        <StepCard stepKey="step3">
                            <div className="flex items-center gap-3 mb-2">
                                <Code className="text-primary w-6 h-6" />
                                <h1 className="text-3xl font-clash font-bold text-white">Skills & Interests</h1>
                            </div>
                            <p className="text-gray-400 mb-6">Select your known technologies and career interests.</p>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm text-gray-400 mb-3 block">Technologies You Know</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                        {TECH_STACKS.map(skill => (
                                            <button key={skill} onClick={() => toggleArr("skills", skill)}
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
                                            <button key={interest} onClick={() => toggleArr("interests", interest)}
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
                                <button onClick={() => setStep(2)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(4)} disabled={!canNext()}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepCard>
                    )}

                    {/* ── Step 4: Academic Metrics ──────────────────────── */}
                    {step === 4 && (
                        <StepCard stepKey="step4">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 className="text-secondary w-6 h-6" />
                                <h1 className="text-3xl font-clash font-bold text-white">Academic Metrics</h1>
                            </div>
                            <p className="text-gray-400 mb-8">These are used by our KNN model to score your career readiness.</p>
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
                                            type={type}
                                            min="0"
                                            value={(formData as any)[key]}
                                            onChange={e => set(key, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-600"
                                        />
                                        <p className="text-xs text-gray-600">{hint}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(3)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={() => setStep(5)} disabled={!canNext()}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-40">
                                    Next Step <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </StepCard>
                    )}

                    {/* ── Step 5: Skill Scores ──────────────────────────── */}
                    {step === 5 && (
                        <StepCard stepKey="step5">
                            <div className="flex items-center gap-3 mb-2">
                                <Star className="text-yellow-400 w-6 h-6" />
                                <h1 className="text-3xl font-clash font-bold text-white">Self Assessment</h1>
                            </div>
                            <p className="text-gray-400 mb-8">Be honest — this improves the accuracy of your recommendations.</p>
                            <div className="space-y-6">
                                {/* Coding Platform Rating */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Coding Platform Rating <span className="text-gray-600">(LeetCode / HackerRank / CodeChef)</span></label>
                                    <input
                                        type="number" min="0" max="2500"
                                        value={formData.coding_platform_rating}
                                        onChange={e => set("coding_platform_rating", e.target.value)}
                                        placeholder="e.g. 1200 (enter 0 if not on any platform)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-600"
                                    />
                                </div>

                                {/* Communication Score */}
                                <div className="space-y-3">
                                    <label className="text-sm text-gray-400">
                                        Communication Skills — <span className="text-white font-medium">{formData.communication_score}/10</span>
                                    </label>
                                    <input
                                        type="range" min="1" max="10" step="1"
                                        value={formData.communication_score}
                                        onChange={e => set("communication_score", parseInt(e.target.value))}
                                        className="w-full accent-primary cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>1 — Needs Work</span>
                                        <span>5 — Average</span>
                                        <span>10 — Excellent</span>
                                    </div>
                                </div>

                                {/* Aptitude Score */}
                                <div className="space-y-1">
                                    <label className="text-sm text-gray-400">Aptitude Score <span className="text-gray-600">(from placement test / mock, 0–100)</span></label>
                                    <input
                                        type="number" min="0" max="100"
                                        value={formData.aptitude_score}
                                        onChange={e => set("aptitude_score", e.target.value)}
                                        placeholder="e.g. 75 (leave blank if unknown)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-colors placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

                            <div className="flex gap-3 mt-8">
                                <button onClick={() => setStep(4)} className="px-5 py-4 rounded-xl text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button onClick={handleSubmit} disabled={isLoading}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {isLoading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing your profile...</>
                                    ) : (
                                        <><Cpu className="w-5 h-5" /> Complete Profile & Run AI Analysis</>
                                    )}
                                </button>
                            </div>
                        </StepCard>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
