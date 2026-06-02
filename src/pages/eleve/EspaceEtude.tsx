import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Upload, Sparkles,
  CheckCircle2, XCircle, RotateCcw, Play, Pause, Square,
  ChevronRight, Award, Volume2, VolumeX, FileText,
  Brain, Headphones, ChevronDown, ChevronUp, Loader2,
  ClipboardPaste, Lightbulb, Target, File, X as XIcon,
  Camera, Image as ImageIcon, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { apiRequest } from '../../services/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface RevisionSection {
  title: string;
  points: string[];
}

interface StudyContent {
  ficheTitle: string;
  summary: string;
  sections: RevisionSection[];
  keyTerms: { term: string; definition: string }[];
  quiz: QuizQuestion[];
  podcastScript: string;
}

type Tab = 'input' | 'fiche' | 'quiz' | 'podcast';

// ─── Appel backend ────────────────────────────────────────────────────────────

async function generateFromBackend(courseText: string): Promise<StudyContent> {
  const response = await apiRequest<string>('/ai/study/generate', {
    method: 'POST',
    body: JSON.stringify({ courseText }),
  });

  // Le backend renvoie le JSON brut de Groq comme string dans data
  const raw = typeof response === 'string' ? response : JSON.stringify(response);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Réponse IA invalide. Réessaie.');
  const parsed = JSON.parse(jsonMatch[0]) as StudyContent;

  // Mélanger les options du quiz
  parsed.quiz = parsed.quiz.map(q => {
    const correct = q.options[q.correctIndex];
    const others = q.options.filter((_, i) => i !== q.correctIndex);
    const shuffled = [correct, ...others.sort(() => Math.random() - 0.5)];
    return { ...q, options: shuffled, correctIndex: 0 };
  });

  return parsed;
}

// ─── Lecture fichiers texte ───────────────────────────────────────────────────

async function readFileAsText(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt' || ext === 'md') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file, 'UTF-8');
    });
  }

  if (ext === 'pdf') {
    return new Promise((resolve, reject) => {
      const scriptId = 'pdfjs-cdn';
      const load = () => {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        if (!pdfjsLib) { reject(new Error('PDF.js non chargé')); return; }
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const reader = new FileReader();
        reader.onload = async e => {
          try {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              text += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            resolve(text);
          } catch { reject(new Error('Impossible de lire ce PDF.')); }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture.'));
        reader.readAsArrayBuffer(file);
      };
      if (document.getElementById(scriptId)) { load(); return; }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = load;
      script.onerror = () => reject(new Error('Impossible de charger PDF.js.'));
      document.head.appendChild(script);
    });
  }

  if (ext === 'docx') {
    return new Promise((resolve, reject) => {
      const scriptId = 'jszip-cdn';
      const load = () => {
        const JSZip = (window as any).JSZip;
        if (!JSZip) { reject(new Error('JSZip non chargé')); return; }
        const reader = new FileReader();
        reader.onload = async e => {
          try {
            const zip = await JSZip.loadAsync(e.target?.result as ArrayBuffer);
            const xmlFile = zip.file('word/document.xml');
            if (!xmlFile) throw new Error();
            const xml = await xmlFile.async('string');
            const text = xml
              .replace(/<w:br[^/]*/g, '\n').replace(/<w:p[ >]/g, '\n')
              .replace(/<[^>]+>/g, '')
              .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
              .replace(/\n{3,}/g, '\n\n').trim();
            resolve(text);
          } catch { reject(new Error('Impossible de lire ce fichier Word.')); }
        };
        reader.onerror = () => reject(new Error('Erreur de lecture.'));
        reader.readAsArrayBuffer(file);
      };
      if (document.getElementById(scriptId)) { load(); return; }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = load;
      script.onerror = () => reject(new Error('Impossible de charger JSZip.'));
      document.head.appendChild(script);
    });
  }

  throw new Error(`Format .${ext} non supporté. Utilise .txt, .pdf ou .docx`);
}

// ─── OCR image via Tesseract.js CDN ──────────────────────────────────────────

