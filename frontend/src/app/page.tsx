"use client";

import React, { useState } from 'react';
import {
  ShieldCheck,
  Link as LinkIcon,
  FileText,
  ScanLine
} from 'lucide-react';
import ParticleNewspaper from '@/components/ParticleNewspaper';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { analyzeArticle } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProtocolCard from '@/components/landing/ProtocolCard';
import ProcessStep from '@/components/landing/ProcessStep';

export default function LandingPage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      alert("Please enter some text or drop a URL to analyze.");
      return;
    }

    setAnalyzing(true);

    const steps = [
      "AI is scanning for inconsistencies...",
      "Cross-referencing 26,000+ articles...",
      "Detecting emotional manipulation...",
      "Evaluating logical coherence...",
      "Generating explainable verdict..."
    ];

    let stepIndex = 0;
    setLoadingText(steps[stepIndex]);

    const textInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingText(steps[stepIndex]);
      }
    }, 600);

    try {
      // Actually call the API
      const res = await analyzeArticle(inputVal.substring(0, 50), inputVal);

      clearInterval(textInterval);
      if (res.success) {
        // Save to sessions in localStorage so dashboard picks it up
        const savedSessions = localStorage.getItem('chat_sessions');
        const sessions = savedSessions ? JSON.parse(savedSessions) : [];
        const newSession = {
          id: res.data.id || Math.random().toString(36).substring(7),
          headline: inputVal.substring(0, 50),
          result: res.data,
          messages: [],
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('chat_sessions', JSON.stringify([newSession, ...sessions]));

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        alert("Intelligence scan failed. Connection unstable.");
      }
    } catch (err) {
      clearInterval(textInterval);
      alert("Intelligence scan failed. Connection unstable.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans bg-black text-white">

      {/* Navbar */}
      <nav className="fixed w-full z-50 glass border-b border-white/5 top-0 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white" />
              <span className="font-black text-xl md:text-2xl tracking-tight text-white uppercase">VeriNews <span className="text-gray-500">AI</span></span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors py-2 text-sm font-bold uppercase tracking-wider">Home</a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors py-2 text-sm font-bold uppercase tracking-wider">How It Works</a>
              <a href="#features" className="text-gray-400 hover:text-white transition-colors py-2 text-sm font-bold uppercase tracking-wider">Features</a>
              <a href="#dataset" className="text-gray-400 hover:text-white transition-colors py-2 text-sm font-bold uppercase tracking-wider">Dataset</a>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-all py-2 text-sm font-bold uppercase tracking-wider">Dashboard</Link>
            </div>

            {/* CTA */}
            <div>
              <Link href="/dashboard" className="bg-white hover:bg-gray-200 text-black px-6 py-2 rounded-none font-bold uppercase tracking-widest transition-all text-xs md:text-sm">
                Verify News Now
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow pt-20">

        {/* HUGE OPENING */}
        <section className="w-full">
            <ParticleNewspaper />
        </section>


        {/* Capabilities Section */}
        <section id="features" className="py-32 relative bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-16">
              <div className="w-8 md:w-12 h-1 bg-white"></div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest">What Makes VeriNews AI Different</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ProtocolCard num="01" title="LLM-Powered Reasoning" desc="Goes beyond keyword matching. Our AI understands context, narrative structure, and intent — the same way a fact-checker would." />
              <ProtocolCard num="02" title="Trained on 26,000+ Articles" desc="Validated on a massive labeled dataset of real and fake news spanning multiple domains, languages, and publication types." />
              <ProtocolCard num="03" title="Not Just True or False" desc="VeriNews AI tells you why. Every verdict comes with a breakdown of reasoning — transparent, traceable, and human-readable." />
              <ProtocolCard num="04" title="Detects Emotional Manipulation" desc="Identifies biased framing, fear-mongering language, and emotionally charged rhetoric — tactics commonly used to spread misinformation." />
            </div>
          </div>
        </section>

        {/* Process Map */}
        <section id="how-it-works" className="py-32 relative bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:40px_40px]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-24">Four Steps to the Truth</h2>

            <div className="flex flex-col md:flex-row relative gap-12 md:gap-8 justify-between mx-auto items-start">
              <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[1px] bg-white/20 z-0"></div>

              <ProcessStep num="01" title="Paste or Link" desc="Drop in a news snippet, full article, or URL. No formatting needed." />
              <ProcessStep num="02" title="Deep Analysis Begins" desc="Our LLM checks for logical consistency, narrative bias, and cross-references known misinformation patterns." />
              <ProcessStep num="03" title="Pattern Cross-Check" desc="The article is matched against trained data from 26,000+ labeled sources to identify familiar fake news signatures." />
              <ProcessStep num="04" title="Instant Verdict" desc="Get a clear REAL or FAKE verdict, a confidence score, and a detailed reasoning breakdown — all in seconds." />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section id="dataset" className="py-32 relative bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-8">By the Numbers</h2>
                <div className="border-l-4 border-white pl-8 py-2">
                  <p className="text-xl md:text-2xl text-gray-400 font-mono leading-relaxed">
                    Validated on a massive scale to guarantee high-confidence results when it matters most.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-8 border border-white/10">
                  <div className="text-4xl md:text-5xl font-black mb-2 text-white">26k+</div>
                  <div className="text-xs text-gray-500 font-mono uppercase tracking-[0.2em] block mt-4">Articles in Training Dataset</div>
                </div>
                <div className="bg-white/5 p-8 border border-white/10">
                  <div className="text-4xl md:text-5xl font-black mb-2 text-white">90%+</div>
                  <div className="text-xs text-green-500 font-mono uppercase tracking-[0.2em] block mt-4">Model Accuracy Rate</div>
                </div>
                <div className="bg-white/5 p-8 border border-white/10">
                  <div className="text-4xl md:text-5xl font-black mb-2 text-white">4+</div>
                  <div className="text-xs text-white/40 font-mono uppercase tracking-[0.2em] block mt-4">Analysis Dimensions</div>
                </div>
                <div className="bg-white/5 p-8 border border-white/10">
                  <div className="text-4xl md:text-5xl font-black mb-2 text-white">~3s</div>
                  <div className="text-xs text-white/40 font-mono uppercase tracking-[0.2em] block mt-4">Avg Response Time</div>
                </div>
              </div>

            </div>
          </div>
        </section>


      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] py-16 border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-white" />
              <span className="font-black text-2xl tracking-widest text-white uppercase">VeriNews <span className="text-gray-600">AI</span></span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 font-mono text-sm uppercase tracking-widest text-gray-500">
              <a href="#" className="hover:text-white transition-colors">GitHub Repo</a>
              <a href="#" className="hover:text-white transition-colors">README</a>
              <a href="#dataset" className="hover:text-white transition-colors">Dataset</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center gap-4 text-xs font-mono text-gray-500 uppercase tracking-widest text-center">
            <p className="font-bold text-white mb-2">VeriNews AI — Because truth shouldn't be optional.</p>
            <p>© 2026 Team VeriNews AI · Built with purpose, powered by AI.</p>
          </div>
        </div>
      </footer>

      {/* Global Loading Overlay */}
      <AnimatePresence>
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center select-none"
          >
            <div className="w-[400px] bg-black border border-white/20 p-8 shadow-2xl">
              <div className="font-black uppercase text-2xl tracking-widest mb-6 border-b border-white/10 pb-4 text-white">System Override</div>
              <div className="font-mono text-sm text-gray-400 space-y-4">
                <div className="flex justify-between items-center">
                  <span>Connection:</span>
                  <span className="text-green-500">SECURE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Routing:</span>
                  <span className="text-gray-300">GEMINI/NLP</span>
                </div>
                <div className="mt-6 pt-4 border-t border-white/10">
                  <span className="text-white tracking-widest uppercase">[{loadingText}]</span>
                  <span className="animate-pulse ml-1">_</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
