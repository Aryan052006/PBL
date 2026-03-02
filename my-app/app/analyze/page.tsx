"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PortfolioUploader from "../components/PortfolioUploader";
import { AlertCircle, FileText, TrendingUp, DollarSign, Briefcase, Zap, CheckCircle2, ChevronRight, AlertTriangle, Target, LayoutDashboard, Rocket } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AnalyzePage() {
    const { user } = useAuth();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleAnalyze = async (file: File) => {
        setIsAnalyzing(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await fetch("http://localhost:5000/api/analyze/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || "Analysis failed");

            setResult(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };


    return (
        <main className="min-h-screen px-4 py-12 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-clash font-bold">
                    Smart Career <span className="text-gradient-primary">Architect</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Upload your resume to unlock a professional career breakdown. We analyze your fit across multiple engineering domains, estimate your market value, and tell you exactly how to get hired.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Uploader (Takes 4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl sticky top-24">
                        <h2 className="text-xl font-clash font-semibold mb-6 flex items-center gap-2">
                            <FileText className="text-primary w-5 h-5" />
                            Resume Input
                        </h2>
                        <PortfolioUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
                        {error && (
                            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl text-center font-medium">
                                <AlertCircle className="w-5 h-5 mx-auto mb-2 text-red-500" />
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Dashboard (Takes 8 cols) */}
                <div className="lg:col-span-8">
                    {!result ? (
                        // Empty State
                        <div className="h-full min-h-[400px] glass-panel rounded-3xl flex flex-col items-center justify-center text-center p-8 opacity-50 border-dashed">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <TrendingUp className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Ready to Analyze</h3>
                            <p className="text-gray-500 max-w-sm">Upload your resume to see your Salary Estimate, Best Fit Role, and Resume Boosters.</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Top Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Match Analysis Card */}
                                <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row gap-6 items-center bg-gradient-to-br from-white/5 to-transparent border-white/10">
                                    {/* Animated Match Score Circle */}
                                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="64" cy="64" r="48" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                            <motion.circle
                                                cx="64" cy="64" r="48"
                                                fill="transparent"
                                                stroke="#FF2E63"
                                                strokeWidth="8"
                                                strokeDasharray={2 * Math.PI * 48}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - (result.skillGap?.matchingPercentage || result.score) / 100) }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="text-3xl font-bold text-white"
                                            >
                                                {result.skillGap?.matchingPercentage || result.score}%
                                            </motion.span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">Score</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2 text-center md:text-left">
                                        <p className="text-gray-400 text-sm font-medium">Best Fit Domain</p>
                                        <h3 className="text-2xl font-bold text-white capitalize">{result.bestFitDomain}</h3>
                                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
                                            {result.status}
                                        </div>
                                    </div>
                                </div>

                                {/* Salary & Efficiency Card */}
                                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center space-y-4 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium mb-1">Market Valuation</p>
                                            <span className="text-3xl font-clash font-bold text-white">{result.salary.formatted}</span>
                                        </div>
                                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {result.jobTitles.slice(0, 3).map((role: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] border border-white/5">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Market Analysis & Domain Suitability */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-4 italic bg-white/[0.02]">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-4 h-4 text-primary" />
                                        Industry Assessment
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        "{result.marketAnalysis || "Your profile shows strong potential in the current market. Focus on bridging the core skill gaps to maximize your competitive edge."}"
                                    </p>
                                </div>
                                <div className="glass-panel p-6 rounded-3xl space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <LayoutDashboard className="w-4 h-4 text-secondary" />
                                        Domain Fit
                                    </h3>
                                    <div className="space-y-3">
                                        {(result.domainSuitability || [
                                            { domain: result.bestFitDomain, match: result.score },
                                            { domain: "Other Options", match: Math.max(0, result.score - 20) }
                                        ]).map((suit: any, i: number) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-gray-400">{suit.domain}</span>
                                                    <span className="text-white font-medium">{suit.match}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-secondary" style={{ width: `${suit.match}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Resume Boosters / Actionable Feedback */}
                            <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-yellow-500/[0.03] to-transparent">
                                <h3 className="text-lg font-clash font-semibold text-white mb-6 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Resume Boosters
                                </h3>

                                <div className="space-y-4 mb-8">
                                    {(result.boosters || result.tips).map((item: string, i: number) => (
                                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:bg-white/[0.07] transition-all">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
                                            <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
                                        </div>
                                    ))}
                                </div>

                                {result.tips && result.boosters && (
                                    <>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Career Advice</h4>
                                        <div className="space-y-3">
                                            {result.tips.map((tip: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-sm text-gray-400">
                                                    <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                    <p>{tip}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {result.gaps && result.gaps.length > 0 && (
                                    <div className="mt-8 pt-8 border-t border-white/10">
                                        <p className="text-red-400 text-sm font-bold mb-4 uppercase tracking-wide text-xs flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            Missing Keywords
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.gaps.map((gap: string) => (
                                                <span key={gap} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 text-xs font-medium border border-red-500/10">
                                                    {gap}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
