"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, User as UserIcon, LogOut, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const navItems = [
    { name: "Home", href: "/" },
    { name: "Domains", href: "/domains" },
    { name: "Analyze", href: "/analyze" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6"
        >
            <div className={clsx(
                "glass-nav rounded-2xl px-8 py-3 flex items-center justify-between gap-8 md:gap-16 w-full max-w-6xl transition-all duration-500",
                scrolled ? "py-2.5 max-w-5xl shadow-2xl" : "py-4"
            )}>
                {/* Logo Section */}
                <Link href="/" className="group flex items-center gap-2.5 outline-none" aria-label="CareerForge Home">
                    <div className="relative">
                        <div className="absolute inset-0 bg-secondary/20 blur-md rounded-full group-hover:bg-secondary/40 transition-colors" />
                        <Sparkles className="relative w-6 h-6 text-secondary transform group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <span className="font-clash font-bold text-2xl tracking-tight text-white group-hover:text-secondary transition-colors">
                        Career<span className="text-secondary">Forge</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg group outline-none",
                                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                <span className="relative z-10">{item.name}</span>
                                {isActive && (
                                    <motion.div
                                        layoutId="navGlow"
                                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-lg -z-0 shadow-[inset_0_0_12px_rgba(255,255,255,0.02)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <div className="absolute bottom-1 left-4 right-4 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                            </Link>
                        );
                    })}
                </div>

                {/* Action Section */}
                <div className="hidden md:flex items-center gap-5">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/profile"
                                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 active:scale-95"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center border border-white/10">
                                    <UserIcon className="w-3.5 h-3.5 text-secondary" />
                                </div>
                                Account
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 active:scale-90"
                                title="Sign Out"
                                aria-label="Sign out of your account"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="px-6 py-2.5 text-sm font-bold text-gray-300 hover:text-white transition-colors outline-none"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="relative group px-7 py-2.5 rounded-xl overflow-hidden active:scale-95 transition-transform"
                            >
                                <div className="absolute inset-0 bg-primary group-hover:bg-primary/90 transition-colors" />
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />
                                <span className="relative z-10 text-sm font-bold text-white flex items-center gap-2">
                                    Join Now
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Trigger */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white active:scale-90 transition-transform"
                    aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
                    aria-expanded={isOpen}
                >
                    <AnimatePresence mode="wait">
                        {isOpen ? (
                            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                                <X className="w-5 h-5" />
                            </motion.div>
                        ) : (
                            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                                <Menu className="w-5 h-5" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
            </div>

            {/* Enhanced Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="absolute top-24 left-6 right-6 p-2 rounded-3xl glass-nav md:hidden overflow-hidden border border-white/10 shadow-3xl"
                    >
                        <div className="flex flex-col gap-1 p-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={clsx(
                                        "px-5 py-4 rounded-2xl font-bold flex items-center justify-between group transition-all duration-300",
                                        pathname === item.href
                                            ? "bg-secondary/10 text-secondary border border-secondary/20"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    {item.name}
                                    <ChevronRight className={clsx("w-5 h-5 opacity-0 -translate-x-2 transition-all duration-300", pathname === item.href && "opacity-100 translate-x-0")} />
                                </Link>
                            ))}
                        </div>

                        <div className="px-4 py-4 mt-2 border-t border-white/5 flex flex-col gap-3">
                            {isAuthenticated ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full py-4 rounded-2xl text-center font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                    >
                                        My Dashboard
                                    </Link>
                                    <button
                                        onClick={() => { logout(); setIsOpen(false); }}
                                        className="w-full py-4 rounded-2xl text-center font-bold text-red-400 hover:bg-red-400/10 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/sign-up"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-2xl bg-primary text-white text-center font-bold shadow-xl active:scale-[0.98] transition-all"
                                >
                                    Get Started
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
