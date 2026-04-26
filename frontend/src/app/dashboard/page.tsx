"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  Info,
  BrainCircuit,
  Shield,
  Layers,
  Sun,
  Moon,
  MessageSquare,
  Plus,
  Send,
  History,
  X,
  User,
  Bot,
  ImageIcon,
  Upload
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { analyzeArticle, getHistory, chatWithAgent } from '@/lib/api';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  headline: string;
  result: any;
  messages: Message[];
  createdAt: string;
}

export default function Dashboard() {
  // UI State
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isChatMode, setIsChatMode] = useState(false);

  // Data State
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Screenshot State
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = savedTheme || (prefersDark ? 'dark' : 'light');
      setIsDark(theme === 'dark');
      document.documentElement.classList.toggle('dark', theme === 'dark');

      const savedSessions = localStorage.getItem('chat_sessions');
      if (savedSessions) setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeSessionId, sessions]);

  const toggleTheme = () => {
    const newTheme = !isDark ? 'dark' : 'light';
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark', !isDark);
    localStorage.setItem('theme', newTheme);
  };

  // ── Screenshot helpers ──────────────────────────────────────────────────
  const clearScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImageFile = (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrorText('Only JPG, PNG, and WEBP images are supported.');
      return;
    }
    setScreenshotFile(file);
    setErrorText(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setScreenshotPreview(dataUrl);
      // Strip the data:image/...;base64, prefix — backend only wants raw base64
      setScreenshotBase64(dataUrl.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };
  // ────────────────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    setIsChatMode(false);
    setActiveSessionId(null);
    setHeadline('');
    setContent('');
    setSourceUrl('');
    setErrorText(null);
    clearScreenshot();
  };

  const handleStartScan = async (e: React.FormEvent) => {
    e.preventDefault();

    // Must have at least a screenshot OR headline+content
    if (!screenshotBase64 && (!headline.trim() || !content.trim())) {
      setErrorText('Please fill in Headline & Article Body, or upload a screenshot.');
      return;
    }

    setLoading(true);
    setErrorText(null);

    try {
      const res = await analyzeArticle(
        headline,
        content,
        sourceUrl,
        screenshotBase64 ?? undefined
      );
      if (res.success) {
        const newSession: ChatSession = {
          id: res.data.id || Math.random().toString(36).substring(7),
          headline: headline || '(screenshot scan)',
          result: res.data,
          messages: [],
          createdAt: new Date().toISOString()
        };
        setSessions([newSession, ...sessions]);
        setActiveSessionId(newSession.id);
        setIsChatMode(true);
        clearScreenshot();
      } else {
        setErrorText(res.error || 'Analysis failed.');
      }
    } catch (err: any) {
      setErrorText('Intelligence scan failed. Connection unstable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading || !activeSessionId) return;

    const currentSession = sessions.find(s => s.id === activeSessionId);
    if (!currentSession) return;

    const userMsg = chatInput;
    setChatInput('');

    // Optimistic update
    const updatedSessions = sessions.map(s =>
      s.id === activeSessionId
        ? { ...s, messages: [...s.messages, { role: 'user', content: userMsg } as Message] }
        : s
    );
    setSessions(updatedSessions);
    setChatLoading(true);

    try {
      const res = await chatWithAgent(userMsg, currentSession.messages, currentSession.result);
      if (res.success) {
        setSessions(prev => prev.map(s =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, { role: 'assistant', content: res.response } as Message] }
            : s
        ));
      }
    } catch (err) {
      console.error('Chat failed:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    setIsChatMode(true);
  };

  const renderTrustCircle = (score: number) => {
    const color = score > 70 ? '#22c55e' : '#ef4444';
    const data = {
      datasets: [{
        data: [score, 100 - score],
        backgroundColor: [color, isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'],
        borderWidth: 0,
        borderRadius: 20,
      }],
    };
    return (
      <div className="relative w-20 h-20 mx-auto">
        <Doughnut data={data} options={{ cutout: '85%', plugins: { legend: { display: false }, tooltip: { enabled: false } }, maintainAspectRatio: false }} />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-foreground">
          {Math.round(score)}%
        </div>
      </div>
    );
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-inter transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-80 border-r border-glass-border flex flex-col bg-background/50 backdrop-blur-xl hidden md:flex">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-foreground" />
            <h1 className="text-xl font-black tracking-tighter">VeriNews AI.</h1>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-glass-border hover:bg-foreground/5 transition-all text-xs font-bold uppercase tracking-widest"
          >
            New Deep Scan
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
          <div className="px-2 mb-4">
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Scan History</p>
          </div>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => selectSession(s.id)}
              className={`w-full text-left p-4 rounded-xl transition-all border group ${activeSessionId === s.id ? 'bg-foreground/5 border-glass-border' : 'border-transparent hover:bg-foreground/5'}`}
            >
              <p className="text-xs font-bold truncate mb-1">{s.headline}</p>
              <div className="flex justify-between items-center text-[10px] text-foreground/40 font-medium">
                <span>{s.result.verdict}</span>
                <span>{new Date(s.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-glass-border flex justify-between items-center">
          <button onClick={toggleTheme} className="p-2 rounded-lg border border-glass-border hover:bg-foreground/5">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">v1.2.0-STABLE</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-glass-border flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <h1 className="text-lg font-black tracking-tighter">VeriNews AI.</h1>
          </div>
          <button onClick={handleNewChat} className="p-2 rounded-lg border border-glass-border"><Plus className="w-4 h-4" /></button>
        </header>

        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar" ref={scrollRef}>
          {!isChatMode ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="max-w-2xl w-full space-y-12 py-12">
                <div className="text-center space-y-4">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-foreground/5 border border-glass-border rounded-3xl">
                      <ShieldCheck className="w-12 h-12" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black tracking-tighter">Initiate Intelligence Scan</h2>
                  <p className="text-foreground/40 text-sm max-w-sm mx-auto">Analyze the integrity of news headlines and content through our Neural Verification Engine.</p>
                </div>

                <form onSubmit={handleStartScan} className="glass-panel p-8 space-y-8">
                  <div className="space-y-4">

                    {/* Headline */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Headline</label>
                      <input
                        type="text"
                        id="headline-input"
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        placeholder="Enter the primary headline..."
                        className="w-full px-5 py-4 text-base"
                        required={!screenshotBase64}
                      />
                    </div>

                    {/* Source + latency note */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">Source (Optional)</label>
                        <input
                          type="text"
                          id="source-input"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          placeholder="source-news.com"
                          className="w-full px-4 py-3 text-sm"
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <div className="flex items-center gap-2 text-foreground/20 text-[10px] font-bold uppercase ml-2">
                          <Info className="w-3 h-3" />
                          <span>Latency Target: &lt; 2.4s</span>
                        </div>
                      </div>
                    </div>

                    {/* Article Body */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
                        Article Body
                        {screenshotBase64 && (
                          <span className="ml-2 text-foreground/20 normal-case tracking-normal font-medium">(optional — screenshot provided)</span>
                        )}
                      </label>
                      <textarea
                        id="content-input"
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Paste article text here for analysis..."
                        className="w-full px-5 py-4 text-sm resize-none"
                        required={!screenshotBase64}
                      />
                    </div>

                    {/* ── SCREENSHOT ANALYSIS ─────────────────────────────── */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <ImageIcon className="w-3 h-3" />
                        Screenshot Analysis
                        <span className="text-foreground/20 normal-case tracking-normal font-medium">(optional)</span>
                      </label>

                      {/* Hidden native file input */}
                      <input
                        ref={fileInputRef}
                        id="screenshot-file-input"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                      />

                      {screenshotPreview ? (
                        /* ── Preview card ── */
                        <div className="relative rounded-2xl overflow-hidden border border-glass-border group">
                          <img
                            src={screenshotPreview}
                            alt="Uploaded screenshot preview"
                            className="w-full max-h-56 object-cover"
                          />
                          {/* Hover overlay with remove button */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={clearScreenshot}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur transition-colors"
                            >
                              <X className="w-3 h-3" />
                              Remove Screenshot
                            </button>
                          </div>
                          {/* Filename badge */}
                          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded-lg max-w-[80%] truncate">
                            {screenshotFile?.name}
                          </div>
                          {/* "Uploaded" badge */}
                          <div className="absolute top-2 right-2 bg-green-500/90 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg">
                            ✓ Ready
                          </div>
                        </div>
                      ) : (
                        /* ── Drop zone ── */
                        <div
                          role="button"
                          tabIndex={0}
                          id="screenshot-drop-zone"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={handleFileDrop}
                          className={`relative flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 ${
                            isDragOver
                              ? 'border-foreground/60 bg-foreground/10 scale-[1.02]'
                              : 'border-glass-border hover:border-foreground/30 hover:bg-foreground/[0.03]'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl transition-all duration-200 ${isDragOver ? 'bg-foreground/20 scale-110' : 'bg-foreground/5'}`}>
                            <Upload className="w-6 h-6 text-foreground/50" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-semibold text-foreground/60">
                              {isDragOver ? 'Drop to upload' : 'Drag & drop a screenshot'}
                            </p>
                            <p className="text-[10px] text-foreground/30 font-mono">
                              or click to browse &nbsp;·&nbsp; JPG, PNG, WEBP
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* ─────────────────────────────────────────────────────── */}

                  </div>

                  <button
                    type="submit"
                    id="execute-scan-btn"
                    disabled={loading}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-30 active:scale-[0.98] ${
                      isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {loading ? 'Processing Neural Signals...' : 'Execute Deep Scan'}
                  </button>
                  {errorText && <p className="text-center text-xs font-bold text-red-500/80">{errorText}</p>}
                </form>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-30">
                  {[
                    { title: 'Logic Check', icon: BrainCircuit },
                    { title: 'RAG Evidence', icon: Search },
                    { title: 'Domain Audit', icon: Shield }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 p-4 border border-glass-border rounded-2xl">
                      <item.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : activeSession && (
            <div className="flex-1 flex flex-col h-full">
              {/* Analysis Header */}
              <div className="p-8 border-b border-glass-border bg-background/50 backdrop-blur sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Neural Verdict</p>
                    <h2 className={`text-5xl font-black italic tracking-tighter leading-none ${activeSession.result.isLikelyFake ? 'text-red-500' : 'text-green-500'}`}>
                      {activeSession.result.verdict}
                    </h2>
                    <div className="flex gap-4 pt-2">
                      <span className={`text-[10px] font-bold py-1 px-3 border rounded-full ${activeSession.result.isLikelyFake ? 'border-red-500/20 text-red-500/60' : 'border-green-500/20 text-green-500/60'}`}>
                        Source: {activeSession.result.sourceName}
                      </span>
                      <span className="text-[10px] font-bold py-1 px-3 border border-glass-border rounded-full text-foreground/60">Confidence: {activeSession.result.confidenceScore}%</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-8 px-8 py-5 glass-panel border-t-4 transition-all bg-foreground/[0.02] backdrop-blur-md ${activeSession.result.isLikelyFake ? 'border-t-red-500' : 'border-t-green-500'} shadow-2xl shadow-black/5`}>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em]">Source Trust</p>
                      <p className={`text-sm font-black uppercase tracking-widest ${activeSession.result.sourceCredibility > 70 ? 'text-green-500' : 'text-red-500'}`}>
                        {activeSession.result.sourceCredibility > 70 ? 'Verified' : 'Flagged'}
                      </p>
                    </div>
                    <div className="w-px h-10 bg-glass-border" />
                    {renderTrustCircle(activeSession.result.sourceCredibility)}
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 p-8 space-y-8 max-w-4xl mx-auto w-full">
                {/* Initial Analysis Result */}
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${activeSession.result.isLikelyFake ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                    {activeSession.result.isLikelyFake ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </div>
                  <div className="space-y-4 max-w-2xl">
                    <p className="text-sm font-bold text-foreground/40 uppercase tracking-widest">VeriNews AI Analysis</p>
                    <p className="text-lg font-light leading-relaxed text-foreground/80">
                      {activeSession.result.analysisReason}
                    </p>
                  </div>
                </div>

                {activeSession.messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-glass-border flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div className={`p-5 rounded-2xl max-w-2xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-foreground/5 border border-glass-border font-medium'
                        : 'font-light text-foreground/80'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-glass-border flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="h-10 w-20 bg-foreground/5 rounded-xl border border-glass-border" />
                  </div>
                )}
              </div>

              {/* Chat Input Box */}
              <div className="p-8 border-t border-glass-border bg-background/50 backdrop-blur sticky bottom-0">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative">
                  <input
                    type="text"
                    id="chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about this article's verification details..."
                    className="w-full pl-6 pr-16 py-4 bg-foreground/5 border-glass-border focus:bg-foreground/10"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-foreground text-background hover:opacity-80 transition-all disabled:opacity-30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
