"use client";

import { Zap, CheckCircle2, ChevronRight, AlertTriangle } from "lucide-react";

interface ResumeBoosterListProps {
    boosters?: string[];
    tips?: string[];
    gaps?: string[];
}

export default function ResumeBoosterList({ boosters, tips, gaps }: ResumeBoosterListProps) {
    const feedbackItems = boosters || tips || [];

    return (
        <div className="glass-panel p-8 rounded-3xl bg-gradient-to-br from-yellow-500/[0.03] to-transparent">
            <h3 className="text-lg font-clash font-semibold text-white mb-6 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Resume Boosters
            </h3>

            {/* Primary Feedback Items */}
            <div className="space-y-4 mb-8">
                {feedbackItems.map((item: string, i: number) => (
                    <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex gap-4 hover:bg-white/[0.07] transition-all">
                        <div className="mt-1 shrink-0"><CheckCircle2 className="w-5 h-5 text-primary" /></div>
                        <p className="text-gray-200 text-sm leading-relaxed">{item}</p>
                    </div>
                ))}
            </div>

            {/* Career Advice (shown when both boosters and tips exist) */}
            {tips && boosters && (
                <>
                    <h4 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Career Advice</h4>
                    <div className="space-y-3">
                        {tips.map((tip: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-gray-400">
                                <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                <p>{tip}</p>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Missing Keywords */}
            {gaps && gaps.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-red-400 text-sm font-bold mb-4 uppercase tracking-wide text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Missing Keywords
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {gaps.map((gap: string) => (
                            <span key={gap} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 text-xs font-medium border border-red-500/10">
                                {gap}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
