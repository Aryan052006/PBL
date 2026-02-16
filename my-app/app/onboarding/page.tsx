"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Code, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const TECH_STACKS = [
    "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js",
    "Node.js", "Express", "MongoDB", "PostgreSQL", "Python",
    "Java", "C++", "C#", "Flutter", "React Native", "Docker", "AWS"
];

export default function OnboardingPage() {
    const { user, login } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        dob: "",
        skills: [] as string[]
    });

    const toggleSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill]
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://127.0.0.1:5000/api/auth/onboarding", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    dob: formData.dob,
                    skills: formData.skills
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Onboarding failed");

            // Update local user state if possible, or just redirect
            // Ideally we should update the context, but for now let's redirect
            // Validation: data.user contains updated info.
            // A hard reload or re-fetch would update context.
            // Let's rely on Profile page re-fetching or initial hydration if context updates.
            // Ideally, we call an 'updateUser' from context, but `login` basically sets it.
            // So we can re-call login with new data to update context.
            if (data.user) {
                // Update context with new user data (including skills/roadmap)
                // We reuse the existing token
                const token = localStorage.getItem("token") || "";
                login(token, data.user);
            }

            router.push("/profile");

        } catch (err) {
            console.error(err);
            // Handle error (maybe show toast)
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full">
                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mb-8">
                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 1 ? "w-8 bg-primary" : "w-2 bg-white/10"}`} />
                    <div className={`h-2 rounded-full transition-all duration-300 ${step >= 2 ? "w-8 bg-primary" : "w-2 bg-white/10"}`} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel p-8 rounded-3xl"
                        >
                            <h1 className="text-3xl font-clash font-bold text-white mb-2">When is your birthday?</h1>
                            <p className="text-gray-400 mb-8">We use this to personalize your experience.</p>

                            <div className="space-y-4">
                                <label className="text-sm text-gray-400">Date of Birth</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 transition-colors cursor-pointer" // cursor-pointer for date picker area
                                        style={{ colorScheme: 'dark' }} // Attempt to make calendar dark mode
                                    />
                                </div>
                            </div>

                            <button
                                onClick={nextStep}
                                disabled={!formData.dob}
                                className="w-full py-4 mt-8 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step <ArrowRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-panel p-8 rounded-3xl"
                        >
                            <h1 className="text-3xl font-clash font-bold text-white mb-2">What do you know?</h1>
                            <p className="text-gray-400 mb-8">Select the technologies you are already comfortable with.</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {TECH_STACKS.map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-sm font-medium ${formData.skills.includes(skill)
                                            ? "bg-primary/20 border-primary text-white"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        <CheckCircle2 className={`w-4 h-4 ${formData.skills.includes(skill) ? "opacity-100" : "opacity-0"}`} />
                                        {skill}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={prevStep}
                                    className="px-6 py-4 rounded-xl font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 py-4 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Profile"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
