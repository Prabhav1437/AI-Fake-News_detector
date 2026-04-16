"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Search, 
  BarChart3, 
  History, 
  Info,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { analyzeArticle, getHistory } from '@/lib/api';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await getHistory();
      if (res.success) setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setErrorText(null);

    try {
      const res = await analyzeArticle(headline, content);
      if (res.success) {
        setResult(res.data);
        fetchHistory();
      } else {
        setErrorText(res.error || "Failed to analyze article.");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorText(err.response.data.error);
      } else {
        setErrorText("Network or server error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderConfidenceChart = (score: number, isFake: boolean) => {
    const data = {
      datasets: [
        {
          data: [score, 100 - score],
          backgroundColor: [isFake ? '#ef4444' : '#10b981', 'rgba(255, 255, 255, 0.1)'],
          borderWidth: 0,
          borderRadius: 5,
        },
      ],
    };

    return (
      <div className="relative w-32 h-32 mx-auto">
        <Doughnut 
          data={data} 
          options={{ 
            cutout: '75%', 
            plugins: { legend: { display: false }, tooltip: { enabled: false } },
            maintainAspectRatio: false 
          }} 
        />
        <div className="absolute inset-0 flex items-center justify-center font-bold text-xl">
          {Math.round(score)}%
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      {/* Background Blobs */}
      <div className="blob w-[500px] h-[500px] bg-primary/20 top-[-200px] left-[-200px]" />
      <div className="blob w-[400px] h-[400px] bg-accent/20 bottom-[-100px] right-[-100px] animation-delay-2000" />
      <div className="blob w-[300px] h-[300px] bg-indigo-500/10 top-[20%] right-[10%] animation-delay-4000" />

      {/* Header */}
      <nav className="flex flex-col md:flex-row items-center justify-between pb-8 border-b border-glass-border gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/20 p-3 rounded-2xl shadow-inner shadow-primary/30 backdrop-blur-md">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent italic">
              TruthLens<span className="not-italic text-primary">AI</span>
            </h1>
            <p className="text-sm text-slate-400 font-medium">State-of-the-Art Misinformation Intelligence</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-white/5 border border-glass-border px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-2" />
            <span className="text-xs font-semibold text-slate-300">Live Analysis Engine Active</span>
          </div>
        </div>
      </nav>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Network Confidence', value: '99.8%', color: 'text-primary', icon: BrainCircuit },
          { label: 'Scanned Sources', value: '2.4M+', color: 'text-accent', icon: Search },
          { label: 'Daily Verifications', value: '42.1k', color: 'text-success', icon: TrendingUp },
          { label: 'Fake Trends Info', value: '89.2%', color: 'text-danger', icon: AlertTriangle },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-4 flex items-center gap-4 hover:border-primary/20 transition-all cursor-default group">
            <div className={`p-2 rounded-lg bg-black/20 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence>
            {errorText && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-danger/20 border border-danger/50 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-danger" />
                <p className="text-sm font-semibold text-slate-200">{errorText}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <section className="glass-panel p-6 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Sparkles className="w-40 h-40" />
            </div>
            
            <div className="mb-8 relative z-10">
              <h2 className="text-2xl font-bold flex items-center gap-3 mb-2">
                <BrainCircuit className="text-primary w-7 h-7" />
                Neural Verification Lab
              </h2>
              <p className="text-slate-400 text-sm max-w-xl">
                Deploying multi-layered linguistic analysis, sensationalism detection, and manipulative pattern recognition to verify journalistic integrity.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Article Headline</label>
                <input 
                  type="text" 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Breaking: Mysterious lights spotted over Tokyo harbor..."
                  className="w-full px-5 py-4 bg-black/40 border-glass-border text-lg focus:ring-2 focus:ring-primary/20 transition-all shadow-xl"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Content</label>
                <textarea 
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the full article body for deep semantic analysis..."
                  className="w-full px-5 py-4 bg-black/40 border-glass-border text-base focus:ring-2 focus:ring-primary/20 transition-all shadow-xl resize-none"
                  required
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 p-4 rounded-2xl border border-glass-border">
                <div className="flex items-center gap-3 text-slate-400">
                  <Info className="w-4 h-4" />
                  <span className="text-xs">Estimated analysis time: &lt; 2.4s</span>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button 
                    type="button" 
                    onClick={() => {setHeadline(''); setContent(''); setResult(null);}}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-glass-border hover:bg-white/10 transition-all font-semibold text-sm"
                  >
                    Reset
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 sm:flex-none px-10 py-3 bg-gradient-to-br from-primary via-indigo-600 to-accent rounded-xl font-bold shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:translate-y-[-2px] active:translate-y-[1px] transition-all disabled:opacity-50 disabled:translate-y-0 text-white"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyzing...
                      </span>
                    ) : 'Initiate Deep Scan'}
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* Results Area */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {/* Main Verdict Card */}
                <div className="glass-panel p-8 md:col-span-2 space-y-6 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 ${result.isLikelyFake ? 'bg-danger/40' : 'bg-success/40'}`} />
                  
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Intelligence Verdict</h3>
                      <h4 className={`text-4xl font-black italic tracking-tighter ${result.isLikelyFake ? 'text-danger' : 'text-success'}`}>
                        {result.isLikelyFake ? 'DECEPTIVE' : 'VERIFIED'}
                      </h4>
                      {result.detectedSource && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Recognized Source:</span>
                          <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                            {result.detectedSource}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`p-5 rounded-2xl shadow-xl ${result.isLikelyFake ? 'bg-danger/20 text-danger border border-danger/30' : 'bg-success/20 text-success border border-success/30'}`}>
                      {result.isLikelyFake ? <AlertTriangle className="w-10 h-10" /> : <ShieldCheck className="w-10 h-10" />}
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      {result.analysisReason || (result.isLikelyFake 
                        ? "Our neural engine detected multiple markers of sensationalism and manipulative language typically associated with misinformation." 
                        : "High semantic consistency and neutral linguistic markers suggest this article adheres to standard journalistic practices.")}
                    </p>
                    
                    <div className="w-full pt-4 space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-slate-400">Scan Confidence</span>
                        <span className="text-3xl font-black text-white">{result.confidenceScore.toFixed(1)}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidenceScore}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full shadow-[0_0_15px] ${result.isLikelyFake ? 'bg-danger shadow-danger/50' : 'bg-success shadow-success/50'}`}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-glass-border flex justify-between items-center">
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verification ID: {result.id}</p>
                     <button 
                        onClick={() => alert(`Generating TruthLens Intelligence Report for ID: ${result.id}...`)}
                        className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-xl border border-glass-border hover:bg-white/20 transition-all flex items-center gap-2"
                     >
                       <TrendingUp className="w-3 h-3" />
                       Download Analysis PDF
                     </button>
                  </div>
                </div>

                {/* Source Score Card */}
                <div className="glass-panel p-8 flex flex-col items-center justify-between text-center group">
                  <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest self-start">Integrity Score</h3>
                  <div className="relative py-6">
                    {renderConfidenceChart(result.sourceCredibility, result.isLikelyFake)}
                    <div className="mt-4">
                      <p className={`text-sm font-bold py-2 px-4 rounded-xl inline-block transition-all ${result.sourceCredibility > 70 ? 'bg-success/20 text-success border border-success/20' : 'bg-warning/20 text-warning border border-warning/20 group-hover:bg-warning/30'}`}>
                        {result.sourceCredibility > 70 ? 'High Trust Factor' : 'Low Factual Origin'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Analysis based on domain history and citation patterns.</p>
                </div>

                {/* Detail Analysis Metrics */}
                <div className="glass-panel p-8 md:col-span-3 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                       <BarChart3 className="text-primary w-5 h-5" />
                       Linguistic Fingerprint
                    </h3>
                    <div className="text-xs bg-white/5 px-3 py-1.5 rounded-full border border-glass-border font-mono text-slate-400">
                      METRIC_SCAN_1024_COMPLETE
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                    {[
                      { label: 'Manipulative Tone', score: result.manipulativeScore, color: 'bg-warning', icon: TrendingDown },
                      { label: 'Sensationalism', score: result.sensationalismScore, color: 'bg-accent', icon: Sparkles },
                      { label: 'Objectivity Index', score: result.objectivityScore, color: 'bg-success', icon: Info },
                    ].map((metric, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <metric.icon className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-bold text-slate-300">{metric.label}</span>
                          </div>
                          <span className="text-lg font-black text-white">{metric.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${metric.score}%` }}
                            transition={{ duration: 1.2, delay: i * 0.1 }}
                            className={`h-full ${metric.color} shadow-[0_0_10px] shadow-current opacity-80`}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 leading-tight">
                          {metric.score > 50 ? 'Significantly above baseline threshold.' : 'Within standard journalistic variance.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Ethics Alert */}
                <div className="md:col-span-3 p-6 rounded-2xl bg-gradient-to-r from-warning/10 to-transparent border border-warning/20 text-warning/80 text-sm flex gap-4 backdrop-blur-sm">
                  <Info className="flex-shrink-0 w-6 h-6" />
                  <div className="space-y-1">
                    <p className="font-bold">Journalistic Integrity Notice</p>
                    <p className="text-xs opacity-70">
                      Automated analysis serves as a cognitive aid, not a definitive verdict. Always cross-reference with primary documents, verified eyewitness accounts, and professional fact-checking organizations like Poynter or Reuters.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* How it works Section */}
          <section className="glass-panel p-10 space-y-8 bg-gradient-to-b from-white/[0.02] to-transparent">
             <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold italic tracking-tight">How TruthLens Operates</h3>
                <p className="text-slate-500 text-sm">Transparency in AI processing leads to better decision making.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: "Semantic Parsing", desc: "Our engine deconstructs sentences to find inconsistencies in factual claims and emotional weights.", icon: Info },
                  { title: "Linguistic Fingerprinting", desc: "Comparing prose against known misinformation datasets containing over 50,000 labeled articles.", icon: BrainCircuit },
                  { title: "Domain Auditing", desc: "Cross-referencing claims against established trust-registered news networks and scientific journals.", icon: Search }
                ].map((step, i) => (
                  <div key={i} className="space-y-3 relative">
                    <div className="text-4xl font-black text-primary/10 absolute -top-4 -left-2 select-none">0{i+1}</div>
                    <div className="flex items-center gap-2 font-bold text-slate-200 relative z-10">
                       <step.icon className="w-5 h-5 text-primary" />
                       {step.title}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed relative z-10">{step.desc}</p>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Sidebar History */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="glass-panel p-8 sticky top-8">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              Intelligence Log
            </h3>
            <div className="space-y-5 max-h-[800px] overflow-y-auto pr-3 custom-scrollbar">
              {history.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                   <div className="p-4 rounded-full bg-white/5 border border-white/5">
                      <Search className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-medium text-slate-400">Your scan history <br/> is currently empty.</p>
                </div>
              ) : (
                history.map((item, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.id} 
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 hover:bg-white/[0.08] hover:border-primary/20 transition-all group cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-slate-200 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{item.headline}</p>
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${item.isLikelyFake ? 'bg-danger/10 text-danger border border-danger/10' : 'bg-success/10 text-success border border-success/10'}`}>
                        {item.isLikelyFake ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                         <div className={`w-1.5 h-1.5 rounded-full ${item.isLikelyFake ? 'bg-danger' : 'bg-success'}`} />
                         <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md ${item.isLikelyFake ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {Math.round(item.confidenceScore)}% Confidence
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/10 relative overflow-hidden group">
            <div className="absolute -bottom-4 -right-4 transition-transform group-hover:scale-110">
               <TrendingUp className="w-32 h-32 opacity-10 text-primary rotate-12" />
            </div>
            <h3 className="font-black text-primary mb-4 flex items-center gap-2 text-lg italic tracking-tight">
              <Sparkles className="w-5 h-5" />
              Dataset Pulse
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed font-medium">Monitoring misinformation trends across 26k+ global news vectors.</p>
            <div className="space-y-4">
              {[
                { label: 'Real Article Vectors', value: '12,482', color: 'text-success' },
                { label: 'Deceptive Vectors', value: '13,819', color: 'text-danger' },
                { label: 'Uncertain/Mixed', value: '1,204', color: 'text-warning' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">{item.label}</span>
                  <span className={`${item.color} font-black font-mono`}>{item.value}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-primary/20">
               View Live Heatmap
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

