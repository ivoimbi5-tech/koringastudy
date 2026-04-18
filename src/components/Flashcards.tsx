import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, query, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Brain, Plus, Trash2, CheckCircle2, RotateCw, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  lastReviewed?: any;
  interval: number;
  subject?: string;
}

export function Flashcards() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newCard, setNewCard] = useState({ question: "", answer: "", subject: "" });
  const [isReviewing, setIsReviewing] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "users", user.uid, "cards"));
    return onSnapshot(q, (snapshot) => {
      setCards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Flashcard)));
    });
  }, [user]);

  const handleAdd = async () => {
    if (!user || !newCard.question || !newCard.answer) return;
    await addDoc(collection(db, "users", user.uid, "cards"), {
      ...newCard,
      interval: 0,
      createdAt: serverTimestamp()
    });
    setIsAdding(false);
    setNewCard({ question: "", answer: "", subject: "" });
  };

  const deleteCard = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "users", user.uid, "cards", id));
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Flashcards 🧠</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Memorização ativa com sistema de repetição espaçada.</p>
        </div>
        <div className="flex gap-4">
          <button 
             onClick={() => setIsReviewing(true)}
             disabled={cards.length === 0}
             className="btn-primary bg-mir hover:bg-mir/90 flex items-center gap-2"
          >
            <RotateCw className="w-5 h-5" /> Revisar Agora
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Novo Card
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="sleek-card p-8 bg-white space-y-6 border-koringa/30 shadow-xl shadow-koringa/5">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pergunta</label>
              <textarea 
                value={newCard.question}
                onChange={(e) => setNewCard({...newCard, question: e.target.value})}
                placeholder="O que você quer lembrar?"
                className="w-full border border-slate-200 p-4 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors h-32 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resposta</label>
              <textarea 
                value={newCard.answer}
                onChange={(e) => setNewCard({...newCard, answer: e.target.value})}
                placeholder="A resposta correta..."
                className="w-full border border-slate-200 p-4 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors h-32 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancelar</button>
            <button onClick={handleAdd} className="btn-primary">Criar Flashcard</button>
          </div>
        </div>
      )}

      {isReviewing && currentCard ? (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-2xl space-y-10">
            <div className="flex justify-between items-center text-white px-2">
              <div className="flex items-center gap-3">
                 <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Card {currentCardIndex + 1} de {cards.length}</div>
              </div>
              <button onClick={() => { setIsReviewing(false); setIsFlipped(false); }} className="hover:scale-110 transition-transform">
                <Trash2 className="w-6 h-6" /> {/* Just close or abort */}
              </button>
            </div>

            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full aspect-[16/10] cursor-pointer group"
            >
              <motion.div 
                className="w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div className="absolute inset-0 sleek-card bg-white p-12 flex flex-col items-center justify-center text-center shadow-2xl backface-hidden">
                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em] mb-6">Pergunta</span>
                  <p className="text-3xl font-extrabold text-slate-900 leading-tight">{currentCard.question}</p>
                  <p className="absolute bottom-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-koringa transition-colors">Clique para virar</p>
                </div>
                {/* Back */}
                <div 
                  className="absolute inset-0 sleek-card bg-slate-900 text-white p-12 flex flex-col items-center justify-center text-center shadow-2xl backface-hidden"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Resposta</span>
                  <p className="text-2xl font-bold leading-relaxed">{currentCard.answer}</p>
                </div>
              </motion.div>
            </div>

            {isFlipped && (
               <div className="flex justify-center gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  <button 
                    onClick={() => {
                      if (currentCardIndex < cards.length - 1) {
                         setCurrentCardIndex(currentCardIndex + 1);
                         setIsFlipped(false);
                      } else {
                         setIsReviewing(false);
                         setIsFlipped(false);
                         setCurrentCardIndex(0);
                      }
                    }}
                    className="flex-1 max-w-[200px] h-16 bg-white rounded-2xl text-slate-900 font-black text-lg shadow-xl shadow-black/20 hover:scale-105 transition-all"
                  >
                    Próximo
                  </button>
               </div>
            )}
          </div>
        </div>
      ) : null}

      {!isReviewing && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.length > 0 ? (
            cards.map((card) => (
              <div key={card.id} className="sleek-card p-6 bg-white group hover:border-koringa transition-all shadow-sm flex flex-col justify-between h-56">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <button 
                      onClick={() => deleteCard(card.id)}
                      className="text-slate-200 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="font-extrabold text-slate-800 line-clamp-3 leading-snug">{card.question}</p>
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                   <div className="px-2 py-1 bg-green-50 text-[10px] font-bold text-green-600 rounded uppercase tracking-wider">Novo</div>
                   {card.subject && <div className="px-2 py-1 bg-blue-50 text-[10px] font-bold text-blue-600 rounded uppercase tracking-wider">{card.subject}</div>}
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 sleek-card p-20 bg-slate-50 flex flex-col items-center justify-center text-center gap-4 border-dashed">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 shadow-sm border border-slate-100">
                  <Sparkles className="w-8 h-8" />
               </div>
               <div className="space-y-2">
                  <p className="text-xl font-extrabold text-slate-900">Sua mente está limpa!</p>
                  <p className="text-slate-400 font-medium text-sm">Crie cards para começar a hackear sua memória.</p>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