function loadTesseract(): Promise<any> {
  return new Promise((resolve, reject) => {
    if ((window as any).Tesseract) { resolve((window as any).Tesseract); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js';
    script.onload = () => resolve((window as any).Tesseract);
    script.onerror = () => reject(new Error('Impossible de charger Tesseract.js'));
    document.head.appendChild(script);
  });
}

async function extractTextFromImage(
  imageSource: File | Blob,
  onProgress?: (p: number) => void
): Promise<string> {
  const Tesseract = await loadTesseract();
  const worker = await Tesseract.createWorker(['fra', 'eng'], 1, {
    logger: (m: any) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round(m.progress * 100));
      }
    },
  });
  const { data: { text } } = await worker.recognize(imageSource);
  await worker.terminate();
  return text.trim();
}

// ─── Composant ───────────────────────────────────────────────────────────────

const EspaceEtude: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('input');
  const [courseText, setCourseText] = useState('');
  const [content, setContent] = useState<StudyContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [expandedTerm, setExpandedTerm] = useState<number | null>(null);

  // Fichier
  const [importedFileName, setImportedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // OCR
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);
  const [isOcring, setIsOcring] = useState(false);
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  // Caméra
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Podcast
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); stopCamera(); };
  }, []);

  // ── OCR ──────────────────────────────────────────────────────────────────
  const handleImageOcr = async (source: File | Blob, name?: string) => {
    setFileError(null);
    setIsOcring(true);
    setOcrProgress(0);
    setOcrPreview(URL.createObjectURL(source));
    try {
      const text = await extractTextFromImage(source, setOcrProgress);
      if (!text || text.length < 20) throw new Error('Texte trop court ou image illisible. Essaie avec une meilleure photo.');
      setCourseText(text);
      setImportedFileName(name || 'image_cahier.jpg');
    } catch (err: any) {
      setFileError(err.message);
    } finally {
      setIsOcring(false);
      setOcrProgress(null);
    }
  };

  // ── Caméra ────────────────────────────────────────────────────────────────
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
      }, 100);
    } catch {
      setFileError("Accès à la caméra refusé. Autorise-le dans les paramètres du navigateur.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    stopCamera();
    canvas.toBlob(blob => { if (blob) handleImageOcr(blob, 'photo_cahier.jpg'); }, 'image/jpeg', 0.95);
  };

  // ── Import fichier ────────────────────────────────────────────────────────
  const handleFileImport = async (file: File) => {
    setFileError(null);
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(ext || '')) {
      await handleImageOcr(file, file.name);
      return;
    }
    setIsReadingFile(true);
    try {
      const text = await readFileAsText(file);
      setCourseText(text);
      setImportedFileName(file.name);
      setOcrPreview(null);
    } catch (err: any) {
      setFileError(err.message);
    } finally {
      setIsReadingFile(false);
    }
  };

  // ── Génération ────────────────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!courseText.trim() || courseText.trim().length < 50) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const generated = await generateFromBackend(courseText);
      setContent(generated);
      setActiveTab('fiche');
      setCurrentQuestion(0); setSelectedAnswer(null);
      setShowExplanation(false); setScore(0); setQuizFinished(false);
      synthRef.current?.cancel(); setIsPlaying(false);
    } catch (err: any) {
      setGenerateError(err.message || 'Erreur de génération. Réessaie.');
    } finally {
      setIsGenerating(false);
    }
  }, [courseText]);

  // ── Quiz ──────────────────────────────────────────────────────────────────
  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || !content) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    if (idx === content.quiz[currentQuestion].correctIndex) setScore(s => s + 1);
  };

  const handleNextQuestion = () => {
    if (!content) return;
    if (currentQuestion + 1 >= content.quiz.length) setQuizFinished(true);
    else { setCurrentQuestion(q => q + 1); setSelectedAnswer(null); setShowExplanation(false); }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0); setSelectedAnswer(null);
    setShowExplanation(false); setScore(0); setQuizFinished(false);
  };

  // ── Podcast ───────────────────────────────────────────────────────────────
  const handlePlay = () => {
    if (!content || !synthRef.current) return;
    if (isPlaying) { synthRef.current.pause(); setIsPlaying(false); return; }
    if (synthRef.current.paused) { synthRef.current.resume(); setIsPlaying(true); return; }
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(content.podcastScript);
    utt.lang = 'fr-FR'; utt.rate = speechRate; utt.volume = isMuted ? 0 : 1;
    utt.onend = () => setIsPlaying(false);
    utt.onerror = () => setIsPlaying(false);
    utteranceRef.current = utt;
    synthRef.current.speak(utt);
    setIsPlaying(true);
  };

  const handleStop = () => { synthRef.current?.cancel(); setIsPlaying(false); };
  const toggleMute = () => { setIsMuted(m => !m); if (utteranceRef.current) utteranceRef.current.volume = isMuted ? 1 : 0; };
  const changeRate = (rate: number) => { setSpeechRate(rate); if (isPlaying) handleStop(); };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'input',   label: 'Mon cours', icon: <ClipboardPaste size={15} /> },
    { id: 'fiche',   label: 'Fiche',     icon: <FileText size={15} /> },
    { id: 'quiz',    label: 'Quiz',      icon: <Brain size={15} /> },
    { id: 'podcast', label: 'Podcast',   icon: <Headphones size={15} /> },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">

      {/* Caméra plein écran */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col">
            <div className="flex items-center justify-between p-4">
              <button onClick={stopCamera} className="text-white p-2 rounded-full hover:bg-white/10"><XIcon size={24} /></button>
              <span className="text-white font-black text-sm">Photo du cahier</span>
              <div className="w-10" />
            </div>
            <video ref={videoRef} className="flex-1 object-contain w-full" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="p-8 flex justify-center">
              <button onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 shadow-2xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
                <Camera size={32} className="text-gray-800" />
              </button>
            </div>
            <p className="text-center text-white/60 text-xs pb-4 font-medium">Assure-toi que l'écriture est bien visible et nette</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-white/5 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full text-gray-500 transition-colors">
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-500" size={22} />
            <h1 className="text-lg font-black text-gray-900 dark:text-white">Espace Étude IA</h1>
          </div>
          <div className="w-9" />
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto px-4 flex overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.id}
              onClick={() => (content || tab.id === 'input') && setActiveTab(tab.id)}
              disabled={tab.id !== 'input' && !content}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-violet-500 text-violet-600 dark:text-violet-400'
                  : !content && tab.id !== 'input'
                  ? 'border-transparent text-gray-300 dark:text-gray-600 cursor-not-allowed'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">

          {/* ── INPUT ──────────────────────────────────────────────────── */}
          {activeTab === 'input' && (
            <motion.div key="input" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>

              <div className="text-center mb-7">
                <div className="w-14 h-14 bg-violet-100 dark:bg-violet-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Sparkles size={28} className="text-violet-500" />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-1">Transforme ton cours en outils de révision</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Colle ton cours, importe un fichier ou prends en photo ton cahier.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { icon: <FileText size={18} />, label: 'Fiche de révision', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                  { icon: <Brain size={18} />, label: 'Quiz interactif', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
                  { icon: <Headphones size={18} />, label: 'Podcast audio', color: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                ].map((f, i) => (
                  <div key={i} className={`${f.color} rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center`}>
                    {f.icon}
                    <span className="text-xs font-black leading-tight">{f.label}</span>
                  </div>
                ))}
              </div>

              {/* Inputs cachés */}
              <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.docx" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); e.target.value = ''; }} />
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileImport(f); e.target.value = ''; }} />

              {/* Boutons import */}
              <div className="flex gap-2 mb-3 flex-wrap">
                <button onClick={() => fileInputRef.current?.click()} disabled={isReadingFile || isOcring}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 text-sm font-bold text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50">
                  {isReadingFile ? <Loader2 size={15} className="animate-spin text-violet-500" /> : <Upload size={15} className="text-violet-500" />}
                  {isReadingFile ? 'Lecture…' : 'Fichier (.txt, .pdf, .docx)'}
                </button>
                <button onClick={() => imageInputRef.current?.click()} disabled={isOcring}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-sm font-bold text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50">
                  <ImageIcon size={15} className="text-emerald-500" /> Photo / Image
                </button>
                <button onClick={openCamera} disabled={isOcring}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-sm font-bold text-gray-600 dark:text-gray-300 transition-all disabled:opacity-50">
                  <Camera size={15} className="text-orange-500" /> Caméra
                </button>
              </div>

              {/* OCR progress */}
              {isOcring && (
                <div className="mb-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-200 dark:border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Loader2 size={16} className="animate-spin text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                      Lecture de l'image… {ocrProgress !== null ? `${ocrProgress}%` : ''}
                    </span>
                  </div>
                  {ocrProgress !== null && (
                    <div className="h-1.5 bg-emerald-200 dark:bg-emerald-700 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-emerald-500 rounded-full" animate={{ width: `${ocrProgress}%` }} />
                    </div>
                  )}
                  {ocrPreview && <img src={ocrPreview} alt="aperçu" className="mt-3 max-h-24 rounded-xl object-contain mx-auto" />}
                </div>
              )}

              {/* Fichier importé */}
              {importedFileName && !isOcring && (
                <div className="flex items-center gap-2 mb-3 px-4 py-2.5 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-200 dark:border-violet-500/30">
                  <File size={14} className="text-violet-500 shrink-0" />
                  <span className="text-sm font-bold text-violet-700 dark:text-violet-400 flex-1 truncate">{importedFileName}</span>
                  <button onClick={() => { setCourseText(''); setImportedFileName(null); setOcrPreview(null); }} className="text-violet-400 hover:text-violet-600"><XIcon size={14} /></button>
                </div>
              )}

              {fileError && (
                <div className="flex gap-2 items-start mb-3 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold">{fileError}</p>
                </div>
              )}

              {/* Zone texte avec drag & drop */}
              <div className={`relative mb-4 rounded-2xl ${isDragging ? 'ring-2 ring-violet-400' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFileImport(f); }}>
                <textarea
                  value={courseText}
                  onChange={e => { setCourseText(e.target.value); setImportedFileName(null); }}
                  placeholder="Colle ici le texte de ton cours, ou glisse-dépose un fichier / une image…"
                  className="w-full h-48 p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm font-medium resize-none focus:outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
                {isDragging && (
                  <div className="absolute inset-0 rounded-2xl bg-violet-500/10 border-2 border-violet-400 flex items-center justify-center pointer-events-none">
                    <p className="text-violet-600 dark:text-violet-400 font-black text-sm flex items-center gap-2"><Upload size={18} /> Dépose ici</p>
                  </div>
                )}
                <div className="absolute bottom-3 right-4 text-xs text-gray-400 font-medium">{courseText.length} car.</div>
              </div>

              {courseText.length > 0 && courseText.length < 50 && (
                <p className="text-xs text-amber-500 font-bold mb-4 flex items-center gap-1">
                  <Lightbulb size={13} /> Ajoute plus de texte (minimum 50 caractères)
                </p>
              )}

              {generateError && (
                <div className="flex gap-2 items-start mb-4 p-3 bg-red-50 dark:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/30">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 dark:text-red-400 font-bold">{generateError}</p>
                </div>
              )}

              <Button onClick={handleGenerate}
                disabled={courseText.trim().length < 50 || isGenerating}
                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isGenerating
                  ? <><Loader2 size={20} className="animate-spin" /> L'IA génère tes outils…</>
                  : <><Sparkles size={20} /> Générer mes outils de révision</>}
              </Button>
            </motion.div>
          )}

          {/* ── FICHE ──────────────────────────────────────────────────── */}
          {activeTab === 'fiche' && content && (
            <motion.div key="fiche" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }} className="space-y-5">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/25">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="opacity-80" />
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Fiche de révision</span>
                </div>
                <h2 className="text-xl font-black leading-tight mb-3">{content.ficheTitle}</h2>
                <p className="text-sm font-medium opacity-90 leading-relaxed">{content.summary}</p>
              </div>

              {content.sections.map((sec, i) => (
                <div key={i} className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm shrink-0">{i + 1}</div>
                    <h3 className="font-black text-gray-900 dark:text-white">{sec.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {sec.points.map((point, j) => (
                      <li key={j} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        <ChevronRight size={14} className="shrink-0 mt-0.5 text-blue-400" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {content.keyTerms.length > 0 && (
                <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={17} className="text-amber-500" />
                    <h3 className="font-black text-gray-900 dark:text-white">Mots clés à retenir</h3>
                  </div>
                  <div className="space-y-2">
                    {content.keyTerms.map((kt, i) => (
                      <div key={i}>
                        <button onClick={() => setExpandedTerm(expandedTerm === i ? null : i)}
                          className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors">
                          <span className="font-black text-sm text-amber-700 dark:text-amber-400">{kt.term}</span>
                          {expandedTerm === i ? <ChevronUp size={14} className="text-amber-500" /> : <ChevronDown size={14} className="text-amber-500" />}
                        </button>
                        <AnimatePresence>
                          {expandedTerm === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <p className="px-3 pt-2 pb-3 text-sm text-gray-600 dark:text-gray-400 font-medium bg-amber-50/50 dark:bg-amber-500/5 rounded-b-xl">{kt.definition}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => setActiveTab('quiz')} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <Brain size={15} /> Quiz
                </Button>
                <Button onClick={() => setActiveTab('podcast')} className="flex-1 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <Headphones size={15} /> Podcast
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── QUIZ ───────────────────────────────────────────────────── */}
          {activeTab === 'quiz' && content && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
              {quizFinished ? (
                <div className="text-center py-8">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${score >= content.quiz.length * 0.7 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-500'}`}>
                    <Award size={48} />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{score} / {content.quiz.length}</h2>
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
                    {score === content.quiz.length ? '🎉 Parfait ! Tu maîtrises le cours !' : score >= content.quiz.length * 0.7 ? '👍 Bien joué ! Relis les points manqués.' : '📚 Relis ta fiche et réessaie !'}
                  </p>
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <Button onClick={resetQuiz} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <RotateCcw size={15} /> Recommencer
                    </Button>
                    <Button onClick={() => setActiveTab('fiche')} variant="outline" className="w-full h-12 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      <FileText size={15} /> Revoir la fiche
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Question {currentQuestion + 1} / {content.quiz.length}</span>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">Score : {score}</span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div className="h-full bg-violet-500 rounded-full" animate={{ width: `${(currentQuestion / content.quiz.length) * 100}%` }} transition={{ duration: 0.4 }} />
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800/60 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm mb-4">
                    <p className="font-black text-gray-900 dark:text-white leading-relaxed">{content.quiz[currentQuestion].question}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    {content.quiz[currentQuestion].options.map((option, idx) => {
                      const isCorrect = idx === content.quiz[currentQuestion].correctIndex;
                      const isSelected = idx === selectedAnswer;
                      let style = 'bg-white dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-violet-400';
                      if (selectedAnswer !== null) {
                        if (isCorrect) style = 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-400 text-emerald-800 dark:text-emerald-200';
                        else if (isSelected) style = 'bg-red-50 dark:bg-red-500/10 border-red-400 text-red-800 dark:text-red-200';
                        else style = 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500';
                      }
                      return (
                        <button key={idx} onClick={() => handleAnswer(idx)} disabled={selectedAnswer !== null}
                          className={`w-full text-left p-4 rounded-2xl border-2 font-medium text-sm transition-all flex items-center gap-3 ${style}`}>
                          <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center shrink-0 text-xs font-black">
                            {selectedAnswer !== null ? (isCorrect ? <CheckCircle2 size={13} /> : isSelected ? <XCircle size={13} /> : String.fromCharCode(65 + idx)) : String.fromCharCode(65 + idx)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-4">
                        <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-4">
                          <p className="text-sm font-bold text-blue-700 dark:text-blue-400 flex gap-2">
                            <Lightbulb size={15} className="shrink-0 mt-0.5" />
                            {content.quiz[currentQuestion].explanation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {selectedAnswer !== null && (
                    <Button onClick={handleNextQuestion} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      {currentQuestion + 1 >= content.quiz.length ? 'Voir les résultats' : 'Question suivante'} <ChevronRight size={15} />
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ── PODCAST ────────────────────────────────────────────────── */}
          {activeTab === 'podcast' && content && (
            <motion.div key="podcast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.2 }}>
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-purple-500/25 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Headphones size={16} className="opacity-80" />
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-80">Podcast de révision</span>
                </div>
                <h2 className="text-lg font-black mb-1">{content.ficheTitle}</h2>
                <p className="text-sm opacity-75 mb-7 font-medium">Résumé audio généré par l'IA</p>
                <div className="flex items-center justify-center gap-1 h-10 mb-7">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <motion.div key={i} className="w-1 bg-white/60 rounded-full"
                      animate={isPlaying ? { height: [6, Math.random() * 28 + 6, 6] } : { height: 6 }}
                      transition={isPlaying ? { duration: 0.5 + Math.random() * 0.4, repeat: Infinity, delay: i * 0.04 } : {}} />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                    {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <button onClick={handlePlay} className="w-16 h-16 rounded-full bg-white text-purple-600 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform">
                    {isPlaying ? <Pause size={26} /> : <Play size={26} className="ml-1" />}
                  </button>
                  <button onClick={handleStop} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <Square size={17} />
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5 mb-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Vitesse</p>
                <div className="flex gap-2">
                  {[0.75, 1, 1.25, 1.5].map(rate => (
                    <button key={rate} onClick={() => changeRate(rate)}
                      className={`flex-1 py-2 rounded-xl text-sm font-black transition-colors ${speechRate === rate ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-1">
                  <FileText size={12} /> Script
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{content.podcastScript}</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default EspaceEtude;
