"use client";

import { motion } from "framer-motion";
import clsx from "clsx";

interface SectionHeaderProps {
    badge?: string;
    badgeIcon?: React.ReactNode;
    title: string;
    highlight?: string;
    description?: string;
    gradient?: "primary" | "secondary";
    align?: "center" | "left";
    className?: string;
}

export default function SectionHeader({
    badge,
    badgeIcon,
    title,
    highlight,
    description,
    gradient = "primary",
    align = "center",
    className,
}: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className={clsx(
                "space-y-4 mb-12",
                align === "center" && "text-center",
                className
            )}
        >
            {badge && (
                <div
                    className={clsx(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium text-secondary",
                        align === "center" && "mx-auto"
                    )}
                >
                    {badgeIcon}
                    <span>{badge}</span>
                </div>
            )}

            <h2 className="text-3xl md:text-5xl font-bold font-clash leading-tight tracking-tight">
                {title}{" "}
                {highlight && (
                    <span
                        className={
                            gradient === "primary"
                                ? "text-gradient-primary"
                                : "text-gradient-secondary"
                        }
                    >
                        {highlight}
                    </span>
                )}
            </h2>

            {description && (
                <p
                    className={clsx(
                        "text-lg text-gray-400 max-w-2xl font-light",
                        align === "center" && "mx-auto"
                    )}
                >
                    {description}
                </p>
            )}
        </motion.div>
    );
}
