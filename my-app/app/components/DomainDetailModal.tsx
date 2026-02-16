"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, TrendingUp, DollarSign, Lightbulb } from "lucide-react";

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
                    className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 md:p-8"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-400 animate-pulse">Generating comprehensive guide via Gemini AI...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Header */}
                            <div>
                                <h2 className="text-3xl md:text-4xl font-clash font-bold text-white mb-2">
                                    {domain.title || "Career Path"}
                                </h2>
                                <p className="text-gray-400 text-lg">{domain.overview}</p>
                            </div>

                            {/* Why Good Fit & Salary */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3 mb-3 text-secondary">
                                        <TrendingUp className="w-6 h-6" />
                                        <h3 className="font-semibold text-lg">Why It Fits You</h3>
                                    </div>
                                    <p className="text-gray-300">{domain.whyGoodFit}</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-3 mb-3 text-green-400">
                                        <DollarSign className="w-6 h-6" />
                                        <h3 className="font-semibold text-lg">Salary Outlook (India)</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-white">{domain.salaryRange}</p>
                                    <p className="text-sm text-gray-500">Entry Level / Year</p>
                                </div>
                            </div>

                            {/* Roadmap */}
                            <div>
                                <div className="flex items-center gap-3 mb-6 text-primary">
                                    <BookOpen className="w-6 h-6" />
                                    <h3 className="text-xl font-bold">Your Learning Roadmap</h3>
                                </div>
                                <div className="space-y-4 relative pl-4 border-l-2 border-white/10">
                                    {domain.roadmap?.map((step: string, i: number) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-primary ring-4 ring-[#0a0a0a]" />
                                            <p className="text-gray-300 text-lg">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resources & Projects */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Recommended Resources</h3>
                                    <ul className="space-y-3">
                                        {domain.resources?.map((res: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2 text-gray-400">
                                                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                                {res}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-4 text-yellow-400">
                                        <Lightbulb className="w-5 h-5" />
                                        <h3 className="text-lg font-semibold">Project Ideas</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {domain.projectIdeas?.map((idea: string, i: number) => (
                                            <li key={i} className="p-3 rounded-xl bg-white/5 text-sm text-gray-300 border border-white/5">
                                                {idea}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
