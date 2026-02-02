"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useState } from "react";
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
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
        >
            <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-8 md:gap-12 w-full max-w-4xl backdrop-blur-md bg-opacity-60 border border-white/10 shadow-lg">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-clash font-bold text-xl tracking-tight text-white hover:text-primary transition-colors">
                    <Sparkles className="w-5 h-5 text-secondary" />
                    <span>CareerForge</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(
                                    "text-sm font-medium transition-all relative px-2 py-1",
                                    isActive ? "text-white" : "text-gray-400 hover:text-white"
                                )}
                            >
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-white/10 rounded-md -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* CTA Button */}
                <div className="hidden md:flex items-center gap-4">
                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/profile"
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
                            >
                                <UserIcon className="w-4 h-4" />
                                Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="px-4 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/sign-in"
                                className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/sign-up"
                                className="px-5 py-2 rounded-full bg-primary text-white text-sm font-bold shadow-[0_0_15px_rgba(255,46,99,0.4)] hover:scale-105 transition-transform"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white hover:bg-white/10 rounded-full"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="absolute top-20 left-4 right-4 p-4 rounded-2xl glass-panel md:hidden flex flex-col gap-4"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={clsx(
                                "p-3 rounded-lg text-center font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-primary/20 text-primary border border-primary/20"
                                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {item.name}
                        </Link>
                    ))}

                    <div className="h-px bg-white/10 my-2" />

                    {isAuthenticated ? (
                        <>
                            <Link
                                href="/profile"
                                onClick={() => setIsOpen(false)}
                                className="p-3 rounded-lg text-center font-medium text-white bg-white/5 hover:bg-white/10"
                            >
                                My Profile
                            </Link>
                            <button
                                onClick={() => {
                                    logout();
                                    setIsOpen(false);
                                }}
                                className="p-3 rounded-lg text-center font-medium text-red-400 hover:bg-red-500/10"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/sign-up"
                            onClick={() => setIsOpen(false)}
                            className="w-full py-3 rounded-xl bg-primary text-white text-center font-bold"
                        >
                            Get Started
                        </Link>
                    )}
                </motion.div>
            )}
        </motion.nav>
    );
}
