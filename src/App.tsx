import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { Tutor } from "./components/Tutor";
import { StudyZone } from "./components/StudyZone";
import { Library } from "./components/Library";
import { Sidebar } from "./components/Sidebar";
import { Schedule } from "./components/Schedule";
import { SubjectsManager } from "./components/SubjectsManager";
import { Flashcards } from "./components/Flashcards";
import { Tasks } from "./components/Tasks";
import { About } from "./components/About";
import { LogIn, Brain } from "lucide-react";

function MainContent() {
  const { user, profile, loading, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "tutor" | "zone" | "library" | "schedule" | "subjects" | "flashcards" | "tasks" | "about">("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-koringa border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 font-bold text-gray-600 animate-pulse">KORINGA.Study...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#f8fafc] relative overflow-hidden">
        {/* Subtle Background Orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-koringa/5 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pacavira/5 rounded-full blur-[120px] -ml-48 -mb-48" />
        
        <div className="w-full max-w-md sleek-card p-12 text-center bg-white z-10">
          <div className="w-16 h-16 koringa-gradient rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-koringa/20">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-3 text-slate-900">KORINGA.Study</h1>
          <p className="text-slate-500 mb-10 font-medium">Sua zona de foco, seu futuro em Angola.</p>
          
          <button 
            onClick={signIn}
            className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 p-4 rounded-xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            <LogIn className="w-5 h-5 text-slate-600" />
            <span className="text-slate-700">Entrar com Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (!profile?.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "tutor" && <Tutor />}
        {activeTab === "zone" && <StudyZone />}
        {activeTab === "library" && <Library />}
        {activeTab === "schedule" && <Schedule />}
        {activeTab === "subjects" && <SubjectsManager />}
        {activeTab === "flashcards" && <Flashcards />}
        {activeTab === "tasks" && <Tasks />}
        {activeTab === "about" && <About />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
