import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, User, Bot, Loader2, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";

type Candidate = {
    id: string;
    text: string;
    meta?: any;
};

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: Candidate[];
    timestamp: number;
};

type Props = {
    backendUrl?: string;
};

export default function QueryForm({ backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api" }: Props) {
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [topK, setTopK] = useState<number>(5);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    async function handleQuery(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim() || loading) return;

        const userMessage: Message = {
            role: "user",
            content: query.trim(),
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setQuery("");
        setLoading(true);

        try {
            const res = await axios.post(
                `${backendUrl}/query`,
                { query: userMessage.content, top_k: topK },
                { headers: { "Content-Type": "application/json" }, timeout: 120000 }
            );

            const data = res.data || {};
            const answer = String(data.answer ?? data);
            const sources = data.contexts as Candidate[] | undefined;

            const botMessage: Message = {
                role: "assistant",
                content: answer,
                sources: sources,
                timestamp: Date.now()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err: any) {
            console.error(err);
            const errorMessage: Message = {
                role: "assistant",
                content: "Sorry, I encountered an error while processing your request. " + (err?.response?.data?.detail || err.message),
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-2xl mx-auto h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    AI Assistant
                </h3>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Top K:</span>
                    <input
                        type="number"
                        min={1}
                        max={20}
                        value={topK}
                        onChange={(e) => setTopK(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs border rounded bg-white"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/30">
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Bot className="w-12 h-12 opacity-20" />
                        <p className="text-sm">Ask a question to get started</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4 max-w-[90%]",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                msg.role === "user" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
                            )}>
                                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>

                            <div className={cn(
                                "flex flex-col gap-2",
                                msg.role === "user" ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    msg.role === "user"
                                        ? "bg-blue-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>

                                {msg.sources && msg.sources.length > 0 && (
                                    <SourcesList sources={msg.sources} />
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 max-w-[90%] mr-auto"
                    >
                        <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            <span className="text-sm text-slate-500">Thinking...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleQuery} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Ask a question about your documents..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
}

function SourcesList({ sources }: { sources: Candidate[] }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="w-full max-w-md mt-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
                <BookOpen className="w-3 h-3" />
                {sources.length} Sources
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 space-y-2">
                            {sources.map((s, i) => (
                                <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                                    <div className="font-medium text-slate-700 mb-1">Source {i + 1} (ID: {s.id})</div>
                                    <div className="line-clamp-3">{s.text}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
