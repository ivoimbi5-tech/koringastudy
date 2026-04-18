import React from "react";
import { useAuth } from "../context/AuthContext";
import { getLevelProgress, formatXP, cn } from "../lib/utils";
import { Flame, Trophy, Clock, CheckCircle, Zap, Brain } from "lucide-react";
import { motion } from "motion/react";

export function Dashboard() {
  const { profile } = useAuth();
  
  if (!profile) return null;

  const { level, progress } = getLevelProgress(profile.xp);

  const stats = [
    { label: "XP Total", value: formatXP(profile.xp), icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Dias Seguidos", value: profile.streak, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Tempo Estudado", value: `${profile.totalStudyMinutes}m`, icon: Clock, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Tarefas", value: "0", icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Olá, {profile.fullName}</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {profile.fieldOfStudy} • {profile.university} • Angola 🇦🇴
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="stat-pill">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Nível</span>
            <span className="text-xl font-extrabold text-slate-900">{level}</span>
          </div>
          <div className="stat-pill">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Streak</span>
            <span className="text-xl font-extrabold text-streak">{profile.streak} 🔥</span>
          </div>
          <div className="stat-pill">
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">XP Total</span>
            <span className="text-xl font-extrabold text-slate-900">{formatXP(profile.xp)}</span>
          </div>
        </div>
      </div>

      {/* Main Focus Zone Card */}
      <div className="sleek-card p-10 bg-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-koringa group-hover:scale-110 transition-transform duration-700">
          <Brain className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 w-full space-y-8">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-slate-900">Mir Koringa <span className="font-medium text-slate-400">está pronto</span></h2>
              <p className="text-slate-500 font-medium">Sua zona de foco otimizada com tecnologia avançada.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-700">Progresso de Hoje</span>
                <span className="font-mono text-xs text-slate-400 font-bold">Lvl {level} • {Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-koringa"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button className="btn-primary flex items-center gap-2">
                <Zap className="w-4 h-4" /> Começar Agora
              </button>
              <button className="btn-secondary">Ver Resumos</button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center p-8 bg-slate-50 rounded-[24px] border border-slate-100 w-full md:w-64">
            <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-4">Próxima Meta</h3>
            <div className="text-center">
              <p className="text-3xl font-black text-slate-900">25m</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Sessão Foco</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="sleek-card p-6 bg-white flex flex-col items-start gap-4 hover:border-koringa/30 cursor-default"
            >
              <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lower Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <Trophy className="w-5 h-5 text-amber-500" /> Suas Conquistas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="sleek-card p-5 bg-white border-2 border-slate-50 flex flex-col items-center text-center gap-3 grayscale group hover:grayscale-0 transition-all duration-500 hover:border-koringa">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-koringa/10 transition-colors">
                <Zap className="w-6 h-6 text-slate-300 group-hover:text-koringa" />
              </div>
              <p className="text-xs font-black text-slate-900 leading-tight">Iniciante<br/><span className="text-[10px] text-slate-400 font-bold uppercase">Primeiro Login</span></p>
            </div>
            <div className="sleek-card p-5 bg-white border-2 border-slate-50 flex flex-col items-center text-center gap-3 grayscale group hover:grayscale-0 transition-all duration-500 border-dashed opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-900 leading-tight">Foguete<br/><span className="text-[10px] text-slate-400 font-bold uppercase">3 Dias de Streak</span></p>
            </div>
            <div className="sleek-card p-5 bg-white border-2 border-slate-50 flex flex-col items-center text-center gap-3 grayscale group hover:grayscale-0 transition-all duration-500 border-dashed opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Brain className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-900 leading-tight">Sábio<br/><span className="text-[10px] text-slate-400 font-bold uppercase">10h Estudadas</span></p>
            </div>
            <div className="sleek-card p-5 bg-white border-2 border-slate-50 flex flex-col items-center text-center gap-3 grayscale group hover:grayscale-0 transition-all duration-500 border-dashed opacity-50">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-xs font-black text-slate-900 leading-tight">Imbatível<br/><span className="text-[10px] text-slate-400 font-bold uppercase">50 Tarefas</span></p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <Zap className="w-5 h-5 text-orange-500" /> Missões Diárias
          </h3>
          <div className="space-y-4">
            <div className="sleek-card p-6 bg-white flex items-center gap-5 border-l-4 border-l-orange-500">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-extrabold text-slate-900">Mantenha a Chama</p>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-md">+50 XP</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Complete sua primeira sessão hoje.</p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 w-[0%] transition-all" />
                </div>
              </div>
            </div>

            <div className="sleek-card p-6 bg-white flex items-center gap-5 border-l-4 border-l-blue-500 opacity-80">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-extrabold text-slate-900">Maratona de Sábado</p>
                  <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md">+150 XP</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">Estude por 2 horas totais hoje.</p>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[15%] transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
