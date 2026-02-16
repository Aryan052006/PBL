"use client";

import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Cpu, BarChart3, Globe, Sparkles, Loader2 } from "lucide-react";
import DomainCard from "../components/DomainCard";
import DomainDetailModal from "../components/DomainDetailModal";

const AI_STEPS = [
    "Analyzing your academic profile...",
    "Scanning current market trends...",
    "Matching skills with industry demands...",
    "Generating personalized career roadmap...",
    "Finalizing recommendations..."
];

const INTERESTS = [
    "Web Development", "App Development", "AI/ML", "Data Science",
    "Cloud Computing", "Cybersecurity", "Blockchain", "DevOps",
    "Game Development", "UI/UX Design", "IoT", "Robotics"
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
    const [analysisStep, setAnalysisStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [recommendations, setRecommendations] = useState<any[]>([]);

    // Explore Modal State
    const [selectedDomain, setSelectedDomain] = useState<any>(null);
    const [isExploreLoading, setIsExploreLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => {
            const interests = prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest];
            return {
                ...prev,
                interests
            };
        });
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAnalyzing(true);
        setAnalysisStep(0);
        setShowResults(false);

        // Start AI Simulation Interval
        const stepInterval = setInterval(() => {
            setAnalysisStep(prev => {
                if (prev < AI_STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        try {
            // Actual API Call
            const res = await fetch("http://127.0.0.1:5000/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    branch: formData.branch,
                    year: formData.year,
                    skills: formData.skills.split(",").map(s => s.trim()),
                    interests: formData.interests
                }),
            });
            const data = await res.json();

            setTimeout(() => {
                clearInterval(stepInterval);
                setIsAnalyzing(false);
                if (data.success) {
                    setRecommendations(data.data);
                    setShowResults(true);
                }
            }, 4000);

        } catch (err) {
            console.error("Analysis failed", err);
            clearInterval(stepInterval);
            setIsAnalyzing(false);
        }
    };

    const handleExplore = async (domainTitle: string) => {
        setShowModal(true);
        setIsExploreLoading(true);
        setSelectedDomain({ title: domainTitle }); // Placeholder while loading

        try {
            const res = await fetch("http://127.0.0.1:5000/api/explore", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain: domainTitle,
                    branch: formData.branch,
                    year: formData.year,
                    skills: formData.skills.split(",").map(s => s.trim())
                }),
            });
            const data = await res.json();

            if (data.success) {
                setSelectedDomain({ ...data.data, title: domainTitle });
            }
        } catch (err) {
            console.error("Explore failed", err);
        } finally {
            setIsExploreLoading(false);
        }
    };

    return (
        <main className="min-h-screen px-4 py-12 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
                >
                    Discover Your Perfect <span className="text-[#FF2E63]">Career Path</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Let our AI analyze your profile, skills, and interests to recommend the best domain for your future.
                </motion.p>
            </div>

            {/* Form Section */}
            {!showResults && !isAnalyzing && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
                >
                    <form onSubmit={handleSearch} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Branch</label>
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF2E63] transition-colors"
                                >
                                    <option value="cs">Computer Science</option>
                                    <option value="it">Information Technology</option>
                                    <option value="ece">Electronics & Communication</option>
                                    <option value="entc">E & TC</option>
                                    <option value="mech">Mechanical</option>
                                    <option value="civil">Civil</option>
                                    <option value="ai">AI & DS</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#FF2E63] transition-colors"
                                >
                                    <option value="1">First Year</option>
                                    <option value="2">Second Year</option>
                                    <option value="3">Third Year</option>
                                    <option value="4">Final Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Skills (Comma separated)</label>
                            <div className="relative">
                                <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="skills"
                                    value={formData.skills}
                                    onChange={handleChange}
                                    placeholder="e.g. Python, React, Java..."
                                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#FF2E63] transition-colors placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Interests</label>
                            <div className="flex flex-wrap gap-2">
                                {INTERESTS.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => toggleInterest(interest)}
                                        className={`px-4 py-2 rounded-full text-sm transition-all ${formData.interests.includes(interest)
                                                ? "bg-[#FF2E63] text-white shadow-lg shadow-[#FF2E63]/25"
                                                : "bg-white/5 text-gray-400 hover:bg-white/10"
                                            }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#FF2E63] to-[#FF0F4C] text-white font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Analyze Profile
                        </button>
                    </form>
                </motion.div>
            )}

            {/* Analysis Loading State */}
            {isAnalyzing && (
                <div className="flex flex-col items-center justify-center py-20 space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-[#FF2E63]/20 blur-xl rounded-full" />
                        <Loader2 className="w-16 h-16 text-[#FF2E63] animate-spin relative z-10" />
                    </div>
                    <div className="space-y-4 text-center max-w-md">
                        <h3 className="text-xl font-medium text-white">
                            {AI_STEPS[analysisStep]}
                        </h3>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-[#FF2E63]"
                                initial={{ width: "0%" }}
                                animate={{ width: `${((analysisStep + 1) / AI_STEPS.length) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {showResults && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-gray-400 font-medium">AI Recommendations</span>
                        <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((domain, index) => (
                            <motion.div
                                key={domain.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <DomainCard
                                    {...domain}
                                    onExplore={() => handleExplore(domain.title)}
                                />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            <DomainDetailModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                domain={selectedDomain || {}}
                isLoading={isExploreLoading}
            />
        </main>
    );
}
