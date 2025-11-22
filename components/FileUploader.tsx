import React, { useState, useRef } from "react";
import axios from "axios";
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type Props = {
    backendUrl?: string;
    onIngestComplete?: (info: any) => void;
};

export default function FileUploader({ backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api", onIngestComplete }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type === "application/pdf");
            if (newFiles.length !== e.dataTransfer.files.length) {
                setError("Only PDF files are allowed.");
            } else {
                setError(null);
            }
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...newFiles]);
            setError(null);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    async function handleUpload() {
        if (files.length === 0) {
            setError("Please select at least one PDF file.");
            return;
        }

        setError(null);
        setStatus(null);
        setLoading(true);

        const fd = new FormData();
        files.forEach((f) => fd.append("files", f, f.name));

        try {
            setStatus("Uploading and indexing...");
            const res = await axios.post(`${backendUrl}/ingest`, fd, {
                headers: { "Content-Type": "multipart/form-data" },
                timeout: 120000
            });

            setStatus("Successfully indexed " + files.length + " file(s).");
            if (onIngestComplete) onIngestComplete(res.data.info);
            setFiles([]);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.detail || err.message || "Upload failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        Upload Documents
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Upload PDF files to populate the knowledge base.
                    </p>
                </div>

                <div className="p-6">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ease-in-out",
                            isDragging
                                ? "border-blue-500 bg-blue-50 scale-[1.02]"
                                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileSelect}
                            multiple
                            className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "p-3 rounded-full bg-blue-100 text-blue-600",
                                isDragging && "bg-blue-200"
                            )}>
                                <Upload className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-slate-700">
                                    Click to upload or drag and drop
                                </p>
                                <p className="text-sm text-slate-500 mt-1">
                                    PDF files only
                                </p>
                            </div>
                        </div>
                    </div>

                    <AnimatePresence>
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-6 space-y-3"
                            >
                                <h4 className="text-sm font-medium text-slate-700">Selected Files ({files.length})</h4>
                                <div className="grid gap-2">
                                    {files.map((file, idx) => (
                                        <motion.div
                                            key={`${file.name}-${idx}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 group"
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className="text-sm text-slate-700 truncate">{file.name}</span>
                                                <span className="text-xs text-slate-400 flex-shrink-0">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                className="p-1 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleUpload}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                Upload & Index
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-3"
                            >
                                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{status}</p>
                            </motion.div>
                        )}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
