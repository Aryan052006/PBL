"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Code2, Cpu, BarChart3, Globe, Sparkles, Loader2, Zap, Target, Lock, Download } from "lucide-react";
import DomainCard from "../components/DomainCard";
import DomainDetailModal from "../components/DomainDetailModal";
import { useRouter } from "next/navigation";

const ANALYSIS_STEPS = [
    "Analyzing your academic profile...",
    "Scanning current market trends...",
    "Matching skills with industry demands...",
    "Generating personalized career roadmap...",
    "Finalizing recommendations..."
];

export default function DomainsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [authPrompt, setAuthPrompt] = useState(false);
    const [formData, setFormData] = useState({
        branch: "ce",
        year: "1",
        skills: ""
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [strategy, setStrategy] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Explore Modal State
    const [selectedDomain, setSelectedDomain] = useState<any>(null);
    const [isExploreLoading, setIsExploreLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Auto-populate branch/year from profile (NOT skills — user may be analyzing for someone else)
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                branch: user.branch || "ce",
                year: user.year || "1",
                skills: "" // Always start blank so user fills it in manually
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // ── Auth Guard ──────────────────────────────────────────────
        if (!user) {
            setAuthPrompt(true);
            return;
        }

        setIsAnalyzing(true);
        setAnalysisStep(0);
        setShowResults(false);
        setErrorMsg(null);

        // Start Analysis Simulation Interval
        const stepInterval = setInterval(() => {
            setAnalysisStep(prev => {
                if (prev < ANALYSIS_STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 800);

        try {
            // Actual API Call
            const res = await fetch("http://localhost:5000/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    branch: formData.branch,
                    year: formData.year,
                    skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                    interests: user.interests || [],
                    cgpa: user.cgpa || 0,
                    projects_count: user.projects_count || 0,
                    internship_experience: user.internship_experience || 0,
                    certifications: user.certifications || 0,
                    coding_platform_rating: user.coding_platform_rating || 0,
                    communication_score: user.communication_score || 5,
                    aptitude_score: user.aptitude_score || 50,
                    hackathon_count: user.hackathon_count || 0,
                }),
            });
            const data = await res.json();

            setTimeout(() => {
                clearInterval(stepInterval);
                setIsAnalyzing(false);
                if (data.success) {
                    setStrategy(data.data);
                    setShowResults(true);
                } else {
                    setErrorMsg(data.msg || "Analysis failed to complete. Please try again.");
                }
            }, 4000);

        } catch (err) {
            console.error("Analysis failed", err);
            clearInterval(stepInterval);
            setIsAnalyzing(false);
            setErrorMsg("Network error: Could not reach the analysis service.");
        }
    };

    const handleExplore = async (domainTitle: string) => {
        setShowModal(true);
        setIsExploreLoading(true);
        setSelectedDomain({ title: domainTitle }); // Placeholder while loading

        try {
            const res = await fetch("http://localhost:5000/api/explore", {
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

    const handleDownloadReport = async () => {
        if (!strategy) return;
        try {
            const { jsPDF } = await import("jspdf");
            
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });

            const margin = 20;
            const pageWidth = doc.internal.pageSize.getWidth();
            const textWidth = pageWidth - (margin * 2);
            let y = margin;

            const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, increment: number = 0) => {
                doc.setFont("helvetica", isBold ? "bold" : "normal");
                doc.setFontSize(fontSize);
                const lines = doc.splitTextToSize(text, textWidth);
                
                if (y + (lines.length * (fontSize * 0.4)) > 280) {
                    doc.addPage();
                    y = margin;
                }
                
                doc.text(lines, margin, y);
                y += (lines.length * (fontSize * 0.4)) + increment;
            };

            // Title
            addWrappedText("CareerForge - Domain Analysis Report", 22, true, 10);
            addWrappedText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, 15);

            // Career Strategy
            addWrappedText("Career Strategy", 16, true, 8);
            addWrappedText(strategy.globalAssessment || "", 11, false, 8);
            addWrappedText(`Top Insight: ${strategy.topInsight || ""}`, 11, true, 12);

            // Skills Overlap
            if (strategy.skillsOverlap) {
                addWrappedText("Skills Overlap", 16, true, 8);
                const matched = strategy.skillsOverlap.matched || [];
                const missing = strategy.skillsOverlap.missing || [];
                
                addWrappedText("Strengths:", 12, true, 4);
                addWrappedText(matched.length > 0 ? matched.join(", ") : "None identified", 11, false, 8);
                
                addWrappedText("Priority Gaps:", 12, true, 4);
                addWrappedText(missing.length > 0 ? missing.join(", ") : "None identified", 11, false, 12);
            }

            // Recommended Paths
            if (strategy.recommendations && strategy.recommendations.length > 0) {
                addWrappedText("Recommended Paths", 16, true, 8);
                
                strategy.recommendations.forEach((rec: any, idx: number) => {
                    addWrappedText(`${idx + 1}. ${rec.title}`, 14, true, 6);
                    addWrappedText(`Match Score: ${rec.matchScore}% | Market Demand: ${rec.marketDemand} | Effort: ${rec.effortToMaster}`, 10, false, 4);
                    if (rec.recommended) {
                        addWrappedText("★ Top Recommendation", 10, true, 4);
                    }
                    addWrappedText(`Key Skills: ${(rec.tags || []).join(", ")}`, 10, false, 4);
                    addWrappedText(rec.reasoning || "", 11, false, 4);
                    addWrappedText(rec.description || "", 11, false, 12);
                });
            }

            doc.save(`CareerForge_Domain_Analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
            
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate text PDF.");
        }
    };

    return (
        <main className="min-h-screen px-4 py-12 md:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-12 text-center space-y-4">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl md:text-6xl font-clash font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-500"
                >
                    Discover Your Perfect <span className="text-secondary">Career Path</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-gray-400 text-lg max-w-2xl mx-auto"
                >
                    Let our engine analyze your profile, skills, and interests to recommend the best domain for your future.
                </motion.p>
            </div>

            {/* Form Section */}
            {
                !showResults && !isAnalyzing && (
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
                                        className="w-full bg-[#13141f] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                                        style={{ colorScheme: "dark" }}
                                    >
                                        <option value="ce" className="bg-[#13141f] text-white">CE</option>
                                        <option value="it" className="bg-[#13141f] text-white">IT</option>
                                        <option value="entc" className="bg-[#13141f] text-white">ENTC</option>
                                        <option value="ece" className="bg-[#13141f] text-white">E &amp; CE</option>
                                        <option value="aids" className="bg-[#13141f] text-white">AIDS</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Year</label>
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full bg-[#13141f] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all appearance-none cursor-pointer"
                                        style={{ colorScheme: "dark" }}
                                    >
                                        <option value="1" className="bg-[#13141f] text-white">First Year</option>
                                        <option value="2" className="bg-[#13141f] text-white">Second Year</option>
                                        <option value="3" className="bg-[#13141f] text-white">Third Year</option>
                                        <option value="4" className="bg-[#13141f] text-white">Final Year</option>
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
                                        placeholder="e.g. Python, React, Arduino, VLSI, TensorFlow..."
                                        className="w-full bg-[#13141f] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-gray-600"
                                    />
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

                        {errorMsg && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
                            >
                                <p className="text-red-400 font-medium">{errorMsg}</p>
                            </motion.div>
                        )}
                    </motion.div>
                )
            }

            {/* Analysis Loading State */}
            {
                isAnalyzing && (
                    <div className="flex flex-col items-center justify-center py-20 space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#FF2E63]/20 blur-xl rounded-full" />
                            <Loader2 className="w-16 h-16 text-[#FF2E63] animate-spin relative z-10" />
                        </div>
                        <div className="space-y-4 text-center max-w-md">
                            <h3 className="text-xl font-medium text-white">
                                {ANALYSIS_STEPS[analysisStep]}
                            </h3>
                            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-[#FF2E63]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Strategy Dashboard Section */}
            {showResults && strategy && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-12"
                    id="strategy-dashboard"
                >
                    {/* Download Report Button */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all text-sm font-medium"
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </button>
                    </div>

                    {/* Dashboard Header: Strategy Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 glass-panel p-8 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border-white/10">
                            <h3 className="text-secondary text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                Career Strategy
                            </h3>
                            <p className="text-xl text-white leading-relaxed font-medium">
                                {strategy.globalAssessment}
                            </p>
                            <div className="mt-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4 items-center">
                                <Zap className="w-6 h-6 text-primary shrink-0" />
                                <p className="text-sm text-gray-300">
                                    <span className="text-primary font-bold">Top Insight:</span> {strategy.topInsight}
                                </p>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-3xl space-y-6">
                            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                <Target className="w-4 h-4 text-primary" />
                                Skills Overlap
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-green-400 font-bold uppercase block mb-2">Strengths</span>
                                    <div className="flex flex-wrap gap-2">
                                        {strategy.skillsOverlap?.matched.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-green-500/10 text-green-300 text-[10px] border border-green-500/20">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[10px] text-primary font-bold uppercase block mb-2">Priority Gaps</span>
                                    <div className="flex flex-wrap gap-2">
                                        {strategy.skillsOverlap?.missing.map((s: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[10px] border border-primary/20">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations Grid */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-px flex-1 bg-white/10" />
                            <span className="text-gray-400 font-medium uppercase tracking-[0.2em] text-xs">Recommended Paths</span>
                            <div className="h-px flex-1 bg-white/10" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(strategy?.recommendations?.length || 0) > 0 ? strategy.recommendations.map((domain: any, index: number) => (
                                <motion.div
                                    key={domain.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="h-full"
                                >
                                    <DomainCard
                                        {...domain}
                                        onExplore={() => handleExplore(domain.title)}
                                    />
                                </motion.div>
                            )) : (
                                <div className="col-span-full py-20 text-center glass-panel rounded-3xl">
                                    <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-medium text-white mb-2">No Matches Found</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto mb-6">
                                        We couldn't find exact matches for your current profile. Try adding more skills or expanding your profile details!
                                    </p>
                                    <button
                                        onClick={() => setShowResults(false)}
                                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all text-sm"
                                    >
                                        Modify Search
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            <DomainDetailModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                domain={selectedDomain || {}}
                isLoading={isExploreLoading}
            />

            {/* ── Auth Prompt Overlay ─────────────────────────────── */}
            {authPrompt && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-8 rounded-3xl max-w-md w-full text-center space-y-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <h2 className="text-2xl font-clash font-bold text-white">Sign Up to Unlock</h2>
                        <p className="text-gray-400">
                            Create a free account to access our AI-powered domain recommendation engine and get personalized career insights.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setAuthPrompt(false)}
                                className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl font-medium text-gray-400 hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => router.push("/sign-up")}
                                className="flex-[2] py-3 bg-primary rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-all"
                            >
                                Sign Up Free
                            </button>
                        </div>
                        <p className="text-xs text-gray-500">
                            Already have an account?{" "}
                            <button onClick={() => router.push("/sign-in")} className="text-secondary hover:underline">Sign In</button>
                        </p>
                    </motion.div>
                </div>
            )}
        </main >
    );
}
