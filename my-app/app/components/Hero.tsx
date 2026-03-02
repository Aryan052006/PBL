"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-4 text-center overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="z-10 max-w-5xl space-y-8"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-secondary mx-auto mb-4">
                    <Sparkles className="w-4 h-4" />
                    <span>Advanced Career Intelligence</span>
                </div>

                <h1 className="text-6xl md:text-8xl font-bold font-clash leading-[1.1] tracking-tight">
                    Shape Your <br />
                    <span className="text-gradient-primary">Engineering Future</span>
                </h1>

                <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto font-light">
                    Stop guessing. Get data-driven domain recommendations and portfolio analysis tailored to your skills.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-primary text-white rounded-xl font-semibold text-lg hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,99,0.5)]"
                    >
                        Get Started
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 glass-panel text-foreground rounded-xl font-medium text-lg hover:bg-white/5 transition-all"
                    >
                        View Demo
                    </motion.button>
                </div>
            </motion.div>
        </section>
    );
}
