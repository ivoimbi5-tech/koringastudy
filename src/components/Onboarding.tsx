import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { GraduationCap, MapPin, University, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

export function Onboarding() {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || "",
    province: "",
    university: "",
    fieldOfStudy: "",
    academicLevel: "Superior" as "Primário" | "Médio" | "Superior",
  });

  const provinces = [
    "Luanda", "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", 
    "Cuanza Norte", "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Lunda Norte", 
    "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = async () => {
    await updateProfile({
      ...formData,
      onboardingComplete: true,
      lastStudyDate: new Date().toISOString(),
      xp: 100, // Welcome XP
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-lg sleek-card p-12 bg-white flex flex-col items-center">
        <div className="w-16 h-16 koringa-gradient rounded-2xl flex items-center justify-center mb-8 rotate-6 shadow-xl shadow-koringa/20">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>

        {step === 1 && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Bem-vindo à Koringa! 🇦🇴</h2>
              <p className="text-slate-500 font-medium">Vamos preparar sua jornada acadêmica.</p>
            </div>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Seu Nome Completo</span>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="mt-2 block w-full border border-slate-200 p-4 rounded-xl focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all font-semibold outline-none"
                  placeholder="Ex: João Manuel"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Província em Angola</span>
                <select 
                  value={formData.province}
                  onChange={(e) => setFormData({...formData, province: e.target.value})}
                  className="mt-2 block w-full border border-slate-200 p-4 rounded-xl focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all font-semibold outline-none appearance-none bg-slate-50/50"
                >
                  <option value="">Selecione...</option>
                  {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Onde você estuda? 🏛️</h2>
              <p className="text-slate-500 font-medium">Isso ajuda a personalizar seu conteúdo.</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Nível Académico</span>
                <div className="grid grid-cols-3 gap-3">
                  {["Primário", "Médio", "Superior"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData({...formData, academicLevel: level as any})}
                      className={cn(
                        "p-3 rounded-xl border-2 font-bold text-xs transition-all",
                        formData.academicLevel === level 
                          ? "border-koringa bg-koringa/5 text-koringa" 
                          : "border-slate-100 text-slate-400 hover:border-slate-200"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Universidade / Escola</span>
                <input 
                  type="text" 
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="mt-2 block w-full border border-slate-200 p-4 rounded-xl focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all font-semibold outline-none"
                  placeholder="Ex: UAN, UCAN, ISPTEC..."
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Área de Formação</span>
                <input 
                  type="text" 
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({...formData, fieldOfStudy: e.target.value})}
                  className="mt-2 block w-full border border-slate-200 p-4 rounded-xl focus:ring-4 focus:ring-koringa/10 focus:border-koringa transition-all font-semibold outline-none"
                  placeholder="Ex: Engenharia Informática, Medicina..."
                />
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full text-center space-y-6">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2">Tudo Pronto! 🚀</h2>
            <p className="text-lg text-slate-600 font-medium">Ganhastes <span className="text-koringa font-black">+100 XP</span> pela inscrição.</p>
            <div className="p-8 bg-slate-50 border border-slate-100 rounded-[24px]">
              <p className="text-sm text-slate-500 font-bold italic leading-relaxed">"O sucesso é o acumular de pequenos esforços diários."</p>
            </div>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={(step === 1 && (!formData.fullName || !formData.province)) || (step === 2 && (!formData.university || !formData.fieldOfStudy))}
          className="mt-12 w-full flex items-center justify-center gap-3 bg-slate-900 text-white p-5 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all disabled:opacity-50 group shadow-xl shadow-slate-900/10"
        >
          {step === 3 ? "Começar a Estudar" : "Próximo"}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
