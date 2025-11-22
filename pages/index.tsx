import Head from "next/head";
import FileUploader from "../components/FileUploader";
import QueryForm from "../components/QueryForm";
import { LayoutGrid, MessageSquare, FileText } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Head>
                <title>Multi-Doc Query | AI Knowledge Base</title>
                <meta name="description" content="Intelligent RAG system for querying multiple documents" />
            </Head>

            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900">Multi-Doc Query</h1>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            RAG System
                        </span>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <div className="grid gap-8">
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                1
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Knowledge Base</h2>
                        </div>
                        <FileUploader />
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                2
                            </div>
                            <h2 className="text-xl font-semibold text-slate-900">Chat Interface</h2>
                        </div>
                        <QueryForm />
                    </section>
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 mt-12 py-8">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>Built with Next.js, Tailwind CSS, and Python Backend</p>
                    <p className="mt-2">
                        Ensure your backend is running at <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">http://localhost:8000</code>
                    </p>
                </div>
            </footer>
        </div>
    );
}
