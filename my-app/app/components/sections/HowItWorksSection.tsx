"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, Rocket, ArrowDown } from "lucide-react";
import SectionHeader from "../ui/SectionHeader";

const steps = [
    {
        number: "01",
        icon: <Upload className="w-6 h-6" />,
        title: "Upload Resume",
        description: "Drop your PDF or DOCX resume — our parser extracts skills, experience, and project data in seconds.",
        accent: "primary",
    },
    {
        number: "02",
        icon: <Cpu className="w-6 h-6" />,
        title: "ML Analysis",
        description: "KNN models match you to the best engineering domains while an LLM generates a full career assessment.",
        accent: "secondary",
    },
    {
        number: "03",
        icon: <Rocket className="w-6 h-6" />,
        title: "Get Your Roadmap",
        description: "Receive a comprehensive dashboard: domain fit, salary estimate, ATS score, and precision boosters.",
        accent: "primary",
    },
];

export default function HowItWorksSection() {
    return (
        <section className="relative py-24 px-4">
            <div className="max-w-4xl mx-auto relative z-10">
                <SectionHeader
                    title="How It"
                    highlight="Works"
                    gradient="secondary"
                    description="Three steps from upload to career clarity."
                />

                <div className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-secondary/30 to-transparent hidden md:block" />

                    <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-1 md:gap-0">
                        {steps.map((step, i) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-80px" }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                                className={`relative flex items-center gap-8 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-col md:flex-row`}
                            >
                                {/* Content Card */}
                                <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                                    <div className="glass-panel p-6 rounded-2xl inline-block w-full hover:border-white/15 transition-colors">
                                        <div className={`flex items-center gap-3 mb-3 ${i % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.accent === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                                                {step.icon}
                                            </div>
                                            <h3 className="text-lg font-clash font-semibold text-white">
                                                {step.title}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Center Node */}
                                <div className="relative z-10 shrink-0 hidden md:flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-clash font-bold text-sm ${step.accent === "primary" ? "border-primary/50 text-primary bg-primary/10" : "border-secondary/50 text-secondary bg-secondary/10"}`}>
                                        {step.number}
                                    </div>
                                    {i < steps.length - 1 && (
                                        <ArrowDown className="w-4 h-4 text-gray-600 mt-2 animate-float" />
                                    )}
                                </div>

                                {/* Spacer for the other side */}
                                <div className="flex-1 hidden md:block" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
