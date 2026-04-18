import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book, Plus, Trash2, ArrowRight, Tag, Sparkles, ChevronRight, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface Subject {
  id: string;
  name: string;
  color: string;
  themes: string[];
}

export function SubjectsManager() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addingThemeTo, setAddingThemeTo] = useState<string | null>(null);
  const [newThemeName, setNewThemeName] = useState("");

  const COLORS = ["bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500", "bg-indigo-500"];

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "subjects"));
    return onSnapshot(q, (snapshot) => {
      setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    });
  }, [user]);

  const addSubject = async () => {
    if (!user || !newSubjectName.trim()) return;
    await addDoc(collection(db, "users", user.uid, "subjects"), {
      name: newSubjectName.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      themes: [],
      createdAt: serverTimestamp()
    });
    setNewSubjectName("");
    setIsAdding(false);
  };

  const deleteSubject = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "subjects", id));
  };

  const addTheme = async (subjectId: string) => {
    if (!user || !newThemeName.trim()) return;
    await updateDoc(doc(db, "users", user.uid, "subjects", subjectId), {
      themes: arrayUnion(newThemeName.trim())
    });
    setNewThemeName("");
    setAddingThemeTo(null);
  };

  const removeTheme = async (subjectId: string, theme: string) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "subjects", subjectId), {
      themes: arrayRemove(theme)
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Disciplinas & Temas</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Organize seus estudos por áreas e tópicos específicos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar Disciplina
        </button>
      </div>

      {isAdding && (
        <div className="sleek-card p-6 bg-white flex gap-4 border-koringa shadow-xl shadow-koringa/5 items-center">
          <input 
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
            placeholder="Nome da Disciplina (Ex: Matemática)"
            className="flex-1 p-4 bg-slate-50 rounded-xl font-bold outline-none border border-slate-100 focus:border-koringa transition-all"
          />
          <div className="flex gap-2">
            <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancelar</button>
            <button onClick={addSubject} className="btn-primary">Criar</button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => (
          <div key={subject.id} className="sleek-card bg-white overflow-hidden shadow-sm hover:shadow-md transition-all border-slate-100 flex flex-col">
            <div className={cn("p-6 text-white flex justify-between items-start", subject.color)}>
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Book className="w-6 h-6" />
                 </div>
                 <h3 className="text-xl font-black">{subject.name}</h3>
              </div>
              <button 
                onClick={() => deleteSubject(subject.id)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temas Cadastrados</span>
                  <button 
                    onClick={() => setAddingThemeTo(subject.id)}
                    className="text-koringa hover:scale-110 transition-transform"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {subject.themes.length > 0 ? (
                    subject.themes.map((theme, idx) => (
                      <div key={idx} className="flex items-center justify-between group p-3 bg-slate-50/50 rounded-xl border border-slate-100 hover:border-koringa/20 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                           <Hash className="w-3 h-3 text-slate-300 group-hover:text-koringa transition-colors shrink-0" />
                           <span className="text-sm font-bold text-slate-700 truncate">{theme}</span>
                        </div>
                        <button 
                          onClick={() => removeTheme(subject.id, theme)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-400 font-bold italic py-2">Nenhum tema adicionado.</p>
                  )}
                </div>

                {addingThemeTo === subject.id && (
                  <div className="pt-2 animate-in slide-in-from-top-2 duration-300">
                    <input 
                      autoFocus
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTheme(subject.id)}
                      placeholder="Novo tema..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-koringa"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                       <button onClick={() => setAddingThemeTo(null)} className="text-[10px] font-black uppercase text-slate-400">Cancelar</button>
                       <button onClick={() => addTheme(subject.id)} className="text-[10px] font-black uppercase text-koringa">Adicionar</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/20">
               <div className="flex items-center gap-2 text-mir font-black uppercase text-[10px] tracking-widest cursor-pointer hover:gap-3 transition-all">
                  Gerar Resumos <ChevronRight className="w-4 h-4" />
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
