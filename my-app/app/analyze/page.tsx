"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import PortfolioUploader from "../components/PortfolioUploader";
import MatchScoreCircle from "./components/MatchScoreCircle";
import AtsScoreCard from "./components/AtsScoreCard";
import ResumeBoosterList from "./components/ResumeBoosterList";
import { AlertCircle, FileText, TrendingUp, DollarSign, Target, LayoutDashboard, Lock, Download, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [authPrompt, setAuthPrompt] = useState(false);

    const handleAnalyze = async (file: File) => {
        // ── Auth Guard ──────────────────────────────────────────────
        if (!user) {
            setAuthPrompt(true);
            return;
        }

        setIsAnalyzing(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("resume", file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analyze/upload`, {
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

    const handleDownloadReport = async () => {
        if (!result) return;
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

            addWrappedText("CareerForge - Resume Analysis Report", 22, true, 10);
            addWrappedText(`Generated on: ${new Date().toLocaleDateString()}`, 10, false, 15);

            addWrappedText("Match Analysis", 16, true, 8);
            const score = result.skillGap?.matchingPercentage || result.score;
            addWrappedText(`Score: ${score}%`, 12, false, 6);
            if (result.atsScore) {
                addWrappedText(`ATS Compatibility: ${result.atsScore.score}%`, 12, false, 6);
            }
            addWrappedText(`Best Fit Domain: ${result.bestFitDomain?.toUpperCase() || 'N/A'}`, 12, false, 6);
            addWrappedText(`Status: ${result.status || 'N/A'}`, 12, false, 12);

            addWrappedText("Market Valuation & Roles", 16, true, 8);
            addWrappedText(`Estimated Salary: ${result.salary?.formatted || 'N/A'}`, 12, false, 6);
            if (result.jobTitles && result.jobTitles.length > 0) {
                addWrappedText(`Potential Roles: ${result.jobTitles.join(', ')}`, 12, false, 12);
            } else {
                y += 6;
            }

            if (result.marketAnalysis) {
                addWrappedText("Industry Assessment", 16, true, 8);
                addWrappedText(result.marketAnalysis, 11, false, 12);
            }

            if (result.domainSuitability && result.domainSuitability.length > 0) {
                addWrappedText("Domain Fit Alternatives", 16, true, 8);
                result.domainSuitability.forEach((suit: any) => {
                    addWrappedText(`• ${suit.domain}: ${suit.match}% match`, 11, false, 4);
                });
                y += 8;
            }

            const feedbackItems = result.boosters || result.tips;
            if (feedbackItems && feedbackItems.length > 0) {
                addWrappedText("Resume Boosters & Advice", 16, true, 8);
                feedbackItems.forEach((item: string) => {
                    addWrappedText(`• ${item}`, 11, false, 6);
                });
                y += 6;
            }

            if (result.gaps && result.gaps.length > 0) {
                addWrappedText("Missing Keywords (Consider Adding)", 16, true, 8);
                addWrappedText(result.gaps.join(", "), 11, false, 12);
            }

            doc.save(`CareerForge_Resume_Analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
            
        } catch (err) {
            console.error("PDF generation failed:", err);
            alert("Failed to generate text PDF.");
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
                            id="resume-dashboard"
                        >
                            {/* Download Button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={handleDownloadReport}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all text-sm font-medium"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Report
                                </button>
                            </div>

                            {/* Match Score Circle — Extracted Component */}
                            <MatchScoreCircle
                                score={result.score}
                                bestFitDomain={result.bestFitDomain}
                                status={result.status}
                            />

                            {/* Salary & ATS Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Salary Card */}
                                <div className="glass-panel p-6 rounded-3xl flex flex-col justify-center space-y-4 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden">
                                    <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none" />
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-gray-400 text-sm font-medium mb-1">Estimated Market Salary</p>
                                            <span className="text-3xl sm:text-4xl font-clash font-bold text-white">
                                                {result.salary?.formatted || "₹0L"}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-green-500/10 rounded-2xl text-green-400 relative z-10 shrink-0 ml-2">
                                            <DollarSign className="w-6 sm:w-8 h-6 sm:h-8" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-400/80 mb-2 font-medium">Based on real-world Indian tech benchmarks.</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.jobTitles?.slice(0, 3).map((role: string, i: number) => (
                                                <span key={i} className="px-2 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] border border-white/5 relative z-10">
                                                    {role}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ATS Card — Extracted Component */}
                                {result.atsScore ? (
                                    <AtsScoreCard
                                        score={result.atsScore.score}
                                        breakdown={result.atsScore.breakdown}
                                    />
                                ) : (
                                    <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center space-y-4 bg-gradient-to-br from-white/5 to-transparent border-white/10">
                                        <Activity className="w-8 h-8 text-gray-600 mb-2" />
                                    </div>
                                )}
                            </div>

                            {/* Market Analysis & Domain Suitability */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 glass-panel p-6 rounded-3xl space-y-4 italic bg-white/[0.02]">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Target className="w-4 h-4 text-primary" />
                                        Industry Assessment
                                    </h3>
                                    <p className="text-gray-300 leading-relaxed">
                                        &quot;{result.marketAnalysis || "Your profile shows strong potential in the current market. Focus on bridging the core skill gaps to maximize your competitive edge."}&quot;
                                    </p>
                                    {result.executiveSummary && (
                                        <div className="mt-4 pt-4 border-t border-white/10 not-italic">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Executive Summary</h4>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {result.executiveSummary}
                                            </p>
                                        </div>
                                    )}
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

                            {/* Resume Boosters — Extracted Component */}
                            <ResumeBoosterList
                                boosters={result.boosters}
                                tips={result.tips}
                                gaps={result.gaps}
                            />
                        </motion.div>
                    )}
                </div>
            </div>

            {/* ── Auth Prompt Overlay ─────────────────────────────── */}
            {authPrompt && (
                <div
                    className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Sign up required"
                    onKeyDown={(e) => e.key === "Escape" && setAuthPrompt(false)}
                >
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
                            Create a free account to access our resume analyzer and get personalized career insights.
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
        </main>
    );
}
