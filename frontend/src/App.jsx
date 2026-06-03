import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bot, 
  Activity, 
  Search, 
  Cpu, 
  TrendingUp, 
  Wallet, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CircleDot,
  Terminal,
  Compass
} from 'lucide-react';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [balance, setBalance] = useState({ usdtBalance: 0, allAssets: [] });
  const [history, setHistory] = useState([]);
  const [searchAsset, setSearchAsset] = useState('BTC');
  const [autoExecute, setAutoExecute] = useState(false);
  const [tradeAmount, setTradeAmount] = useState(10);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [backendStatus, setBackendStatus] = useState('offline');

  const fetchDashboardData = async () => {
    setIsFetchingData(true);
    try {
      const healthRes = await axios.get(`${BACKEND_URL}/health`);
      if (healthRes.data.status === 'healthy') {
        setBackendStatus('online');
      }

      const balanceRes = await axios.get(`${BACKEND_URL}/api/v1/bitget/balance`);
      if (balanceRes.data.success) {
        setBalance(balanceRes.data);
      }

      const historyRes = await axios.get(`${BACKEND_URL}/api/v1/analyzer/history`);
      if (historyRes.data.success) {
        setHistory(historyRes.data.logs);
      }
    } catch (error) {
      console.error('Connection issue with backend:', error.message);
      setBackendStatus('offline');
    } finally {
      setIsFetchingData(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRunPipeline = async (e) => {
    e.preventDefault();
    if (!searchAsset) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/analyzer/analyze`, {
        asset: searchAsset.trim().toUpperCase(),
        autoExecute: autoExecute,
        amount: parseFloat(tradeAmount)
      });
      
      setAnalysisResult(response.data);
      fetchDashboardData();
    } catch (error) {
      console.error('Pipeline execution issue:', error.message);
      alert('Failed to complete analysis pipeline. Confirm backend connection and API keys.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden px-4 py-8 md:px-12 md:py-10">
      
      {/* Liquid 3D Background Lighting Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] liquid-glow-1 pointer-events-none z-0"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[45vw] h-[45vw] liquid-glow-2 pointer-events-none z-0"></div>
      <div className="absolute top-[35%] left-[30%] w-[35vw] h-[35vw] liquid-glow-3 pointer-events-none z-0"></div>

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Apple Grade Premium Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 pb-8 border-b border-white/5 gap-6">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center p-3.5 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.4)] text-white">
              <Bot className="w-8 h-8" />
              <div className="absolute inset-0 rounded-2xl border border-white/20 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                TradeMind AI
              </h1>
              <p className="text-xs font-semibold tracking-wider uppercase text-blue-400/80 mt-0.5 flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 animate-pulse" />
                Autonomous Sentiment-to-Execution Terminal
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/60 border border-white/5 backdrop-blur-md">
              <span className={`w-2.5 h-2.5 rounded-full ${backendStatus === 'online' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`}></span>
              <span className="font-mono text-xs font-black tracking-wider text-slate-300">
                SYSTEM: {backendStatus.toUpperCase()}
              </span>
            </div>

            <button 
              onClick={fetchDashboardData}
              disabled={isFetchingData}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetchingData ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
        </header>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Metrics & Control Panels */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Elegant Portfolio Liquid Card */}
            <div className="glass-card p-7 rounded-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-extrabold tracking-wider uppercase flex items-center gap-2 text-slate-300">
                  <Wallet className="w-4.5 h-4.5 text-blue-400" />
                  Asset Liquidity
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              
              <div className="mb-8 bg-gradient-to-br from-slate-950/80 to-slate-900/40 p-5 rounded-2xl border border-white/5">
                <span className="text-xs font-semibold text-slate-400">Available USDT Base Balance</span>
                <div className="text-4xl font-black tracking-tight text-white mt-1.5">
                  {balance.usdtBalance.toFixed(2)} <span className="text-sm font-bold text-blue-400 uppercase">USDT</span>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Portfolio Allocations</span>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1.5">
                  {balance.allAssets?.filter(a => parseFloat(a.available) > 0).map((asset) => (
                    <div key={asset.coin} className="flex justify-between items-center bg-slate-950/45 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <span className="font-extrabold text-sm text-slate-200">{asset.coin}</span>
                      <span className="font-mono text-sm font-bold text-white">{parseFloat(asset.available).toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Premium 3D Controller */}
            <div className="glass-card p-7 rounded-3xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase mb-6 flex items-center gap-2 text-slate-300">
                <Cpu className="w-4.5 h-4.5 text-blue-400" />
                Agent Parameters
              </h2>
              <form onSubmit={handleRunPipeline} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Ticker</label>
                  <input 
                    type="text" 
                    value={searchAsset}
                    onChange={(e) => setSearchAsset(e.target.value)}
                    placeholder="e.g. SOL, BTC, ETH"
                    className="w-full glass-input p-3.5 rounded-xl text-white font-black text-md focus:outline-none uppercase tracking-widest text-center"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-950/45 rounded-xl border border-white/5">
                  <div>
                    <span className="text-sm font-bold block text-slate-200">Autonomous Trade Execution</span>
                    <span className="text-2xs text-slate-400 block mt-0.5">Place market order if confidence &gt;= 80%</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={autoExecute}
                    onChange={(e) => setAutoExecute(e.target.checked)}
                    className="w-5 h-5 accent-blue-500 rounded cursor-pointer"
                  />
                </div>

                {autoExecute && (
                  <div className="transition-all duration-300">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Sizing parameters (USDT)</label>
                    <input 
                      type="number" 
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      min="5"
                      className="w-full glass-input p-3.5 rounded-xl text-white font-bold focus:outline-none"
                    />
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] text-white font-black py-4 px-4 rounded-xl transition-all disabled:opacity-55 cursor-pointer shadow-[0_4px_20px_rgba(59,130,246,0.3)]"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      COMPILING DATA ANALYSIS...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      EXECUTE AGENT SCAN
                    </>
                  )}
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Execution Output Terminal & Live Logs */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* High-end Output Dashboard Panel */}
            {analysisResult ? (
              <div className="glass-card p-8 rounded-3xl border-blue-500/10 shadow-[0_15px_40px_rgba(59,130,246,0.05)]">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                  <h2 className="text-md font-black flex items-center gap-2 text-blue-400 tracking-tight">
                    <Terminal className="w-5 h-5" />
                    ANALYSIS FEEDBACK: {analysisResult.signal?.asset}
                  </h2>
                  <span className="text-2xs font-mono bg-white/5 px-2.5 py-1 rounded-md text-slate-400 uppercase">
                    {new Date(analysisResult.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">AI Sentiment Sentiment</span>
                    <span className={`text-xl font-black block mt-2 ${analysisResult.signal?.sentiment === 'BULLISH' ? 'text-emerald-400' : analysisResult.signal?.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-yellow-400'}`}>
                      {analysisResult.signal?.sentiment}
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">Model Confidence</span>
                    <span className="text-xl font-black text-white block mt-2">
                      {analysisResult.signal?.confidenceScore}%
                    </span>
                  </div>
                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-white/5">
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">Action Recommendation</span>
                    <span className="text-xl font-black text-slate-300 block mt-2 uppercase">
                      {analysisResult.signal?.actionableTrade ? '⚡ Actionable' : '⏸ Wait'}
                    </span>
                  </div>
                </div>

                {/* Technical setup specs */}
                <div className="bg-slate-950/70 p-5 rounded-2xl border border-white/5 space-y-4 mb-6">
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-white/5 pb-2">Target Trade Specifications</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-slate-400 text-2xs uppercase tracking-wider block">Direction</span>
                      <strong className="text-white text-md font-black block mt-1">{analysisResult.signal?.tradeSetup?.direction}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-2xs uppercase tracking-wider block">Entry range</span>
                      <strong className="text-white text-md font-black block mt-1">{analysisResult.signal?.tradeSetup?.entryRange}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-2xs uppercase tracking-wider block">Stop Loss</span>
                      <strong className="text-rose-400 text-md font-black block mt-1">{analysisResult.signal?.tradeSetup?.stopLoss}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-2xs uppercase tracking-wider block">Take Profit</span>
                      <strong className="text-emerald-400 text-md font-black block mt-1">{analysisResult.signal?.tradeSetup?.takeProfit}</strong>
                    </div>
                  </div>
                </div>

                {/* LLM detailed analysis summary */}
                <div className="text-sm bg-slate-950/50 p-5 rounded-2xl border border-white/5 text-slate-300 leading-relaxed italic mb-6">
                  "{analysisResult.signal?.analysisSummary}"
                </div>

                {/* Live Position execution logs */}
                {analysisResult.execution && (
                  <div className={`p-5 rounded-2xl border flex items-start gap-4 ${analysisResult.execution.executed ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-slate-900/10 border-white/5 text-slate-400'}`}>
                    {analysisResult.execution.executed ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-emerald-400 text-sm font-black">Bitget Order Executed Successfully</strong>
                          <span className="text-xs text-slate-400 mt-1 block">ID: {analysisResult.execution.orderId} | Cost parameters: {analysisResult.execution.amountAllocated} USDT</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-200 text-sm font-black">Autonomous Execution Bypassed</strong>
                          <span className="text-xs text-slate-400 mt-1 block">{analysisResult.execution.reason || analysisResult.execution.error}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-card p-10 rounded-3xl text-center border-dashed border-white/10">
                <Compass className="w-10 h-10 text-slate-500 mx-auto mb-4 animate-spin-slow" />
                <h3 className="text-md font-bold text-slate-300">Terminal Idle Mode</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">Initiate a coin analysis parameters in the control board to launch the real-time pipeline feed.</p>
              </div>
            )}

            {/* Rolling Logs History Feed */}
            <div className="glass-card p-8 rounded-3xl">
              <h2 className="text-sm font-extrabold tracking-wider uppercase mb-6 flex items-center gap-2 text-slate-300">
                <Clock className="w-4.5 h-4.5 text-blue-400" />
                Live Agent Action Feed
              </h2>

              {history.length === 0 ? (
                <div className="text-center py-12 bg-slate-950/45 border border-white/5 rounded-2xl">
                  <Bot className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-bold">No active signals in memory store.</p>
                  <p className="text-2xs text-slate-500 mt-1">Run an analysis above or trigger via Telegram.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((log) => (
                    <div key={log.id} className="bg-slate-950/50 hover:bg-slate-950/80 border border-white/5 p-4 rounded-2xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-md text-white tracking-tight">{log.asset}</span>
                          <span className={`text-2xs px-2.5 py-0.5 rounded-full font-black border ${log.sentiment === 'BULLISH' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20' : log.sentiment === 'BEARISH' ? 'bg-rose-950/50 text-rose-400 border-rose-500/20' : 'bg-yellow-950/50 text-yellow-500 border-yellow-500/20'}`}>
                            {log.sentiment}
                          </span>
                          <span className="text-2xs text-slate-400 font-mono font-bold">Score: {log.confidenceScore}%</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Direction: <span className="text-slate-200 font-bold">{log.tradeSetup?.direction}</span> | SL: <span className="text-rose-400 font-bold">{log.tradeSetup?.stopLoss}</span> | Target: <span className="text-emerald-400 font-bold">{log.tradeSetup?.takeProfit}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t border-white/5 pt-3 md:pt-0 md:border-0">
                        <span className="text-2xs font-mono text-slate-400 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        {log.execution?.executed ? (
                          <div className="flex items-center gap-1 text-2xs font-bold text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            FILLED
                          </div>
                        ) : (
                          <div className="text-2xs font-bold text-slate-400 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                            SKIPPED
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default App;