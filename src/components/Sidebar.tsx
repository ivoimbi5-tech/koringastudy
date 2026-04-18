import React from "react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  Brain, 
  BookOpen, 
  LogOut,
  Flame,
  Calendar,
  CheckSquare,
  Library,
  Info,
  Layers
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { profile, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "zone", icon: Brain, label: "Zona de Estudo" },
    { id: "tutor", icon: MessageSquare, label: "Tutor Pacavira" },
    { id: "schedule", icon: Calendar, label: "Horário" },
    { id: "subjects", icon: Library, label: "Disciplinas" },
    { id: "library", icon: BookOpen, label: "Resumos" },
    { id: "flashcards", icon: Layers, label: "Cards (Anki)" },
    { id: "tasks", icon: CheckSquare, label: "Tarefas" },
  ];

  return (
    <aside className="w-[240px] bg-sidebar text-white p-6 flex flex-col hidden md:flex flex-shrink-0">
      <div className="mb-10">
        <span className="font-extrabold text-2xl tracking-tighter text-koringa">KORINGA.Study</span>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-sm transition-all",
                isActive 
                  ? "bg-koringa/15 text-koringa" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className={cn("w-4 h-4")} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="pt-6 border-t border-white/10 space-y-6">
        {profile && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pacavira rounded-full flex items-center justify-center font-bold text-white uppercase shadow-lg">
              {profile.fullName.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-bold text-sm truncate text-white">{profile.fullName}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-[10px] font-bold text-streak uppercase tracking-wider">
                  <Flame className="w-3 h-3 fill-current" />
                  {profile.streak} 🔥
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-1">
          <button 
            onClick={() => setActiveTab("about")}
            className={cn(
              "w-full flex items-center gap-4 px-4 py-2 rounded-lg font-medium text-sm transition-all",
              activeTab === "about" ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <Info className="w-4 h-4" />
            Sobre a Koringa
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-4 py-2 rounded-lg font-medium text-sm text-rose-400 hover:bg-rose-500/10 transition-all font-bold"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
