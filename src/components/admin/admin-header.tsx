
"use client";

import { LayoutDashboard, Calendar, Building, Car, Compass, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  return (
    <header className="bg-slate-800 text-white flex items-center h-16 shadow-lg sticky top-0 z-50">
      <div className="w-64 flex items-center justify-center border-r border-slate-700 h-full">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg"><LayoutDashboard className="h-5 w-5" /></div>
          <span className="font-black tracking-tighter text-xl uppercase">StayFloow<span className="text-secondary text-xs">.admin</span></span>
        </div>
      </div>
      <nav className="flex-1 flex h-full">
        <HeaderTab icon={<LayoutDashboard />} label="Tableau de Bord" active />
        <HeaderTab icon={<Calendar />} label="Réservations" />
        <HeaderTab icon={<Building />} label="Hébergements" />
        <HeaderTab icon={<Car />} label="Voitures" />
        <HeaderTab icon={<Compass />} label="Circuits & Activités" />
        <HeaderTab icon={<Users />} label="Utilisateurs" />
      </nav>
    </header>
  );
}

function HeaderTab({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <button className={cn(
      "px-6 flex items-center gap-3 font-bold text-sm transition-all border-b-4",
      active ? "bg-slate-700/50 border-primary text-white" : "border-transparent text-slate-400 hover:bg-slate-700 hover:text-white"
    )}>
      <span className={cn("h-4 w-4", active ? "text-primary" : "text-slate-500")}>{icon}</span>
      {label}
    </button>
  );
}
