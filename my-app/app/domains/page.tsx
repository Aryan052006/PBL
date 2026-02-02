"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Cpu, BarChart3, Globe } from "lucide-react";
import DomainCard from "../components/DomainCard";

// Mock Data for demonstration
const MOCK_DOMAINS = [
    {
        id: 1,
        title: "Full Stack Development",
        matchScore: 92,
        description: "Build end-to-end web applications. High demand for MERN/Next.js stacks.",
        tags: ["React", "Node.js", "MongoDB", "System Design"],
        recommended: true,
    },
    {
        id: 2,
        title: "Data Science & AI",
        matchScore: 85,
        description: "Analyze complex data and build predictive models using ML algorithms.",
        tags: ["Python", "TensorFlow", "Statistics", "SQL"],
        recommended: false,
    },
    {
        id: 3,
        title: "Cloud Engineering",
        matchScore: 78,
        description: "Design and manage scalable infrastructure on AWS/Azure/GCP.",
        tags: ["AWS", "Docker", "Kubernetes", "CI/CD"],
        recommended: false,
    },
];

export default function DomainsPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        branch: "cs",
        year: "1",
        skills: "",
        interests: [] as string[]
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Auto-fill from profile
    useEffect(() => {
        if (user) {
            setFormData({
                branch: user.branch || "cs",
                year: user.year?.charAt(0) || "1",
                skills: user.skills ? user.skills.join(", ") : "",
                interests: user.interests || []
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);
        // Simulate API call
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
        }, 1500);
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest];
            return { ...prev, interests };
        });
    };

    return (
        <main className="min-h-screen px-4 py-12 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-clash font-bold">
                    Find Your <span className="text-gradient-secondary">Perfect Domain</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Input your branch, skills, and interests. Our rule-based engine will map you to the best career paths in engineering.
                </p>
            </div>

            {/* Input Section */}
            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleSearch}
                className="glass-panel p-8 rounded-3xl max-w-3xl mx-auto mb-16 space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Current Branch</label>
                        <select
                            name="branch"
                            value={formData.branch}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-colors"
                        >
                            <option className="bg-black" value="cs">Computer Science (CSE/IT)</option>
                            <option className="bg-black" value="ece">Electronics (ECE)</option>
                            <option className="bg-black" value="mech">Mechanical</option>
                            <option className="bg-black" value="civil">Civil</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Academic Year</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-colors"
                        >
                            <option className="bg-black" value="1">1st Year</option>
                            <option className="bg-black" value="2">2nd Year</option>
                            <option className="bg-black" value="3">3rd Year</option>
                            <option className="bg-black" value="4">4th Year</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Top Skills (Comma separated)</label>
                    <input
                        type="text"
                        name="skills"
                        value={formData.skills}
                        onChange={handleChange}
                        placeholder="e.g. Java, Python, React, Communication"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-secondary/50 transition-colors"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Areas of Interest</label>
                    <div className="flex flex-wrap gap-3">
                        {["Web Dev", "App Dev", "AI/ML", "IoT", "Robotics", "Blockchain"].map((interest) => (
                            <label key={interest} className="cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={formData.interests.includes(interest)}
                                    onChange={() => toggleInterest(interest)}
                                />
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-400 peer-checked:bg-secondary/20 peer-checked:text-secondary peer-checked:border-secondary/50 transition-all">
                                    {interest}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isAnalyzing}
                    className="w-full py-4 bg-primary rounded-xl font-bold text-lg text-white shadow-[0_0_20px_rgba(255,46,99,0.4)] hover:shadow-[0_0_30px_rgba(255,46,99,0.6)] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing Profile...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            Find My Usage
                        </>
                    )}
                </button>
            </motion.form>

            {/* Results Section */}
            {showResults && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-gray-400 font-medium">Recommended Paths</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MOCK_DOMAINS.map((domain) => (
                            <motion.div
                                key={domain.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: domain.id * 0.1 }}
                            >
                                <DomainCard {...domain} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </main>
    );
}
