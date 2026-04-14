"use client";

import { motion } from "framer-motion";

interface MatchScoreCircleProps {
    score: number;
    bestFitDomain: string;
    status: string;
}

export default function MatchScoreCircle({ score, bestFitDomain, status }: MatchScoreCircleProps) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row gap-8 items-center bg-gradient-to-br from-white/5 to-transparent border-white/10">
            {/* Animated Match Score Circle */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
                    <circle
                        cx="72" cy="72" r={radius}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                    />
                    <motion.circle
                        cx="72" cy="72" r={radius}
                        fill="transparent"
                        stroke="#FF2E63"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
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
                        {score}%
                    </motion.span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-medium mt-1">
                        Score
                    </span>
                </div>
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left min-w-0 md:border-l md:border-white/10 md:pl-8">
                <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">Best Fit Domain</p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white capitalize leading-tight">
                    {bestFitDomain}
                </h3>
                <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold uppercase tracking-wider mt-2">
                    {status}
                </div>
            </div>
        </div>
    );
}
