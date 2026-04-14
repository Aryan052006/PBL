"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface ButtonProps {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    title?: string;
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-primary text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] hover:bg-primary/90",
    secondary:
        "bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20",
    ghost:
        "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
    danger:
        "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20",
    outline:
        "bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20",
};

const sizeStyles: Record<string, string> = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base",
};

export default function Button({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    children,
    className,
    disabled,
    onClick,
    type = "button",
    title,
}: ButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
            className={clsx(
                "relative inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-300",
                variantStyles[variant],
                sizeStyles[size],
                (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
                className
            )}
            disabled={disabled || loading}
            onClick={onClick}
            type={type}
            title={title}
        >
            {loading && (
                <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {!loading && icon}
            {children}
        </motion.button>
    );
}
