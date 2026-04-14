"use client";

import { motion } from "framer-motion";
import { Brain, Target, TrendingUp, FileText, Sparkles, Shield } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";

const features = [
    {
        icon: <Brain className="w-7 h-7" />,
        title: "ML Domain Matching",
        description: "KNN-powered algorithm analyzes your skills and maps you to the highest-fit engineering domains with precision scoring.",
        gradient: "from-violet-500/20 to-fuchsia-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    },
    {
        icon: <FileText className="w-7 h-7" />,
        title: "Resume Intelligence",
        description: "Deep analysis of your resume against industry standards — ATS scoring, keyword gaps, and actionable boosters.",
        gradient: "from-primary/20 to-orange-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(255,46,99,0.15)]",
    },
    {
        icon: <TrendingUp className="w-7 h-7" />,
        title: "Salary Estimation",
        description: "Real-world Indian tech market benchmarks estimate your earning potential based on identified skill clusters.",
        gradient: "from-emerald-500/20 to-teal-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
    {
        icon: <Target className="w-7 h-7" />,
        title: "Career Roadmaps",
        description: "Get personalized learning paths and recommended certifications to reach your target domain faster.",
        gradient: "from-secondary/20 to-blue-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(8,217,214,0.15)]",
    },
    {
        icon: <Shield className="w-7 h-7" />,
        title: "ATS Compatibility",
        description: "Structure, keyword, formatting, and impact scoring ensures your resume passes automated screening systems.",
        gradient: "from-blue-500/20 to-indigo-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    },
    {
        icon: <Sparkles className="w-7 h-7" />,
        title: "Smart Boosters",
        description: "LLM-generated actionable advice tailored to your profile — not generic tips, but precision-crafted improvements.",
        gradient: "from-amber-500/20 to-yellow-500/20",
        borderGlow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    },
];

export default function FeaturesSection() {
    return (
        <section className="relative py-24 px-4 grid-pattern">
            {/* Background glows */}
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <SectionHeader
                    badge="Platform Features"
                    badgeIcon={<Sparkles className="w-4 h-4" />}
                    title="Everything You Need to"
                    highlight="Launch Your Career"
                    description="Our ML pipeline and LLM analysis work together to provide the most comprehensive career intelligence platform."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`group relative glass-panel rounded-2xl p-7 border border-white/5 hover:border-white/10 transition-all duration-500 ${feature.borderGlow}`}
                        >
                            {/* Gradient glow */}
                            <div className={`absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br ${feature.gradient} blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

                            <div className="relative z-10">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-5`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-clash font-semibold text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
