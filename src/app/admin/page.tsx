
"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, Calendar, Building, Car, Compass, Users, 
  MessageSquare, BarChart3, Settings, Search, Bell, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, 
  Clock, Euro, Percent, UserPlus, ShieldCheck, Download,
  ExternalLink, Trash2, Edit3, MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { cn } from "@/lib/utils";
import Link from "next/link";

const data = [
  { name: 'Jan', res: 400, rev: 2400 },
  { name: 'Fév', res: 300, rev: 1398 },
  { name: 'Mar', res: 200, rev: 9800 },
  { name: 'Avr', res: 278, rev: 3908 },
  { name: 'Mai', res: 189, rev: 4800 },
  { name: 'Juin', res: 239, rev: 3800 },
  { name: 'Juil', res: 349, rev: 4300 },
];

export default function AdminDashboardMaster() {
  const [activeTab, setActiveCategory] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-slate-700">
      {/* HEADER TABS - Fidèle à l'image */}
      <header className="bg-slate-800 text-white flex items-center h-16 shadow-lg z-50">
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
        <div className="px-6 flex items-center gap-4 border-l border-slate-700 h-full">
          <Bell className="h-5 w-5 text-slate-400 hover:text-white cursor-pointer" />
          <div className="h-8 w-8 rounded-full bg-slate-600 border-2 border-slate-500" />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR - Fidèle à l'image */}
        <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700 shrink-0 shadow-2xl">
          <div className="flex-1 py-6">
            <SidebarItem icon={<LayoutDashboard />} label="Tableau de Bord" active />
            <SidebarItem icon={<Calendar />} label="Réservations" />
            <SidebarItem icon={<Building />} label="Hébergements" />
            <SidebarItem icon={<Car />} label="Voitures" />
            <SidebarItem icon={<Compass />} label="Circuits & Activités" />
            <div className="my-4 border-t border-slate-700 mx-4" />
            <SidebarItem icon={<Users />} label="Utilisateurs" />
            <SidebarItem icon={<UserPlus />} label="Partenaires" />
            <SidebarItem icon={<MessageSquare />} label="Messages" />
            <SidebarItem icon={<BarChart3 />} label="Rapports" />
            <SidebarItem icon={<Settings />} label="Paramètres" />
          </div>
          <div className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center border-t border-slate-700">
            StayFloow Engine v3.0
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* KPI ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Today" value="125" icon={<ArrowUpRight />} color="blue" sub="Voir Détails" />
            <KpiCard title="This Month" value="€18,750" icon={<Euro />} color="dark-blue" sub="Voir Rapport" />
            <KpiCard title="Occupation" value="78%" icon={<Percent />} color="green" sub="Voir Graphiques" />
            <KpiCard title="This Week" value="24" icon={<UserPlus />} color="orange" sub="Valider Comptes" />
          </div>

          {/* TRENDS CHART */}
          <Card className="border-none shadow-sm rounded-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Tendances de Réservation</CardTitle>
              <SelectDateRange />
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="rev" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  <Line type="monotone" dataKey="res" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* MANAGEMENT GRIDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gestion Hébergements */}
            <ManagementBlock 
              title="Gestion des Hébergements" 
              color="blue"
              items={[
                { label: "Liste des Hébergements", actions: ["Modifier"] },
                { label: "Ajouter Nouvel Hébergement", actions: ["Valider"] },
                { label: "Tarifs & Disponibilités", actions: ["Modifier", "Valider"] },
                { label: "Photos & Équipements", actions: ["Modifier", "Valider"] }
              ]}
            />
            {/* Gestion Voitures */}
            <ManagementBlock 
              title="Gestion des Locations de Voitures" 
              color="teal"
              items={[
                { label: "Liste des Véhicules", actions: ["Modifier", "Valider"] },
                { label: "Ajouter Nouveau Véhicule", actions: ["Modifier", "Valider"] },
                { label: "Tarifs & Disponibilités", actions: ["Modifier", "Valider"] },
                { label: "Documents Véhicules", actions: ["Vérifier", "Approuver"] }
              ]}
            />
            {/* Gestion Circuits */}
            <ManagementBlock 
              title="Gestion des Circuits & Activités" 
              color="orange"
              items={[
                { label: "Liste des Circuits", actions: ["Modifier", "Valider", "Supprimer"] },
                { label: "Ajouter Nouveau Circuit", actions: ["Valider", "Supprimer"] },
                { label: "Tarifs & Dates", actions: ["Modifier", "Valider"] },
                { label: "Itinéraires", actions: ["Modifier", "Valider"] }
              ]}
            />
          </div>

          {/* BOTTOM ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Réservations en cours */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm rounded-none h-full">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Réservations en Cours</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 font-bold">Valider</Button>
                    <Button size="sm" variant="destructive" className="h-8 font-bold">Annuler</Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 h-8 font-bold">Rembourser</Button>
                  </div>
                  <div className="space-y-3 mt-6">
                    <BookingItem name="Riad Dar Al-Andalus" type="Hôtel" status="pending" />
                    <BookingItem name="Dacia Duster 4x4" type="Voiture" status="approved" />
                    <BookingItem name="Safari Sahara" type="Circuit" status="refunded" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gestion Utilisateurs */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Gestion des Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <UserManagementRow label="Clients" actions={["Modifier", "Bloquer"]} />
                  <UserManagementRow label="Partenaires" actions={["Vérifier", "Approuver", "Désactiver"]} />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Messagerie & Notifications</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-3">
                  <Button className="bg-blue-700 hover:bg-blue-800 font-bold h-10">Gérer Messages</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-10">Envoyer Alertes</Button>
                </CardContent>
              </Card>
            </div>

            {/* Rapports & Analyses */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Rapports & Analyses</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col gap-3">
                  <Button className="bg-blue-700 hover:bg-blue-800 font-bold h-10">Voir Statistiques</Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-10">Exporter CSV / PDF</Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-none bg-slate-50 border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">Paramètres & Sécurité</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-3">
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 h-9 font-bold bg-green-600 text-white border-none hover:bg-green-700">Config. Paiements</Button>
                    <Button variant="outline" className="flex-1 h-9 font-bold bg-green-600 text-white border-none hover:bg-green-700">Gestion Taxes</Button>
                  </div>
                  <Button variant="outline" className="w-full h-9 font-bold bg-green-600 text-white border-none hover:bg-green-700">Sauvegardes & Accès</Button>
                </CardContent>
              </Card>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   COMPOSANTS INTERNES
-------------------------------------------------------------------*/

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

function SidebarItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={cn(
      "px-6 py-3.5 flex items-center gap-4 cursor-pointer transition-colors border-l-4",
      active ? "bg-slate-700 text-white border-primary" : "border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-white"
    )}>
      <span className={active ? "text-primary" : "text-slate-500"}>{icon}</span>
      <span className="text-[13px] font-bold">{label}</span>
    </div>
  );
}

