"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, TrendingUp, DollarSign, Lightbulb, Rocket } from "lucide-react";

interface DomainDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    domain: any;
    isLoading: boolean;
}


export default function DomainDetailModal({ isOpen, onClose, domain, isLoading }: DomainDetailModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8 custom-scrollbar"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-400 animate-pulse text-center">Processing your profile with our analysis engine...</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Header & Skill Gap Chart */}
                            <div className="flex flex-col lg:flex-row gap-10 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-4xl md:text-5xl font-clash font-bold text-white">
                                            {domain.title || "Career Path"}
                                        </h2>
                                        {domain.currentStatus && (
                                            <div className="px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-bold animate-pulse">
                                                {domain.currentStatus}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                                        <p className="text-gray-300 text-lg leading-relaxed">
                                            {domain.matchReasoning || domain.detailedAnalysis || domain.overview}
                                        </p>
                                    </div>

                                    {/* Matched Skills Section */}
                                    {domain.skillGap?.matchedSkills?.length > 0 && (
                                        <div className="space-y-3">
                                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Matching Foundations</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {domain.skillGap.matchedSkills.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full lg:w-auto p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Readiness Score</h3>
                                    <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="80" cy="80" r="56" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                                            <motion.circle
                                                cx="80" cy="80" r="56"
                                                fill="transparent"
                                                stroke="#FF2E63"
                                                strokeWidth="10"
                                                strokeDasharray={2 * Math.PI * 56}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - (domain.skillGap?.matchingPercentage || 0) / 100) }}
                                                transition={{ duration: 2, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center">
                                            <motion.span
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 }}
                                                className="text-4xl font-bold text-white"
                                            >
                                                {domain.skillGap?.matchingPercentage || 0}%
                                            </motion.span>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium">Ready</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium">
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Mastery</div>
                                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10" /> Growth Gap</div>
                                    </div>
                                </div>
                            </div>

                            {/* Key Stats: Salary & Next Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-[#FF2E63]/5 border border-[#FF2E63]/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Lightbulb className="w-16 h-16 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-3 text-primary">
                                        <Lightbulb className="w-6 h-6" />
                                        <h3 className="font-semibold text-xl">Top Learning Priority</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-white mb-2">{domain.nextLearningPriority || "Researching..."}</p>
                                    <p className="text-sm text-gray-400">Master this next to significantly boost your employability.</p>
                                </div>

                                <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/10 flex flex-col justify-center">
                                    <div className="flex items-center gap-3 mb-2 text-green-400">
                                        <DollarSign className="w-6 h-6" />
                                        <h3 className="font-semibold text-lg uppercase tracking-wider">Salary Growth (India)</h3>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white">{domain.salaryRange}</span>
                                        <span className="text-gray-500 text-sm italic">LPA (Entry Level)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Sections Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Roadmap */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center gap-3 text-primary">
                                        <BookOpen className="w-6 h-6" />
                                        <h3 className="text-2xl font-bold font-clash">Strategic Roadmap</h3>
                                    </div>
                                    <div className="space-y-6 relative pl-4 border-l-2 border-white/10">
                                        {domain.roadmap?.map((step: string, i: number) => (
                                            <div key={i} className="relative pl-8 group">
                                                <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-primary group-hover:scale-125 transition-transform" />
                                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                                                    <p className="text-gray-200 font-medium">{step}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Missing Skills & Resources */}
                                <div className="space-y-8">
                                    {/* Action Items: Missing Skills */}
                                    <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-secondary" />
                                            Skills to Develop
                                        </h3>
                                        <ul className="space-y-3">
                                            {domain.skillGap?.missingSkills?.map((skill: string, i: number) => (
                                                <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-sm text-gray-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                                    {skill}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Project Ideas */}
                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-clash">
                                            <Rocket className="w-5 h-5 text-primary" />
                                            Mini-Projects
                                        </h3>
                                        <div className="space-y-3">
                                            {domain.projectIdeas?.map((idea: string, i: number) => (
                                                <div key={i} className="p-3 rounded-xl bg-black/40 text-xs leading-relaxed text-gray-400 border border-white/5">
                                                    {idea}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alternative Career Paths */}
                            {domain.alternativeDomains && domain.alternativeDomains.length > 0 && (
                                <div className="pt-8 border-t border-white/5">
                                    <div className="flex items-center gap-3 mb-6">
                                        <TrendingUp className="w-5 h-5 text-secondary" />
                                        <h3 className="text-xl font-bold font-clash text-white">Other Paths to Explore</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {domain.alternativeDomains.map((alt: string, i: number) => (
                                            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-default group">
                                                <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{alt}</p>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">Matched Category</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
