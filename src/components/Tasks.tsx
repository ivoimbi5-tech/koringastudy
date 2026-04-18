import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ai, MODELS, SYSTEM_PROMPTS } from "../lib/gemini";
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Star, Zap, MessageSquare, Send, Loader2, X, Sparkles, Brain } from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: any;
  priority?: "low" | "medium" | "high";
  feedback?: string;
}

export function Tasks() {
  const { user, profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [answerInput, setAnswerInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "tasks"));
    return onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    });
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newTaskTitle.trim()) return;
    await addDoc(collection(db, "users", user.uid, "tasks"), {
      title: newTaskTitle.trim(),
      completed: false,
      priority: "medium",
      createdAt: serverTimestamp()
    });
    setNewTaskTitle("");
    setIsAdding(false);
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    await updateDoc(doc(db, "users", user.uid, "tasks", task.id), {
      completed: !task.completed
    });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
  };

  const checkAnswer = async () => {
    if (!selectedTask || !answerInput.trim() || isChecking || !user) return;
    setIsChecking(true);

    try {
      const resp = await ai.models.generateContent({
        model: MODELS.MENTOR,
        contents: [{ role: "user", parts: [{ text: `Tarefa: "${selectedTask.title}". Resposta do Aluno: "${answerInput}". Verifique se está correto. Responda brevemente com feedback e uma nota de 0 a 10. Use LaTeX ($...$) se houver fórmulas. Se estiver correto (nota >= 7), finalize desejando bons estudos.` }] }],
        config: { systemInstruction: SYSTEM_PROMPTS.MIR_KORINGA }
      });

      const feedback = resp.text || "Sem feedback disponível.";
      
      await updateDoc(doc(db, "users", user.uid, "tasks", selectedTask.id), {
        feedback: feedback,
        completed: true
      });

      // Bonus XP for correct answer (simplified logic)
      if (feedback.toLowerCase().includes("parabéns") || feedback.toLowerCase().includes("correto")) {
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(50)
        });
      }

      setAnswerInput("");
      setSelectedTask(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  const sortedTasks = [...tasks].sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Suas Tarefas ✅</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Clique em uma tarefa gerada para responder.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar Tarefa
        </button>
      </div>

      {(isAdding || tasks.length === 0) && !isAdding ? null : (
        <div className={cn(
          "sleek-card p-2 bg-white flex transition-all",
          isAdding ? "ring-2 ring-koringa/20 border-koringa" : ""
        )}>
          <input 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="O que precisa ser feito? (Pressione Enter)"
            className="flex-1 p-4 px-6 bg-transparent font-bold outline-none text-slate-900"
          />
          {isAdding && (
            <div className="flex p-1.5 gap-2">
               <button onClick={() => setIsAdding(false)} className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancelar</button>
               <button onClick={handleAdd} className="bg-koringa text-white px-6 rounded-xl font-bold text-sm">Salvar</button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div 
              key={task.id} 
              className={cn(
                "sleek-card p-5 bg-white flex items-center justify-between group transition-all cursor-pointer",
                task.completed ? "opacity-60 bg-slate-50/50 grayscale" : "hover:border-koringa/30"
              )}
              onClick={() => !task.completed && setSelectedTask(task)}
            >
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTask(task);
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                    task.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
                <div className="space-y-1">
                  <p className={cn(
                    "font-bold text-slate-800 transition-all",
                    task.completed ? "line-through text-slate-400" : ""
                  )}>
                    {task.title}
                  </p>
                  {task.feedback && (
                    <div className="text-[10px] bg-mir/5 text-mir font-black uppercase tracking-tighter p-1 px-2 rounded-lg inline-block">
                      Mir: Feedack recebido
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {!task.completed && (
                  <div className="text-[10px] font-black uppercase text-koringa tracking-widest bg-koringa/10 px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                    Responder
                  </div>
                )}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="p-2 text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : !isAdding && (
          <div className="p-20 text-center bg-slate-50 border-dashed border-2 rounded-3xl space-y-4">
             <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
             </div>
             <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Parabéns! Nenhuma tarefa pendente.</p>
             <button onClick={() => setIsAdding(true)} className="text-koringa font-black hover:underline">Adicionar uma agora +</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-mir/5 rounded-full -translate-y-16 translate-x-16" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tarefa para Mir Koringa</p>
                    <h3 className="text-xl font-black text-slate-900 leading-tight">{selectedTask.title}</h3>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 italic text-slate-600 text-sm font-medium">
                    "O aprendizado verdadeiro ocorre quando você articula o que entendeu."
                  </div>

                  <textarea 
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Sua resposta..."
                    className="w-full h-40 border border-slate-200 p-5 rounded-2xl focus:ring-4 focus:ring-mir/10 focus:border-mir outline-none font-medium bg-white transition-all resize-none shadow-inner"
                  />

                  <button 
                    onClick={checkAnswer}
                    disabled={isChecking || !answerInput.trim()}
                    className="w-full koringa-gradient text-white p-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-koringa/20 transition-all hover:-translate-y-1"
                  >
                    {isChecking ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isChecking ? "Mir está validando..." : "Submeter para Correção"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tasks.some(t => t.feedback && t.id === selectedTask?.id) ? null : tasks.filter(t => t.feedback && t.completed).map(task => (
           <motion.div 
            key={`feedback-${task.id}`}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="sleek-card p-6 bg-slate-900 text-white relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <MessageSquare className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-2 text-mir font-black uppercase text-[10px] tracking-widest mb-3">
                <Brain className="w-4 h-4" /> Feedback do Mentor
              </div>
              <p className="text-xs font-bold text-slate-300 mb-1">Sobre: {task.title}</p>
              <div className="markdown-content text-sm leading-relaxed prose prose-invert max-w-none">
                <Markdown 
                  remarkPlugins={[remarkMath]} 
                  rehypePlugins={[rehypeKatex]}
                >
                  {task.feedback}
                </Markdown>
              </div>
              <button 
                onClick={() => deleteTask(task.id)}
                className="mt-4 text-[10px] bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest transition-all"
              >
                Entendido, Arquivar Feedback
              </button>
           </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
