import React from "react";
import { Info, Mail, Phone, Heart, Coffee, Globe, Github } from "lucide-react";

export function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 koringa-gradient rounded-[24px] flex items-center justify-center text-white mx-auto shadow-2xl shadow-koringa/20 border-4 border-white">
          <Info className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">KORINGA.Study</h1>
        <p className="inline-block px-3 py-1 bg-rose-50 rounded-full text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">Versão 1.0.0 (Beta)</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="sleek-card p-10 bg-white space-y-6">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" /> Nossa Missão
          </h3>
          <p className="text-slate-500 font-medium leading-relaxed">
            Nascida em **Angola 🇦🇴**, a Koringa tem como objetivo democratizar o acesso à educação de alta performance através de tecnologias inteligentes. 
            Queremos que cada estudante angolano tenha um suporte personalizado 24/7.
          </p>
          <div className="pt-6 border-t border-slate-50 space-y-4 font-bold text-sm text-slate-600">
             <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-400" />
                <span>koringastudy.vercel.app</span>
             </div>
             <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span>koringastudy@proton.me</span>
             </div>
             <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>936 842 307</span>
             </div>
          </div>
        </div>

        <div className="sleek-card p-10 bg-slate-900 text-white space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Coffee className="w-32 h-32" />
          </div>
          <h3 className="text-xl font-black flex items-center gap-3 relative z-10">
            <Coffee className="w-6 h-6 text-koringa" /> Apoie o Projecto
          </h3>
          <p className="text-slate-400 font-medium leading-relaxed relative z-10">
            Somos um projecto independente. Se a Koringa está te ajudando, considere fazer uma doação para manter os servidores ativos.
          </p>
          
          <div className="space-y-4 relative z-10">
            <div className="p-6 bg-white/10 rounded-2xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#000000] mb-2">Multicaixa Express</p>
              <p className="font-mono font-bold text-lg select-all text-white">936 842 307</p>
            </div>
            <div className="w-full bg-white text-slate-900 py-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-lg">
               SakidilaTech
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.4em]">Desenvolvido por SakidilaTech ❤️</p>
      </div>
    </div>
  );
}
