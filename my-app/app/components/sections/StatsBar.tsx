"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { FileSearch, Brain, Rocket } from "lucide-react";

const stats = [
    { value: 5000, suffix: "+", label: "Resumes Analyzed", icon: <FileSearch className="w-4 h-4" /> },
    { value: 12, suffix: "", label: "Engineering Domains", icon: <Brain className="w-4 h-4" /> },
    { value: 94, suffix: "%", label: "Accuracy Rate", icon: <Rocket className="w-4 h-4" /> },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [isInView, target]);

    return (
        <span ref={ref} className="text-3xl md:text-4xl font-clash font-bold text-white tabular-nums">
            {count.toLocaleString()}{suffix}
        </span>
    );
}

export default function StatsBar() {
    return (
        <section className="relative py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="glass-panel rounded-3xl p-8 md:p-10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.5 }}
                                className="flex flex-col items-center text-center group"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary">
                                        {stat.icon}
                                    </div>
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <span className="text-xs text-gray-500 uppercase tracking-[0.2em] font-semibold">
                                    {stat.label}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
