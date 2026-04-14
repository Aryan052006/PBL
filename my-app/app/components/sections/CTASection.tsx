"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
    return (
        <section className="relative py-24 px-4 overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="glass-panel rounded-3xl p-10 md:p-16 text-center premium-border relative overflow-hidden"
                >
                    {/* Inner glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4" />
                            Free to Use
                        </div>

                        <h2 className="text-3xl md:text-5xl font-clash font-bold text-white mb-4 leading-tight">
                            Ready to Forge Your <br/>
                            <span className="text-gradient-primary">Career Path?</span>
                        </h2>

                        <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
                            Upload your resume and get an instant, data-driven career assessment. No guesswork — just precision.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/analyze">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-[0_0_30px_rgba(255,46,99,0.4)] hover:shadow-[0_0_50px_rgba(255,46,99,0.6)] transition-all flex items-center justify-center gap-2 animate-pulse-glow"
                                >
                                    Start Analyzing
                                    <ArrowRight className="w-5 h-5" />
                                </motion.div>
                            </Link>
                            <Link href="/domains">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-10 py-4 glass-panel text-white rounded-xl font-medium text-lg hover:bg-white/5 transition-all flex items-center justify-center"
                                >
                                    Explore Domains
                                </motion.div>
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
