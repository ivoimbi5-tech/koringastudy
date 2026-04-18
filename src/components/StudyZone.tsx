import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { ai, MODELS, SYSTEM_PROMPTS } from "../lib/gemini";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  increment
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  Brain, 
  Sparkles, 
  X,
  Volume2,
  VolumeX,
  FileCheck,
  CheckCircle2,
  ListTodo,
  Layers,
  ArrowRight,
  Send,
  Loader2,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const LOFI_TRACKS = [
  { name: "Coffee Shop Lofi", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { name: "Rainy Night", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { name: "Deep Focus", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { name: "Forest Ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
];

interface Subject {
  id: string;
  name: string;
  themes: string[];
}

interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export function StudyZone() {
  const { profile, updateProfile, user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [manualThemeInput, setManualThemeInput] = useState("");
  const [isMusicOn, setIsMusicOn] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(LOFI_TRACKS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [sessionResults, setSessionResults] = useState<{ summary: string; tasks: string[]; cards: {q: string, a: string}[] } | null>(null);
  
  // Chat States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "subjects"));
    return onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject));
      setSubjects(fetched);
    });
  }, [user]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleFinishSession();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleStartSession = async () => {
    const theme = selectedTheme === "manual" ? manualThemeInput : selectedTheme;
    if (!theme) return;
    
    setIsGenerating(true);
    setSessionStarted(true);

    try {
      const response = await ai.models.generateContent({
        model: MODELS.MENTOR,
        contents: [{ role: "user", parts: [{ text: `Vou estudar sobre: ${theme} (Disciplina: ${selectedSubject?.name}). Nível Acadêmico: ${profile?.academicLevel}. Gere um conteúdo de estudo profundo e didático em Markdown. 
        MUITO IMPORTANTE: Use LaTeX para TODAS as fórmulas, símbolos matemáticos ou científicos (Ex: usar $x^2$ para inline ou $$E=mc^2$$ para blocos). Não use blocos de código genericamente para fórmulas.
        Facilite a leitura com tópicos e negrito. Inclua exemplos práticos e 2 exercícios desafiadores.` }] }],
        config: { systemInstruction: SYSTEM_PROMPTS.MIR_KORINGA }
      });
      setContent(response.text || null);
      
      setChatMessages([
        { role: "model", content: `Olá, ${profile?.fullName.split(' ')[0] || 'Estudante'}! Sou Mir Koringa. Iniciamos nossa imersão em **${theme}**. Já preparei seu material principal. Tecla comigo se tiver qualquer dúvida durante o foco!` }
      ]);

      setIsActive(true);
      if (!isMusicOn) toggleMusic();
    } catch (e) {
      console.error(e);
      setContent("Conexão interrompida... Mas mantenha o foco!");
      setIsActive(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiTyping) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsAiTyping(true);

    try {
      const theme = selectedTheme === "manual" ? manualThemeInput : selectedTheme;
      const resp = await ai.models.generateContent({
        model: MODELS.MENTOR,
        contents: [
          ...chatMessages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          { role: "user", parts: [{ text: userMsg }] }
        ],
        config: { systemInstruction: `${SYSTEM_PROMPTS.MIR_KORINGA}. Estamos estudando ${theme} de ${selectedSubject?.name}. Responda dúvidas específicas do aluno. Use LaTeX para fórmulas se necessário.` }
      });
      setChatMessages(prev => [...prev, { role: "model", content: resp.text }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleFinishSession = async () => {
    setIsActive(false);
    if (audioRef.current) audioRef.current.pause();
    setIsMusicOn(false);
    setIsFinishing(true);

    try {
      const theme = selectedTheme === "manual" ? manualThemeInput : selectedTheme;
      const response = await ai.models.generateContent({
        model: MODELS.MENTOR,
        contents: [{ role: "user", parts: [{ text: `Acabamos o estudo de ${theme}. Gere: 1. Resumo final condensado. 2. 2 tarefas (title). 3. 3 Flashcards (q, a). Responda JSON: { "summary": "...", "tasks": ["...", "..."], "cards": [{"q": "...", "a": "..."}, ...] }` }] }],
        config: { systemInstruction: SYSTEM_PROMPTS.MIR_KORINGA, responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || "{}");
      setSessionResults(result);

      if (user) {
        for (const card of result.cards || []) {
           await addDoc(collection(db, "users", user.uid, "cards"), {
             question: card.q,
             answer: card.a,
             interval: 0,
             subject: selectedSubject?.name,
             createdAt: serverTimestamp()
           });
        }
        for (const task of result.tasks || []) {
           await addDoc(collection(db, "users", user.uid, "tasks"), {
             title: task,
             completed: false,
             createdAt: serverTimestamp()
           });
        }
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(250),
          totalStudyMinutes: increment(25),
          streak: increment(1),
          lastStudyDate: new Date().toISOString()
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFinishing(false);
    }
  };

  const resetSession = () => {
    setSessionStarted(false);
    setIsActive(false);
    setTimeLeft(25 * 60);
    setSelectedTheme("");
    setContent(null);
    setSessionResults(null);
  };

  const toggleMusic = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(selectedTrack.url);
      audioRef.current.loop = true;
    }
    
    if (isMusicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsMusicOn(!isMusicOn);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (sessionResults) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-500 rounded-[24px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Sessão Concluída!</h1>
          <p className="text-slate-500 font-medium">Você ganhou <span className="text-koringa font-black">+250 XP</span>. Veja o que preparamos:</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           <div className="sleek-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 text-mir font-black uppercase text-[10px] tracking-widest"><FileCheck className="w-4 h-4" /> Resumo Final</div>
              <p className="text-sm font-medium leading-relaxed text-slate-600 truncate-3-lines">{sessionResults.summary}</p>
           </div>
           <div className="sleek-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest"><ListTodo className="w-4 h-4" /> {sessionResults.tasks.length} Tarefas</div>
              <p className="text-sm font-bold text-slate-600">Enviadas para sua lista automágicamente.</p>
           </div>
           <div className="sleek-card p-6 bg-white space-y-4">
              <div className="flex items-center gap-2 text-rose-500 font-black uppercase text-[10px] tracking-widest"><Layers className="w-4 h-4" /> {sessionResults.cards.length} Cards</div>
              <p className="text-sm font-bold text-slate-600">Novos flashcards prontos para revisão.</p>
           </div>
        </div>

        <button 
          onClick={resetSession}
          className="w-full btn-primary py-5 text-xl flex items-center justify-center gap-4"
        >
          Retornar ao Dashboard <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-8">
      {!sessionStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in scale-in duration-700">
          <div className="w-20 h-20 koringa-gradient rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-koringa/20">
            <Brain className="w-10 h-10" />
          </div>
          <div className="space-y-3 max-w-lg">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mir Koringa</h1>
            <p className="text-slate-500 font-medium">Santuário de foco absoluto. Selecione seu campo de batalha.</p>
          </div>
          
          <div className="w-full max-w-xl space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <select 
                value={selectedSubject?.id || ""}
                onChange={(e) => {
                  const s = subjects.find(s => s.id === e.target.value);
                  setSelectedSubject(s || null);
                  setSelectedTheme("");
                }}
                className="w-full border border-slate-200 p-5 rounded-2xl font-bold bg-white focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all shadow-sm outline-none text-center appearance-none"
              >
                <option value="">Selecione a Disciplina</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <select 
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                disabled={!selectedSubject}
                className="w-full border border-slate-200 p-5 rounded-2xl font-bold bg-white focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all shadow-sm outline-none text-center appearance-none disabled:opacity-50"
              >
                <option value="">Selecione o Tema</option>
                {selectedSubject?.themes.map(t => <option key={t} value={t}>{t}</option>)}
                {selectedSubject && <option value="manual">+ Digitar Tema Manual...</option>}
              </select>
            </div>

            {selectedTheme === "manual" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <input 
                  type="text"
                  value={manualThemeInput}
                  onChange={(e) => setManualThemeInput(e.target.value)}
                  placeholder="Sobre o que vamos estudar hoje?"
                  className="w-full border border-slate-200 p-5 rounded-2xl font-bold bg-white focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all shadow-sm outline-none text-center"
                />
              </motion.div>
            )}
          </div>

          <div className="w-full max-w-md">
            <button 
              onClick={handleStartSession}
              disabled={(!selectedTheme || (selectedTheme === "manual" && !manualThemeInput)) || isGenerating}
              className="w-full bg-slate-900 text-white p-6 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 shadow-xl shadow-slate-900/10"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Play className="w-6 h-6 fill-current" />}
              {isGenerating ? "Invocando Mentor..." : "Iniciar Sessão Imersiva"}
            </button>
            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Música e Timer Automáticos</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid md:grid-cols-12 gap-5 h-[calc(100vh-140px)] max-w-5xl mx-auto w-full">
          {/* Main Focus Area (Material + Chat) */}
          <div className="md:col-span-7 flex flex-col gap-5 overflow-hidden">
            <div className="sleek-card bg-white flex-1 flex flex-col overflow-hidden relative">
              <AnimatePresence>
                {(isGenerating || isFinishing) && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-6"
                  >
                    <div className="w-20 h-20 bg-mir/10 rounded-3xl flex items-center justify-center relative">
                       <Sparkles className="w-10 h-10 text-mir animate-spin" />
                    </div>
                    <div className="text-center space-y-2">
                       <p className="font-black text-slate-900 uppercase text-xs tracking-widest">{isFinishing ? "Consolidando Conhecimento..." : "Sintonizando Frequência..."}</p>
                       <p className="text-slate-400 text-sm font-medium">{isFinishing ? "O Mir está criando seus cards e tarefas." : "O Mentor está preparando seus recursos."}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-5 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-mir/10 rounded-lg flex items-center justify-center text-mir">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 truncate max-w-[200px] md:max-w-md">
                    Estudando: <span className="text-mir">{selectedTheme === "manual" ? manualThemeInput : selectedTheme}</span>
                  </h3>
                </div>
                <div className="text-2xl font-black text-slate-900 tabular-nums">{formatTime(timeLeft)}</div>
              </div>
              
              <div className="p-8 overflow-y-auto font-medium leading-relaxed text-slate-700 h-full">
                <div className="prose prose-slate max-w-none markdown-content">
                  <Markdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {content || ""}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Controls + Mir Chat) */}
          <div className="md:col-span-5 flex flex-col gap-5 h-full overflow-hidden">
             {/* Chat with Mir */}
             <div className="sleek-card flex-1 bg-slate-50 overflow-hidden flex flex-col border-slate-200">
                <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3">
                   <div className="w-8 h-8 bg-mir/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-mir" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dúvidas?</p>
                      <p className="text-xs font-bold text-slate-900 uppercase">Mir Koringa</p>
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[90%] p-3 rounded-2xl text-[11px] font-medium leading-relaxed",
                        msg.role === 'user' ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm"
                      )}>
                        {msg.role === 'model' ? (
                          <div className="markdown-content prose-sm">
                            <Markdown 
                              remarkPlugins={[remarkMath]} 
                              rehypePlugins={[rehypeKatex]}
                            >
                              {msg.content}
                            </Markdown>
                          </div>
                        ) : msg.content}
                      </div>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-200 p-2 rounded-2xl rounded-tl-none animate-pulse">
                        <Loader2 className="w-4 h-4 text-mir animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-200">
                   <div className="relative">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Tirar dúvida..."
                        className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl pr-10 text-xs font-bold focus:border-mir outline-none transition-all"
                      />
                      <button 
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 koringa-gradient rounded-lg flex items-center justify-center text-white"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>

             {/* Focus Controls */}
             <div className="sleek-card p-6 bg-white space-y-6">
                <div className="flex items-center justify-between">
                   <button 
                    onClick={() => setIsActive(!isActive)}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                      isActive ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500"
                    )}
                   >
                     {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                   </button>
                   <button 
                    onClick={toggleMusic}
                    className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-all", isMusicOn ? "bg-mir/10 text-mir" : "bg-slate-50 text-slate-400")}
                   >
                     {isMusicOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                   </button>
                   <button 
                    onClick={handleFinishSession}
                    className="flex-1 ml-4 bg-slate-900 text-white h-12 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                   >
                     Concluir Sessão
                   </button>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                   <div className="w-8 h-8 koringa-gradient rounded-lg flex items-center justify-center text-white"><Music className="w-4 h-4" /></div>
                   <select 
                      value={selectedTrack.name}
                      onChange={(e) => setSelectedTrack(LOFI_TRACKS.find(t => t.name === e.target.value)!)}
                      className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                    >
                      {LOFI_TRACKS.map(track => <option key={track.name} value={track.name}>{track.name}</option>)}
                    </select>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
