"use client";

import clsx from "clsx";

interface BadgeProps {
    variant?: "success" | "warning" | "error" | "info" | "neutral";
    children: React.ReactNode;
    icon?: React.ReactNode;
    className?: string;
}

const variantStyles: Record<string, string> = {
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400",
    info: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    neutral: "bg-white/5 border-white/10 text-gray-300",
};

export default function Badge({
    variant = "neutral",
    children,
    icon,
    className,
}: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold",
                variantStyles[variant],
                className
            )}
        >
            {icon}
            {children}
        </span>
    );
}
