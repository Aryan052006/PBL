"use client";

import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, BookOpen, Calendar, Mail, Award, CheckCircle2, ArrowRight, Sparkles, Rocket } from "lucide-react";

// Helper to get skill logo (using devicon CDN for simplicity)
const getSkillLogo = (skill: string) => {
    const normalized = skill.toLowerCase().replace(".", "").replace(" ", "");
    return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${normalized}/${normalized}-original.svg`;
};

// Mock fallback logo if not found (handled via error in img tag usually, but for now simple)
const SkillTag = ({ skill, known }: { skill: string; known?: boolean }) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${known
        ? "bg-green-500/10 border-green-500/20 text-green-400"
        : "bg-white/5 border-white/10 text-gray-400"
        } transition-all hover:scale-105`}>
        {/* Simple text based tag, maybe add a mini dot */}
        <div className={`w-2 h-2 rounded-full ${known ? "bg-green-500" : "bg-gray-500"}`} />
        <span className="text-sm font-medium">{skill}</span>
    </div>
);

export default function ProfilePage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/sign-in");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Use real user skills or fallback
    const knownSkills = user.skills && user.skills.length > 0 ? user.skills : [];

    // Use real roadmap or fallback
    const roadmapApps = user.roadmap && user.roadmap.length > 0 ? user.roadmap : [
        // Fallback or empty state if no roadmap generated yet
        { domainTitle: "Get Started", skillsToLearn: ["Complete Onboarding"], skillsHave: [], recommended: true }
    ];

    // Calculate age
    const calculateAge = (birthdate: string) => {
        const birthDate = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const age = user.birthdate ? calculateAge(user.birthdate) : null;

    return (
        <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto space-y-8">
            {/* Header / Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{user.name.charAt(0)}</span>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-clash font-bold text-white">{user.name}</h1>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start text-gray-400 text-sm">
                        <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {user.email}</div>
                        <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> {user.branch}</div>
                        <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {user.year}</div>
                        {age !== null && (
                            <div className="flex items-center gap-1.5">
                                <User className="w-4 h-4" /> {age} years old
                            </div>
                        )}
                    </div>
                </div>

                <button className="px-6 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium">
                    Edit Profile
                </button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Skills You Know */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-panel p-8 rounded-3xl space-y-6"
                >
                    <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                        <Award className="text-green-500 w-5 h-5" />
                        Skills You Know
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {knownSkills.map((skill) => (
                            <SkillTag key={skill} skill={skill} known />
                        ))}
                    </div>
                </motion.div>

                {/* Learning Path */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-panel p-8 rounded-3xl space-y-6"
                >
                    <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                        <ArrowRight className="text-primary w-5 h-5" />
                        Recommended Learning Path
                    </h2>

                    <div className="space-y-4">
                        {roadmapApps.map((path: any, i: number) => (
                            <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="font-medium text-secondary mb-3">{path.domainTitle}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {path.skillsToLearn.map((skill: string) => (
                                        <SkillTag key={skill} skill={skill} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* AI Career Insights */}
            {user.skillAnalysis && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-panel p-8 rounded-3xl space-y-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20"
                >
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Skill Assessment */}
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                                <Sparkles className="text-primary w-5 h-5" />
                                Advanced Skill Assessment
                            </h2>
                            <p className="text-gray-400 leading-relaxed italic">
                                "{user.skillAnalysis}"
                            </p>
                        </div>

                        {/* Future Development */}
                        <div className="flex-1 space-y-4">
                            <h2 className="text-xl font-clash font-semibold text-white flex items-center gap-2">
                                <Rocket className="text-secondary w-5 h-5" />
                                Future Development Suggestions
                            </h2>
                            <ul className="space-y-3">
                                {user.futureDevelopment?.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </motion.div>
            )}
        </main>
    );
}
