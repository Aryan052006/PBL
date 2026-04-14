"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface AtsBreakdown {
    Structure: number;
    KeywordOptimization: number;
    Impact: number;
    Formatting: number;
}

interface AtsScoreCardProps {
    score: number;
    breakdown: AtsBreakdown;
}

export default function AtsScoreCard({ score, breakdown }: AtsScoreCardProps) {
    const metrics = [
        { label: "Structure", val: breakdown.Structure },
        { label: "Keywords", val: breakdown.KeywordOptimization },
        { label: "Impact", val: breakdown.Impact },
        { label: "Formatting", val: breakdown.Formatting },
    ];

    return (
        <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-4 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-gray-400 text-sm font-medium mb-1">ATS Compatibility</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-clash font-bold text-white">{score}%</span>
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Score</span>
                    </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 relative z-10">
                    <Activity className="w-6 h-6" />
                </div>
            </div>

            <div className="space-y-3 w-full relative z-10">
                {metrics.map((metric, i) => (
                    <div key={metric.label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                            <span className="text-gray-500">{metric.label}</span>
                            <span className={metric.val >= 80 ? "text-green-400" : metric.val >= 50 ? "text-yellow-400" : "text-red-400"}>
                                {metric.val}%
                            </span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.val}%` }}
                                transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                                className={`h-full ${metric.val >= 80 ? 'bg-green-500' : metric.val >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
