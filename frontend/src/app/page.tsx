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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await analyzeArticle(headline, content);
      if (res.success) {
        setResult(res.data);
        fetchHistory();
      }
    } catch (err) {
      console.error("Analysis failed:", err);
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
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Background Blobs */}
      <div className="blob w-[400px] h-[400px] bg-primary top-[-100px] left-[-100px]" />
      <div className="blob w-[300px] h-[300px] bg-accent bottom-[-50px] right-[-50px] animation-delay-2000" />

      {/* Header */}
      <nav className="flex items-center justify-between pb-6 border-b border-glass-border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-xl">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
              TruthLens AI
            </h1>
            <p className="text-sm text-slate-400">Misinformation Intelligence Dashboard</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Docs</button>
          <button className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Settings</button>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-8 space-y-8">
          <section className="glass-panel p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BrainCircuit className="text-accent" />
                Analyze New Article
              </h2>
              <p className="text-slate-400 text-sm">Paste headline and text for multi-layered NLP verification.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Headline</label>
                <input 
                  type="text" 
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Unusual weather patterns observed in the Sahara..."
                  className="w-full p-3 bg-black/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Article Content</label>
                <textarea 
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste the full article text here..."
                  className="w-full p-3 bg-black/20"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => {setHeadline(''); setContent(''); setResult(null);}}
                  className="px-6 py-2 rounded-xl border border-glass-border hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2 bg-gradient-to-r from-primary to-accent rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? 'Analyzing...' : 'Run Intelligence Analysis'}
                </button>
                <button 
                  type="button"
                  onClick={() => alert('Feature coming soon: Exporting Canva-styled PDF Report...')}
                  className="px-6 py-2 rounded-xl bg-white/5 border border-glass-border hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                >
                  <TrendingUp className="w-4 h-4 text-accent" />
                  Export Canva Report
                </button>
              </div>
            </form>
          </section>

          {/* Results Area */}
          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Main Verdict */}
                <div className="glass-panel p-6 space-y-4 flex flex-col items-center justify-center text-center">
                  <h3 className="text-slate-400 text-sm font-medium self-start">Overall AI Verdict</h3>
                  <div className={`p-4 rounded-full ${result.isLikelyFake ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                    {result.isLikelyFake ? <AlertTriangle className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
                  </div>
                  <h4 className={`text-2xl font-bold ${result.isLikelyFake ? 'text-danger' : 'text-success'}`}>
                    {result.isLikelyFake ? 'High Risk: Likely Fake' : 'Verified: Likely Real'}
                  </h4>
                  <div className="w-full pt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>AI Confidence</span>
                      <span>{result.confidenceScore.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidenceScore}%` }}
                        className={`h-full ${result.isLikelyFake ? 'bg-danger' : 'bg-success'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Source Credibility */}
                <div className="glass-panel p-6 space-y-4">
                  <h3 className="text-slate-400 text-sm font-medium">Source Credibility</h3>
                  {renderConfidenceChart(result.sourceCredibility, result.isLikelyFake)}
                  <div className="text-center pt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${result.sourceCredibility > 70 ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
                      {result.sourceCredibility > 70 ? 'Reputable History' : 'Unverified Domain Pattern'}
                    </span>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="glass-panel p-6 md:col-span-2 space-y-6">
                  <h3 className="text-slate-400 text-sm font-medium">Linguistic & Sentiment Indicators</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Manipulative Language</span>
                        <span className="text-slate-400">{result.manipulativeScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-warning" style={{ width: `${result.manipulativeScore}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Sensationalism</span>
                        <span className="text-slate-400">{result.sensationalismScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-accent" style={{ width: `${result.sensationalismScore}%` }} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Objectivity</span>
                        <span className="text-slate-400">{result.objectivityScore}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-success" style={{ width: `${result.objectivityScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ethical Disclaimer */}
                <div className="md:col-span-2 p-4 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs flex gap-3">
                  <Info className="flex-shrink-0 w-4 h-4" />
                  <p>
                    <strong>Ethical AI Disclaimer:</strong> This system uses automated text analysis and cross-checks against fixed datasets. It does not replace journalistic integrity or professional fact-checking. Always verify with multiple primary sources.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar History */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Recent Analysis
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-8">No analysis history yet.</p>
              ) : (
                history.map((item, i) => (
                  <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-2 hover:border-primary/30 transition-colors group cursor-pointer">
                    <div className="flex items-start justify-between">
                      <p className="text-xs font-medium text-slate-200 line-clamp-1 group-hover:text-primary transition-colors">{item.headline}</p>
                      {item.isLikelyFake ? 
                        <AlertTriangle className="w-3 h-3 text-danger flex-shrink-0" /> : 
                        <ShieldCheck className="w-3 h-3 text-success flex-shrink-0" />
                      }
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      <span className={item.isLikelyFake ? 'text-danger/70' : 'text-success/70'}>
                        {Math.round(item.confidenceScore)}% Confidence
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="glass-panel p-6 bg-gradient-to-br from-primary/10 to-transparent">
            <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Dataset Statistics
            </h3>
            <p className="text-xs text-slate-400 mb-4">Leveraging 26,000+ labeled news articles for factual consistency.</p>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Real Articles</span>
                <span className="text-success font-medium">12.4k</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Fake Articles</span>
                <span className="text-danger font-medium">13.8k</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
