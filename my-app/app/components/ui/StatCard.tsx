"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    accentColor?: string;
    subtitle?: string;
    className?: string;
    children?: React.ReactNode;
}

export default function StatCard({
    label,
    value,
    icon,
    accentColor = "rgba(8, 217, 214, 0.1)",
    subtitle,
    className,
    children,
}: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
                "glass-panel p-6 rounded-3xl flex flex-col justify-center space-y-3 bg-gradient-to-br from-white/5 to-transparent border-white/10 relative overflow-hidden",
                className
            )}
        >
            {/* Decorative glow blob */}
            <div
                className="absolute -right-8 -bottom-8 w-32 h-32 blur-3xl rounded-full pointer-events-none"
                style={{ background: accentColor }}
            />

            <div className="flex justify-between items-start relative z-10">
                <div className="min-w-0 flex-1">
                    <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
                    <span className="text-3xl sm:text-4xl font-clash font-bold text-white block truncate">
                        {value}
                    </span>
                </div>
                <div
                    className="p-3 rounded-2xl relative z-10 shrink-0 ml-3"
                    style={{ background: accentColor }}
                >
                    {icon}
                </div>
            </div>

            {subtitle && (
                <p className="text-xs text-gray-400/80 font-medium relative z-10">
                    {subtitle}
                </p>
            )}

            {children && <div className="relative z-10">{children}</div>}
        </motion.div>
    );
}
