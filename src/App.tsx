/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, ChangeEvent } from 'react';
import { 
  ShieldAlert, 
  Search, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Scale, 
  Loader2,
  ChevronRight,
  Gavel,
  History,
  Upload,
  FileUp,
  X,
  FileCode,
  Download,
  Bell,
  Globe,
  TrendingDown,
  TrendingUp,
  Building2,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeTenderDocument, AuditResponse, AnalysisResult } from './services/geminiService';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  risk: string;
  result: AuditResponse;
}

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      const data = await analyzeTenderDocument(inputText);
      setResult(data);
      
      // Save to history
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        title: fileName || (inputText.substring(0, 30) + "..."),
        date: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        risk: data.findings.length > 0 ? (data.findings.some(f => f.riskLevel === 'Yuqori') ? 'Yuqori' : 'O\'rta') : 'Past',
        result: data
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tahlil jarayonida noma'lum xatolik yuz berdi");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsAnalyzing(true);

    try {
      let extractedText = '';

      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        extractedText = fullText;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      } else {
        extractedText = await file.text();
      }

      if (!extractedText.trim()) {
        throw new Error("Hujjatdan matn ajratib olib bo'lmadi yoki hujjat bo'sh.");
      }

      setInputText(extractedText);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faylni o'qishda xatolik yuz berdi");
      setFileName(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setResult(null);
    setInputText('');
    setFileName(null);
    setError(null);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setFileName(item.title);
  };

  const organizations = [
    { name: "gov.uz", url: "https://gov.uz" },
    { name: "Lex.uz", url: "https://lex.uz" },
    { name: "Anticorruption.uz", url: "https://anticorruption.uz" },
    { name: "Darakchi", url: "https://darakchi.uz" }
  ];

  return (
    <div className="h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden flex flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-slate-900 text-white flex items-center justify-between px-8 shrink-0 shadow-lg z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-lg italic shadow-lg shadow-red-900/20">A</div>
          <span className="text-xl font-bold tracking-tight uppercase">AUDITOR PRO <span className="text-slate-400 font-normal">| Nazorat</span></span>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5 text-slate-300" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-900"></div>
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 z-50"
                >
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-sm tracking-tight">Bildirishnomalar</span>
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest cursor-pointer">Hammasini o'chirish</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer block">
                      <div className="text-xs font-bold text-red-600 mb-1">YUQORI XAVF</div>
                      <p className="text-xs text-slate-600 leading-snug">Tender #4492-UZ hujjatida 45% narx tafovuti aniqlandi.</p>
                      <span className="text-[9px] text-slate-400 mt-2 block font-mono">2 daqiqa oldin</span>
                    </div>
                    <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer block">
                      <div className="text-xs font-bold text-blue-600 mb-1">TIZIM TAHLILI</div>
                      <p className="text-xs text-slate-600 leading-snug">Lex.uz LoRA bazasi muvaffaqiyatli yangilandi.</p>
                      <span className="text-[9px] text-slate-400 mt-2 block font-mono">1 soat oldin</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-8 w-[1px] bg-slate-700 mx-2"></div>
          
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-bold text-white tracking-tight">{process.env.USER_EMAIL || "Foydalanuvchi"}</span>
            <span className="text-[9px] text-green-400 uppercase font-black tracking-widest">Tizim Faol</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-6">
            <button 
              onClick={reset}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg shadow-red-600/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
            >
              <FileUp className="w-5 h-5" />
              <span>Yangi Tahlil</span>
            </button>
          </div>
          
          <div className="flex-1 px-4 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 mb-3">Oxirgi Tahlillar</div>
            
            <AnimatePresence>
              {history.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => loadFromHistory(item)}
                  className={`p-3 rounded-xl border-l-4 cursor-pointer transition-all mb-2 hover:bg-slate-50 ${
                    result && result.summary === item.result.summary 
                    ? "bg-slate-100 border-red-600 shadow-sm" 
                    : "bg-white border-transparent"
                  }`}
                >
                  <div className="text-sm font-semibold truncate italic text-slate-800">{item.title}</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>{item.date}</span>
                    <span className={item.risk === 'Yuqori' ? 'text-red-500 font-bold' : 'text-amber-500 font-bold'}>
                      {item.risk} xavf
                    </span>
                  </div>
                </motion.div>
              ))}
              {history.length === 0 && (
                <div className="px-2 py-4 text-xs text-slate-400 italic">Hali tahlillar mavjud emas</div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 border-t border-slate-100">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Qonuniy Asos</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-tight font-medium">
                "Davlat xaridlari to'g'risida"gi Qonun (O'RQ-684) va narxlar tahlili metodologiyasi.
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {!result && !isAnalyzing ? (
              <div className="p-8 max-w-4xl mx-auto space-y-8">
                <div className="space-y-2">
                  <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Professional Audit Nazorati</h1>
                  <p className="text-slate-500 text-lg">Hujjatlarni korrupsion xavflar va narxlar tafovuti uchun tahlil qiling.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Upload Card */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-red-400 hover:bg-red-50/30 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-800">Fayl yuklash</h3>
                      <p className="text-sm text-slate-500 mt-1">PDF, DOCX yoki TXT formats</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Manual Paste Card */}
                  <div className="bg-slate-900 rounded-3xl p-10 text-white flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Matnni ulashish</h3>
                      <p className="text-slate-400 text-sm mt-1">Hujjat matnidan parchani to'g'ridan-to'g'ri nusxalab joylang.</p>
                    </div>
                    <div className="mt-8 flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest">
                      <span>Pastga yozing</span>
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {fileName ? `Yuklangan: ${fileName}` : "Hujjat matni"}
                      </span>
                    </div>
                    {fileName && (
                      <button onClick={reset} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    className="w-full h-80 p-6 text-slate-800 resize-none outline-none font-mono text-sm leading-relaxed placeholder:font-sans placeholder:italic"
                    placeholder="Tender hujjatidan olingan matnni bu yerga joylashtiring..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={handleAnalyze}
                      disabled={!inputText.trim()}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                    >
                      <Search className="w-5 h-5" />
                      Tahlilni Boshlash
                    </button>
                  </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="h-full flex items-center justify-center p-8">
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <Loader2 className="w-20 h-20 text-red-600 animate-spin mx-auto" />
                    <ShieldAlert className="w-8 h-8 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Audit Tahlili...</h2>
                    <p className="text-slate-500 max-w-sm mx-auto font-medium">
                      O'RQ-684 qonun talablari va jahon bozoridagi narxlar tafovuti tahlil qilinmoqda.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 space-y-10 max-w-5xl mx-auto">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
                  <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Tahlil Xulosasi</h1>
                    <p className="text-slate-500 mt-2 font-medium flex items-center gap-2 italic">
                      <FileText className="w-4 h-4" />
                      {fileName || "Joylashtirilgan matn"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className={`px-6 py-2 border-2 rounded-full text-sm font-black uppercase tracking-widest shadow-sm ${
                      result?.findings.some(f => f.riskLevel === 'Yuqori')
                      ? "bg-red-50 text-red-700 border-red-600"
                      : "bg-amber-50 text-amber-700 border-amber-500"
                    }`}>
                      Xavf: {result?.findings.some(f => f.riskLevel === 'Yuqori') ? 'YUQORI' : 'O\'RTA'}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest">LOYIHA ID: #AF-{Math.floor(10000 + Math.random() * 90000)}</span>
                  </div>
                </div>

                {/* Summary Section */}
                <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                  <div className="absolute right-0 top-0 h-full w-48 bg-red-600/10 transform skew-x-12 translate-x-20"></div>
                  <div className="flex gap-6 items-start relative z-10">
                    <div className="bg-red-600 p-4 rounded-2xl shadow-lg shadow-red-900/40">
                      <Gavel className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-red-400 text-xs font-black uppercase tracking-[0.3em]">Auditor Bayonoti</h3>
                      <p className="text-xl font-medium leading-relaxed italic text-slate-100">
                         {result?.summary}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Findings Grid */}
                <div className="grid gap-8">
                  {result?.findings.map((finding, idx) => (
                    <SleekFindingCard key={idx} finding={finding} index={idx} />
                  ))}
                </div>

                {/* Final Footer Stats */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200 pt-8 mt-12 pb-10">
                  <div className="flex space-x-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-600"></div> Qonuniy Moslik: {result?.findings.length === 0 ? "100%" : "32%"}</div>
                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Narxlar adolatli: {result?.findings.some(f => f.priceAnalysis && f.priceAnalysis.differencePercent > 20) ? "KAM" : "O'RTA"}</div>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                       <Download className="w-4 h-4" /> PDF Yuklash
                    </button>
                    <button 
                      onClick={reset}
                      className="px-6 py-3 bg-red-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95"
                    >
                      Yangi Tekshiruv
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Logos */}
          <footer className="shrink-0 bg-slate-50 border-t border-slate-200 px-8 py-4 flex items-center justify-between overflow-x-auto whitespace-nowrap">
             <div className="flex items-center gap-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {organizations.map((org, i) => (
                  <a key={i} href={org.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 group">
                    <Building2 className="w-5 h-5 text-slate-400 group-hover:text-red-600 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900 transition-colors">{org.name}</span>
                  </a>
                ))}
             </div>
             <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-4">
                Anti-Corruption Audit Platform &copy; 2026
             </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function SleekFindingCard({ finding, index }: { finding: AnalysisResult, index: number }) {
  const isHigh = finding.riskLevel === "Yuqori";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row group"
    >
      <div className={`w-full md:w-2 shrink-0 ${isHigh ? 'bg-red-600' : 'bg-amber-500'}`}></div>
      
      <div className="flex-1 p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isHigh ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="font-black italic text-slate-800 uppercase tracking-tight text-lg">Hujjatdagi Shubhali Band</h3>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border ${
            isHigh ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
             Risk: {finding.riskLevel}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
              <Scale className="w-4 h-4 text-red-600" />
              <span className="font-black uppercase tracking-widest text-[10px]">Lex.uz Qonuniy Asos</span>
            </div>
            <div className="bg-red-50/50 p-4 rounded-xl border border-red-100 flex items-center gap-3">
              <div className="text-red-600 font-bold font-mono text-xs italic">
                {finding.lexReference}
              </div>
              <div className="h-4 w-[1px] bg-red-200"></div>
              <a href={`https://lex.uz/search/nat?query=${encodeURIComponent(finding.lexReference)}`} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Lex.uz dan ko'rish
              </a>
            </div>
          </div>

          {finding.priceAnalysis && (
            <div className="lg:col-span-12 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 border-b border-slate-100 pb-2">
                <Globe className="w-4 h-4 text-blue-600" />
                <span className="font-black uppercase tracking-widest text-[10px]">Narxlar Tafovuti Tahlili</span>
              </div>
              <div className={`p-6 rounded-2xl border flex flex-col md:flex-row gap-6 relative overflow-hidden ${
                finding.priceAnalysis.differencePercent > 20 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}>
                {finding.priceAnalysis.differencePercent > 20 && (
                  <div className="absolute top-0 right-0 p-2 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest">
                    DIQQAT: KATTA TAFOVUT
                  </div>
                )}
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center shadow-sm"><Info className="w-3 h-3 text-slate-400" /></div>
                    <span className="text-xs font-bold text-slate-700">{finding.priceAnalysis.item}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Global O'rtacha</span>
                      <div className="text-sm font-black text-blue-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> {finding.priceAnalysis.globalPrice}</div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Hujjatdagi Narx</span>
                      <div className={`text-sm font-black flex items-center gap-1 ${finding.priceAnalysis.differencePercent > 20 ? 'text-red-600' : 'text-slate-900'}`}>
                        <TrendingUp className="w-3 h-3" /> {finding.priceAnalysis.uzbekPrice}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center border-l-2 border-dashed border-slate-200 pl-6">
                   <div className="text-center">
                      <div className={`text-3xl font-black italic tracking-tighter ${finding.priceAnalysis.differencePercent > 20 ? 'text-red-600' : 'text-slate-400'}`}>
                        +{finding.priceAnalysis.differencePercent}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tafovut</div>
                   </div>
                </div>
              </div>
              {finding.priceAnalysis.warning && (
                <div className="bg-red-50 text-red-700 text-xs font-bold p-3 rounded-lg border border-red-100 italic">
                  &bull; {finding.priceAnalysis.warning}
                </div>
              )}
            </div>
          )}

          <div className="lg:col-span-5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Asl Matn</label>
            <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-slate-300 italic text-slate-700 font-serif text-base leading-relaxed relative">
               <div className="absolute -top-3 -left-1 text-slate-200"><FileText className="w-10 h-10 opacity-50" /></div>
               "{finding.suspiciousClause}"
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><Info className="w-4 h-4 text-blue-600" /></div>
                <span className="font-black uppercase tracking-widest text-xs">Auditor Tahlili</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed font-medium pl-10 border-l-2 border-slate-100">
                {finding.analysis}
              </p>
            </div>

            <div className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 text-white">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/40"><CheckCircle2 className="w-4 h-4" /></div>
                <span className="font-black uppercase tracking-widest text-xs tracking-widest">Tavsiya va Chora</span>
              </div>
              <p className="text-slate-300 text-sm font-bold leading-relaxed pl-10 italic">
                {finding.recommendation}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

