"use client";

import clsx from "clsx";

interface SkeletonCardProps {
    lines?: number;
    showAvatar?: boolean;
    className?: string;
}

export default function SkeletonCard({
    lines = 3,
    showAvatar = false,
    className,
}: SkeletonCardProps) {
    return (
        <div
            className={clsx(
                "glass-panel rounded-2xl p-6 space-y-4 animate-pulse",
                className
            )}
            role="status"
            aria-label="Loading content"
        >
            {showAvatar && (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full skeleton-shimmer" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 skeleton-shimmer rounded" />
                        <div className="h-2 w-1/3 skeleton-shimmer rounded" />
                    </div>
                </div>
            )}

            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="skeleton-shimmer rounded"
                    style={{
                        height: i === 0 ? "1rem" : "0.75rem",
                        width: i === lines - 1 ? "60%" : i === 0 ? "80%" : "100%",
                    }}
                />
            ))}

            <div className="flex gap-2 pt-2">
                <div className="h-6 w-16 skeleton-shimmer rounded-full" />
                <div className="h-6 w-20 skeleton-shimmer rounded-full" />
            </div>
        </div>
    );
}
