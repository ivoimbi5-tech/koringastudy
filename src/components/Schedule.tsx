import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Clock, Plus, Trash2, Calendar } from "lucide-react";
import { cn } from "../lib/utils";

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function Schedule() {
  const { profile, updateProfile } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    day: "Segunda",
    start: "08:00",
    end: "10:00",
    activity: ""
  });

  const schedule = profile?.schoolSchedule || [];

  const handleAdd = async () => {
    if (!newEntry.activity) return;
    const updated = [...schedule, newEntry];
    await updateProfile({ schoolSchedule: updated });
    setIsAdding(false);
    setNewEntry({ ...newEntry, activity: "" });
  };

  const removeEntry = async (index: number) => {
    const updated = schedule.filter((_, i) => i !== index);
    await updateProfile({ schoolSchedule: updated });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Horário Escolar</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Gerencie suas aulas e rotina de estudos.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Adicionar Aula
        </button>
      </div>

      {isAdding && (
        <div className="sleek-card p-8 bg-white space-y-6 border-koringa/30 shadow-xl shadow-koringa/5">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dia</label>
              <select 
                value={newEntry.day}
                onChange={(e) => setNewEntry({...newEntry, day: e.target.value})}
                className="w-full border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors"
              >
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Início</label>
              <input 
                type="time" 
                value={newEntry.start}
                onChange={(e) => setNewEntry({...newEntry, start: e.target.value})}
                className="w-full border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fim</label>
              <input 
                type="time" 
                value={newEntry.end}
                onChange={(e) => setNewEntry({...newEntry, end: e.target.value})}
                className="w-full border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Disciplina / Atividade</label>
              <input 
                type="text" 
                value={newEntry.activity}
                onChange={(e) => setNewEntry({...newEntry, activity: e.target.value})}
                placeholder="Ex: Matemática"
                className="w-full border border-slate-200 p-3 rounded-xl font-bold bg-slate-50 outline-none focus:border-koringa transition-colors"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="btn-secondary">Cancelar</button>
            <button onClick={handleAdd} className="btn-primary">Salvar Aula</button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {DAYS.map((day) => {
          const dayEntries = schedule.filter(e => e.day === day).sort((a,b) => a.start.localeCompare(b.start));
          return (
            <div key={day} className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 px-1">
                <Calendar className="w-5 h-5 text-koringa" /> {day}
              </h3>
              <div className="space-y-3">
                {dayEntries.length > 0 ? (
                  dayEntries.map((entry, i) => {
                    const originalIndex = schedule.indexOf(entry);
                    return (
                      <div key={i} className="sleek-card p-5 bg-white group hover:border-koringa/30 transition-all flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-koringa/10 group-hover:text-koringa transition-colors shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 group-hover:text-koringa transition-colors">{entry.activity}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{entry.start} - {entry.end}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeEntry(originalIndex)}
                          className="p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem atividades</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
