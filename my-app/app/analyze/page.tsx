"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PortfolioUploader from "../components/PortfolioUploader";
import { AlertCircle, FileText, TrendingUp, DollarSign, Briefcase, Zap, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";
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
                    AI Career <span className="text-gradient-primary">Architect</span>
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
                                {/* Score Card */}
                                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium mb-1">Career Match</p>
                                            <h3 className="text-2xl font-bold text-white capitalize">{result.bestFitDomain}</h3>
                                        </div>
                                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                            <TrendingUp className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-3 mb-2">
                                        <span className="text-5xl font-clash font-bold text-white">{result.score}%</span>
                                        <span className="text-sm text-gray-400 mb-2 font-medium bg-white/10 px-2 py-1 rounded-md">{result.status}</span>
                                    </div>
                                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.score}%` }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>

                                {/* Salary Card */}
                                <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-white/5 to-white/[0.02]">
                                    <div className="absolute top-0 right-0 p-24 bg-green-500/5 blur-[60px] rounded-full pointer-events-none" />
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium mb-1">Estimated Value</p>
                                            <h3 className="text-sm font-medium text-gray-300">Annual Salary Potential</h3>
                                        </div>
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                            <DollarSign className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-3 mb-2">
                                        <span className="text-4xl font-clash font-bold text-white">{result.salary.formatted}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                                        {result.jobTitles.slice(0, 2).map((role: string, i: number) => (
                                            <span key={i} className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 text-xs border border-blue-500/20 whitespace-nowrap">
                                                {role}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Resume Booster / Tips */}
                            <div className="glass-panel p-8 rounded-3xl">
                                <h3 className="text-lg font-clash font-semibold text-white mb-6 flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Resume Boosters
                                </h3>

                                <div className="space-y-4">
                                    {result.tips.map((tip: string, i: number) => (
                                        <div key={i} className="p-4 rounded-xl bg-gradient-to-r from-white/5 to-transparent border-l-4 border-l-yellow-400/50 flex gap-4">
                                            <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-gray-400" /></div>
                                            <p className="text-gray-200 text-sm leading-relaxed">{tip}</p>
                                        </div>
                                    ))}
                                    {result.gaps.length > 0 && (
                                        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                            <p className="text-red-400 text-sm font-bold mb-2 uppercase tracking-wide text-xs">Missing Keywords</p>
                                            <div className="flex flex-wrap gap-2">
                                                {result.gaps.map((gap: string) => (
                                                    <span key={gap} className="px-2 py-1 rounded-md bg-red-500/10 text-red-300 text-xs">{gap}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </main>
    );
}
