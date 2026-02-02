"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

interface DomainCardProps {
    title: string;
    matchScore: number;
    description: string;
    tags: string[];
    recommended?: boolean;
}

export default function DomainCard({ title, matchScore, description, tags, recommended }: DomainCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className={`relative p-6 rounded-2xl glass-panel group overflow-hidden border ${recommended ? "border-primary/50 shadow-[0_0_30px_rgba(255,46,99,0.15)]" : "border-white/5"}`}
        >
            {/* Decorative Gradient Blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/20 to-secondary/20 blur-[50px] group-hover:blur-[70px] transition-all opacity-50" />

            {recommended && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-semibold text-primary">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Top Match</span>
                </div>
            )}

            <div className="relative z-10">
                <h3 className="text-2xl font-clash font-semibold text-white mb-2">{title}</h3>

                <div className="flex items-center gap-3 mb-4">
                    <div className="h-1.5 w-full bg-white/10 rounded-full max-w-[100px] overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${matchScore}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-secondary to-primary"
                        />
                    </div>
                    <span className="text-sm font-mono text-secondary">{matchScore}% Match</span>
                </div>

                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {tags.map((tag, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                            {tag}
                        </span>
                    ))}
                </div>

                <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium group-hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    Explore Path
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
            </div>
        </motion.div>
    );
}