function KpiCard({ title, value, icon, color, sub }: { title: string, value: string, icon: any, color: string, sub: string }) {
  const colorClasses = {
    "blue": "text-blue-600",
    "dark-blue": "text-blue-900",
    "green": "text-green-600",
    "orange": "text-orange-600"
  };
  
  return (
    <Card className="border-none shadow-sm rounded-none overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          </div>
          <div className={cn("p-2 bg-slate-50 rounded-lg", colorClasses[color as keyof typeof colorClasses])}>
            {icon}
          </div>
        </div>
        <Button className={cn("w-full h-8 text-[10px] font-black uppercase tracking-widest", 
          color === 'blue' ? "bg-blue-600" : 
          color === 'dark-blue' ? "bg-blue-900" : 
          color === 'green' ? "bg-green-600" : "bg-orange-600"
        )}>
          {sub}
        </Button>
      </CardContent>
    </Card>
  );
}

function ManagementBlock({ title, items, color }: { title: string, items: any[], color: "blue" | "teal" | "orange" }) {
  const bgColor = color === 'blue' ? "bg-[#34547A]" : color === 'teal' ? "bg-[#4A7C8C]" : "bg-[#E67E22]";
  
  return (
    <Card className={cn("border-none shadow-lg rounded-none text-white overflow-hidden", bgColor)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-black uppercase tracking-tight opacity-90">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-6 space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
            <span className="text-[11px] font-bold opacity-80 flex items-center gap-2">
              <span className="h-1 w-1 bg-white rounded-full" />
              {item.label}
            </span>
            <div className="flex gap-1">
              {item.actions.map((act: string) => (
                <button key={act} className={cn(
                  "px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded transition-all",
                  act === 'Modifier' ? "bg-green-600 hover:bg-green-700" : 
                  act === 'Valider' || act === 'Approuver' ? "bg-green-600 hover:bg-green-700" :
                  act === 'Supprimer' ? "bg-red-600 hover:bg-red-700" : "bg-red-600"
                )}>
                  {act}
                </button>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function BookingItem({ name, type, status }: { name: string, type: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-lg group hover:border-primary/30 transition-all">
      <div className="flex items-center gap-3">
        <div className="bg-slate-50 p-2 rounded-lg">
          {type === 'Hôtel' ? <Building className="h-4 w-4 text-blue-600" /> : type === 'Voiture' ? <Car className="h-4 w-4 text-teal-600" /> : <Compass className="h-4 w-4 text-orange-600" />}
        </div>
        <div>
          <p className="text-xs font-black text-slate-800 leading-none mb-1">{name}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">{type}</p>
        </div>
      </div>
      <Badge variant="outline" className={cn(
        "text-[9px] font-black uppercase tracking-tighter",
        status === 'pending' ? "text-orange-500 border-orange-200 bg-orange-50" :
        status === 'approved' ? "text-green-500 border-green-200 bg-green-50" : "text-slate-400"
      )}>
        {status}
      </Badge>
    </div>
  );
}

function UserManagementRow({ label, actions }: { label: string, actions: string[] }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-black text-slate-700 flex items-center gap-2">
        <span className="h-1.5 w-1.5 bg-primary rounded-full" />
        {label}
      </span>
      <div className="flex gap-1">
        {actions.map(act => (
          <button key={act} className={cn(
            "px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded",
            act === 'Modifier' || act === 'Vérifier' ? "bg-green-600 text-white" : "bg-red-600 text-white"
          )}>
            {act}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectDateRange() {
  return (
    <div className="flex items-center gap-2 bg-slate-50 border rounded-lg px-3 py-1.5 cursor-pointer hover:bg-white transition-all shadow-sm">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Janv 2022 – Déc 2022</span>
      <ArrowDownRight className="h-3 w-3 text-slate-400" />
    </div>
  );
}
