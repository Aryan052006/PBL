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

                {/* Buttons removed as per user request */}

            </motion.div>
        </section>
    );
}
