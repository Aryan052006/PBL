"use client";

import { motion } from "framer-motion";
import { UploadCloud, FileText, Check } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

interface PortfolioUploaderProps {
    onAnalyze: (file: File) => void;
    isAnalyzing: boolean;
}

export default function PortfolioUploader({ onAnalyze, isAnalyzing }: PortfolioUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <motion.div
                className={clsx(
                    "relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer glass-panel overflow-hidden group",
                    isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-white/10 hover:border-white/20"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileTap={{ scale: 0.98 }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    accept=".pdf,.docx"
                    onChange={handleChange}
                />

                <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className={clsx(
                        "p-4 rounded-full transition-colors",
                        file ? "bg-green-500/20 text-green-400" : "bg-white/5 text-secondary"
                    )}>
                        {file ? <Check className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-clash font-medium text-white">
                            {file ? file.name : "Upload your Resume/Portfolio"}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {file ? "Ready for analysis" : "Drag & drop or click to browse (PDF/DOCX)"}
                        </p>
                    </div>
                </div>
            </motion.div>

            {file && (
                <motion.button
                    onClick={() => onAnalyze(file)}
                    disabled={isAnalyzing}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full mt-6 py-4 bg-gradient-to-r from-primary to-rose-600 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(255,46,99,0.3)] hover:shadow-[0_0_30px_rgba(255,46,99,0.5)] transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? "Analyzing..." : "Analyze Portfolio"}
                </motion.button>
            )}
        </div>
    );
}
