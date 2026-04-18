import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ai, MODELS, SYSTEM_PROMPTS } from "../lib/gemini";
import { Plus, Book, FileText, Trash2, GraduationCap, ArrowRight, Sparkles, Upload, FileUp, X, Check, Save } from "lucide-react";
import { cn } from "../lib/utils";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
  id: string;
  name: string;
  color: string;
  themes: string[];
}

interface Summary {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

const COLORS = [
  "bg-rose-500", "bg-emerald-500", "bg-sky-500", "bg-amber-500", "bg-indigo-500", "bg-violet-500", "bg-slate-900"
];

export function Library() {
  const { user, profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeTab, setActiveTab] = useState<"subjects" | "summaries">("subjects");
  
  // States to add content
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newTheme, setNewTheme] = useState("");
  
  // Summary states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState("");

  useEffect(() => {
    if (!user) return;
    const qS = query(collection(db, "users", user.uid, "subjects"));
    const qSum = query(collection(db, "users", user.uid, "summaries"));

    const unsubS = onSnapshot(qS, (snap) => setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject))));
    const unsubSum = onSnapshot(qSum, (snap) => setSummaries(snap.docs.map(d => ({ id: d.id, ...d.data() } as Summary))));

    return () => { unsubS(); unsubSum(); };
  }, [user]);

  const handleCreateSubject = async () => {
    if (!user || !newSubjectName.trim()) return;
    try {
      await addDoc(collection(db, "users", user.uid, "subjects"), {
        name: newSubjectName.trim(),
        color: selectedColor,
        themes: [],
        createdAt: serverTimestamp()
      });
      setNewSubjectName("");
      setIsAddingSubject(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddTheme = async () => {
    if (!user || !editingSubject || !newTheme.trim()) return;
    try {
      const subjectRef = doc(db, "users", user.uid, "subjects", editingSubject.id);
      await updateDoc(subjectRef, {
        themes: arrayUnion(newTheme.trim())
      });
      setNewTheme("");
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!user || !confirm("Tem certeza que deseja excluir esta disciplina?")) return;
    await deleteDoc(doc(db, "users", user.uid, "subjects", id));
  };

  const handleManualSummary = async () => {
    if (!user || !uploadText.trim()) return;
    setIsUploading(true);
    try {
      const resp = await ai.models.generateContent({
        model: MODELS.TUTOR,
        contents: [{ role: "user", parts: [{ text: `Resuma e simplifique o seguinte conteúdo para estudo: ${uploadText}` }] }],
        config: { systemInstruction: "Você é um especialista em resumos educacionais." }
      });
      await addDoc(collection(db, "users", user.uid, "summaries"), {
        title: "Resumo: " + uploadText.substring(0, 30) + "...",
        content: resp.text,
        createdAt: serverTimestamp()
      });
      setUploadText("");
      setIsUploading(false);
    } catch (e) {
      console.error(e);
      setIsUploading(false);
    }
  };

  const deleteSummary = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "summaries", id));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Biblioteca Digital</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Organize suas disciplinas e temas de estudo.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["subjects", "summaries"].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === "subjects" ? "Disciplinas" : "Resumos"}
              </button>
            ))}
          </div>
          {activeTab === "subjects" && (
            <button 
              onClick={() => setIsAddingSubject(true)}
              className="bg-koringa text-white p-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-koringa/20"
            >
              <Plus className="w-4 h-4" /> Nova Disciplina
            </button>
          )}
        </div>
      </div>

      {activeTab === "subjects" && (
        <div className="grid md:grid-cols-3 gap-8">
          {subjects.map((subject) => (
            <div 
              key={subject.id} 
              onClick={() => setEditingSubject(subject)}
              className="sleek-card p-8 bg-white relative group cursor-pointer hover:border-koringa transition-all"
            >
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={(e) => deleteSubject(e, subject.id)} className="p-2 text-slate-300 hover:text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg", subject.color)}>
                <Book className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">{subject.name}</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{subject.themes?.length || 0} Temas Cadastrados</p>
              
              <div className="mt-8 flex items-center gap-2 text-koringa font-bold group-hover:gap-4 transition-all uppercase text-[10px] tracking-widest">
                Gerenciar Disciplina <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}

          {subjects.length === 0 && !isAddingSubject && (
            <div className="col-span-full sleek-card p-20 bg-slate-50 border-dashed border-2 flex flex-col items-center justify-center gap-4 text-center">
               <GraduationCap className="w-16 h-16 text-slate-200" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhuma disciplina cadastrada ainda.</p>
               <button onClick={() => setIsAddingSubject(true)} className="text-koringa font-black hover:underline uppercase text-[10px] tracking-widest">Começar Agora +</button>
            </div>
          )}
        </div>
      )}

      {/* Add Subject Modal */}
      <AnimatePresence>
        {isAddingSubject && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl space-y-6"
             >
                <div className="flex justify-between items-center">
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Nova Disciplina</h3>
                   <button onClick={() => setIsAddingSubject(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X className="w-5 h-5" />
                   </button>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome da Disciplina</label>
                      <input 
                        type="text" 
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Ex: Física, Português..."
                        className="w-full border border-slate-200 p-5 rounded-2xl font-bold bg-slate-50 focus:ring-4 focus:ring-koringa/10 focus:border-koringa outline-none transition-all"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cor de Identificação</label>
                      <div className="flex gap-3">
                         {COLORS.map(c => (
                           <button 
                            key={c} 
                            onClick={() => setSelectedColor(c)}
                            className={cn(
                              "w-8 h-8 rounded-full border-4 transition-all",
                              c,
                              selectedColor === c ? "border-slate-200 scale-125 shadow-lg" : "border-transparent"
                            )}
                           />
                         ))}
                      </div>
                   </div>

                   <button 
                    onClick={handleCreateSubject}
                    disabled={!newSubjectName.trim()}
                    className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-slate-800 transition-all active:scale-95"
                   >
                     <Check className="w-6 h-6" /> Criar Disciplina
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subject Themes View/Management */}
      <AnimatePresence>
        {editingSubject && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
             >
                <div className={cn("p-8 text-white flex justify-between items-start", editingSubject.color)}>
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Gerenciando Disciplina</p>
                      <h3 className="text-3xl font-black tracking-tight">{editingSubject.name}</h3>
                   </div>
                   <button onClick={() => setEditingSubject(null)} className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-all">
                      <X className="w-5 h-5" />
                   </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Temas de Estudo</h4>
                         <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full">{editingSubject.themes?.length || 0} de 10 sugeridos</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         {editingSubject.themes?.map((theme, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                              <span className="text-sm font-bold text-slate-700">{theme}</span>
                              <button className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                 <Trash2 className="w-3.5 h-3.5" />
                              </button>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="pt-8 border-t border-slate-100 space-y-4">
                      <div className="space-y-4">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Novo Tema</label>
                         <div className="flex gap-3">
                            <input 
                              type="text" 
                              value={newTheme}
                              onChange={(e) => setNewTheme(e.target.value)}
                              placeholder="Ex: Revolução Industrial, Óptica..."
                              className="flex-1 border border-slate-200 p-4 rounded-xl font-bold bg-slate-50 focus:ring-4 focus:ring-koringa/10 focus:border-koringa outline-none transition-all text-sm"
                            />
                            <button 
                              onClick={handleAddTheme}
                              disabled={!newTheme.trim()}
                              className="bg-koringa text-white px-6 rounded-xl font-bold text-sm disabled:opacity-50"
                            >
                              Adicionar
                            </button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                   <div className="flex items-center gap-2 text-mir font-black uppercase text-[10px] tracking-widest">
                      <Sparkles className="w-4 h-4" /> Sugestões AI Ativas
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {activeTab === "summaries" && (
        <div className="space-y-8">
          <div className="sleek-card p-8 bg-white space-y-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                <FileUp className="w-4 h-4 text-koringa" /> Enviar para Resumo
             </div>
             <div className="flex gap-4">
                <textarea 
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  placeholder="Cole um texto ou resumo aqui para simplificar..."
                  className="flex-1 border border-slate-200 p-4 rounded-xl font-medium text-sm outline-none focus:border-koringa transition-all h-24 bg-slate-50/50"
                />
                <button 
                  onClick={handleManualSummary}
                  disabled={isUploading || !uploadText.trim()}
                  className="bg-slate-900 text-white px-8 rounded-xl font-bold hover:bg-slate-800 transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? <Sparkles className="animate-spin" /> : <Upload className="w-5 h-5" />}
                  <span className="text-[10px] uppercase tracking-tighter">Resumir</span>
                </button>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {summaries.length > 0 ? (
              summaries.map((summary) => (
                <div key={summary.id} className="sleek-card p-8 bg-white space-y-4 group transition-all hover:border-mir/30">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-mir/10 rounded-xl flex items-center justify-center text-mir">
                      <FileText className="w-6 h-6" />
                    </div>
                    <button onClick={() => deleteSummary(summary.id)} className="text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">{summary.title}</h3>
                  <div className="prose prose-slate prose-sm max-w-none text-slate-500 line-clamp-4 font-medium italic">
                     <Markdown>{summary.content}</Markdown>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full sleek-card p-20 bg-slate-50 text-center space-y-6">
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Nenhum resumo disponível.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
