import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ai, MODELS, SYSTEM_PROMPTS } from "../lib/gemini";
import { Send, User, Bot, Sparkles, Image as ImageIcon, FileText, Upload, X, Loader2, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Message {
  role: "user" | "model";
  text: string;
}

export function Tutor() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: `Olá! Eu sou o Pacavira, seu tutor. Como você está estudando para **${profile?.fieldOfStudy || 'suas aulas'}** hoje? Podes também me enviar materiais para eu analisar!` }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadText, setUploadText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input.trim();
    if (!textToSend || isTyping) return;

    setInput("");
    setMessages(prev => [...prev, { role: "user", text: textToSend }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: MODELS.TUTOR,
        contents: [
          ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
          { role: "user", parts: [{ text: textToSend }] }
        ],
        config: {
          systemInstruction: `${SYSTEM_PROMPTS.PACAVIRA}. O nível do aluno é ${profile?.academicLevel}. Use Markdown e LaTeX ($...$ para inline, $$...$$ para blocos) para fórmulas e clareza.`
        }
      });

      const aiText = response.text || "Desculpe, tive um pequeno problema no pensamento. Podemos tentar de novo?";
      setMessages(prev => [...prev, { role: "model", text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: "model", text: "Erro ao conectar. Tente novamente em instantes." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMaterialUpload = async () => {
    if (!uploadText.trim()) return;
    setIsUploading(true);
    const materialPrompt = `Analise o material abaixo para mim. Dê um resumo dos conceitos principais e me explique como se eu fosse do nível ${profile?.academicLevel}:\n\n${uploadText}`;
    await handleSend(materialPrompt);
    setUploadText("");
    setShowUpload(false);
    setIsUploading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pacavira/10 rounded-2xl flex items-center justify-center text-pacavira">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Professor Pacavira</h1>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tutor • Online</p>
          </div>
        </div>
        <button 
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:border-pacavira hover:text-pacavira transition-all shadow-sm"
        >
          <Upload className="w-4 h-4" /> Analisar Material
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 sleek-card bg-white flex flex-col overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20"
        >
          {messages.map((m, i) => (
            <div key={i} className={cn("flex gap-4 items-end", m.role === "user" ? "flex-row-reverse" : "")}>
              {m.role === "model" && (
                <div className="w-10 h-10 rounded-xl bg-pacavira flex items-center justify-center text-white flex-shrink-0 mb-1 shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
              )}
              <div className={cn(
                "max-w-[85%] p-5 rounded-[24px] shadow-sm text-sm leading-relaxed",
                m.role === "user" 
                  ? "bg-slate-900 text-white rounded-br-none" 
                  : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
              )}>
                <div className="markdown-content">
                  <Markdown 
                    remarkPlugins={[remarkMath]} 
                    rehypePlugins={[rehypeKatex]}
                  >
                    {m.text}
                  </Markdown>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-4 items-end">
              <div className="w-10 h-10 rounded-xl bg-pacavira flex items-center justify-center text-white flex-shrink-0 mb-1">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-bl-none flex gap-1.5 items-center shadow-sm">
                <div className="w-1.5 h-1.5 bg-pacavira rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-pacavira rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-pacavira rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Digite sua dúvida ou mande um material..."
              className="w-full border border-slate-200 bg-slate-50/50 p-5 pr-14 rounded-2xl focus:ring-4 focus:ring-pacavira/10 focus:border-pacavira transition-all text-sm font-semibold outline-none"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-pacavira text-white rounded-xl font-black hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-pacavira/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-xl bg-white rounded-[32px] p-8 shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-pacavira/10 rounded-xl flex items-center justify-center text-pacavira">
                      <FileText className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900">Analisar Material</h3>
                </div>
                <button onClick={() => setShowUpload(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Conteúdo do Material</span>
                   <textarea 
                    value={uploadText}
                    onChange={(e) => setUploadText(e.target.value)}
                    placeholder="Cole o texto que o Prof. Pacavira deve analisar..."
                    className="mt-2 w-full h-48 border border-slate-200 p-5 rounded-2xl focus:ring-4 focus:ring-pacavira/10 focus:border-pacavira outline-none font-medium bg-slate-50 transition-all resize-none"
                   />
                </label>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleMaterialUpload}
                    disabled={isUploading || !uploadText.trim()}
                    className="w-full koringa-gradient text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isUploading ? "Processando..." : "Analisar com Tutor"}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">O material será enviado para o contexto da conversa</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
