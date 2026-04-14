"use client";

import Link from "next/link";
import { Sparkles, Github, ArrowUpRight } from "lucide-react";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Domains", href: "/domains" },
    { name: "Analyze", href: "/analyze" },
];

const legalLinks = [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
];

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/5 bg-black/30 backdrop-blur-md relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-4">
                        <Link href="/" className="group inline-flex items-center gap-2.5">
                            <div className="relative">
                                <div className="absolute inset-0 bg-secondary/20 blur-md rounded-full group-hover:bg-secondary/40 transition-colors" />
                                <Sparkles className="relative w-5 h-5 text-secondary" />
                            </div>
                            <span className="font-clash font-bold text-xl text-white">
                                Career<span className="text-secondary">Forge</span>
                            </span>
                        </Link>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            Data-driven career intelligence for engineering students. Shape your future with precision domain mapping and portfolio analysis.
                        </p>
                    </div>

                    {/* Navigation Column */}
                    <div className="md:col-span-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                            Navigate
                        </h4>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-secondary transition-colors inline-flex items-center gap-1 group"
                                    >
                                        {link.name}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Connect Column */}
                    <div className="md:col-span-4">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                            Connect
                        </h4>
                        <div className="flex flex-col gap-3">
                            <a
                                href="https://github.com/Aryan052006/PBL"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all group w-fit"
                            >
                                <Github className="w-4 h-4" />
                                <span>View on GitHub</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
                            </a>
                            <div className="flex gap-4 mt-1">
                                {legalLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-600">
                        © {new Date().getFullYear()} CareerForge. Precision Career Mapping.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        All systems operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
