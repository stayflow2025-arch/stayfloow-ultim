
"use client";

import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Calendar, Building, Car, Compass, Users, 
  MessageSquare, BarChart3, Settings, Search, Bell, 
  ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, 
  Clock, Euro, Percent, UserPlus, ShieldCheck, Download,
  ExternalLink, Trash2, Edit3, MoreVertical, Puzzle, Zap, ShieldAlert,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Line 
} from 'recharts';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

// Email autorisé pour l'admin (à changer par le vôtre)
const ADMIN_EMAIL = "stayflow2025@gmail.com";

const chartData = [
  { name: 'Jan', res: 400, rev: 2400 },
  { name: 'Fév', res: 300, rev: 1398 },
  { name: 'Mar', res: 200, rev: 9800 },
  { name: 'Avr', res: 278, rev: 3908 },
  { name: 'Mai', res: 189, rev: 4800 },
  { name: 'Juin', res: 239, rev: 3800 },
  { name: 'Juil', res: 349, rev: 4300 },
];

export default function AdminDashboardMaster() {
  const { user, loading: authLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Fetch real listings for stats
  const listingsRef = collection(db, 'listings');
  const { data: listings, loading: listingsLoading } = useCollection(listingsRef);

  // Protection de la page
  useEffect(() => {
    if (!authLoading && (!user || user.email !== ADMIN_EMAIL)) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || listingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="font-black uppercase tracking-widest animate-pulse">StayFloow Engine Loading...</p>
        </div>
      </div>
    );
  }

  // Calcul des statistiques réelles
  const totalListings = listings?.length || 0;
  const pendingCount = listings?.filter(l => l.status === 'pending').length || 0;
  const approvedCount = listings?.filter(l => l.status === 'approved').length || 0;
  const estimatedRevenue = listings?.filter(l => l.status === 'approved').reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans text-slate-700">
      {/* HEADER TABS */}
      <header className="bg-slate-800 text-white flex items-center h-16 shadow-lg z-50">
        <div className="w-64 flex items-center justify-center border-r border-slate-700 h-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg"><LayoutDashboard className="h-5 w-5" /></div>
            <span className="font-black tracking-tighter text-xl uppercase">StayFloow<span className="text-secondary text-xs">.admin</span></span>
          </Link>
        </div>
        <nav className="flex-1 flex h-full">
          <HeaderTab icon={<LayoutDashboard />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <HeaderTab icon={<Calendar />} label="Réservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
          <HeaderTab icon={<Building />} label="Hébergements" active={activeTab === 'hotels'} onClick={() => setActiveTab('hotels')} />
          <HeaderTab icon={<Puzzle />} label="Extensions" active={activeTab === 'extensions'} onClick={() => setActiveTab('extensions')} />
        </nav>
        <div className="px-6 flex items-center gap-4 border-l border-slate-700 h-full">
          <Badge className="bg-green-600 border-none font-black text-[10px]">SERVEUR ACTIF</Badge>
          <div className="h-8 w-8 rounded-full bg-primary border-2 border-primary/20 flex items-center justify-center font-black text-xs">AD</div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700 shrink-0 shadow-2xl">
          <div className="flex-1 py-6">
            <SidebarItem icon={<LayoutDashboard />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<Calendar />} label="Réservations" active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} />
            <SidebarItem icon={<Puzzle />} label="Extensions" active={activeTab === 'extensions'} onClick={() => setActiveTab('extensions')} />
            <div className="my-4 border-t border-slate-700 mx-4" />
            <SidebarItem icon={<Users />} label="Utilisateurs" />
            <SidebarItem icon={<UserPlus />} label="Partenaires" />
            <SidebarItem icon={<BarChart3 />} label="Rapports" />
            <SidebarItem icon={<Settings />} label="Paramètres" />
          </div>
          <div className="p-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center border-t border-slate-700">
            StayFloow Engine v3.2
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {activeTab === 'dashboard' && (
            <>
              {/* KPI ROW */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiCard title="Total Annonces" value={totalListings.toString()} icon={<Building />} color="blue" sub="Gérer le parc" />
                <KpiCard title="Revenus Est." value={`${estimatedRevenue.toLocaleString()} DA`} icon={<Euro />} color="dark-blue" sub="Voir Rapport" />
                <KpiCard title="En attente" value={pendingCount.toString()} icon={<Clock />} color="orange" sub="Valider" />
                <KpiCard title="Approuvées" value={approvedCount.toString()} icon={<CheckCircle2 />} color="green" sub="Analyses" />
              </div>

              {/* TRENDS CHART */}
              <Card className="border-none shadow-sm rounded-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest">Tendances de Réservation</CardTitle>
                  <Badge variant="outline" className="font-bold border-slate-200">Année 2026</Badge>
                </CardHeader>
                <CardContent className="h-[300px] w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
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
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* MANAGEMENT GRIDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <ManagementBlock 
                  title="Gestion Hébergements" 
                  color="blue"
                  items={[
                    { label: "Annonces à valider", count: pendingCount, link: "/admin/validate" },
                    { label: "Propriétés actives", count: approvedCount, link: "/search" },
                    { label: "Signalements", count: 0, link: "#" }
                  ]}
                />
                <ManagementBlock 
                  title="Gestion Flotte" 
                  color="teal"
                  items={[
                    { label: "Véhicules en attente", count: 0, link: "#" },
                    { label: "Contrats d'assurance", count: 12, link: "#" },
                    { label: "Documents expirés", count: 2, link: "#" }
                  ]}
                />
                <ManagementBlock 
                  title="Gestion Circuits" 
                  color="orange"
                  items={[
                    { label: "Nouveaux circuits", count: 0, link: "#" },
                    { label: "Guides certifiés", count: 8, link: "#" },
                    { label: "Calendriers", count: 15, link: "#" }
                  ]}
                />
              </div>
            </>
          )}

          {activeTab === 'extensions' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">StayFloow App Marketplace</h2>
                <p className="text-slate-500 font-medium">Téléchargez et installez des extensions pour booster votre plateforme.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <ExtensionCard 
                  title="Paiement BaridiMob / CCP" 
                  desc="Intégration native des paiements locaux algériens pour vos partenaires." 
                  status="installed"
                  icon={<Euro className="h-8 w-8" />}
                />
                <ExtensionCard 
                  title="Optimiseur SEO Pro" 
                  desc="Générez automatiquement des balises méta pour chaque nouvelle annonce via l'IA." 
                  status="available"
                  icon={<Zap className="h-8 w-8" />}
                />
                <ExtensionCard 
                  title="Analytics Avancé" 
                  desc="Suivi précis des comportements utilisateurs et heatmaps thermiques." 
                  status="available"
                  icon={<BarChart3 className="h-8 w-8" />}
                />
                <ExtensionCard 
                  title="Module Assurance Voyage" 
                  desc="Proposez une assurance automatique lors de chaque réservation." 
                  status="available"
                  icon={<ShieldCheck className="h-8 w-8" />}
                />
                <ExtensionCard 
                  title="Traducteur IA Automatique" 
                  desc="Traduisez instantanément les annonces partenaires en 4 langues." 
                  status="installed"
                  icon={<Globe className="h-8 w-8" />}
                />
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-6 animate-in fade-in">
               <Card className="border-none shadow-xl rounded-2xl">
                  <CardHeader className="bg-slate-50 border-b">
                    <CardTitle className="text-lg font-black">Historique Global des Réservations</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                      <Calendar className="h-20 w-20 opacity-20 mb-4" />
                      <p className="font-bold">Aucune réservation à afficher pour cette période.</p>
                    </div>
                  </CardContent>
               </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   COMPOSANTS INTERNES
-------------------------------------------------------------------*/

function HeaderTab({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 flex items-center gap-3 font-bold text-sm transition-all border-b-4",
        active ? "bg-slate-700/50 border-primary text-white" : "border-transparent text-slate-400 hover:bg-slate-700 hover:text-white"
      )}
    >
      <span className={cn("h-4 w-4", active ? "text-primary" : "text-slate-500")}>{icon}</span>
      {label}
    </button>
  );
}

function SidebarItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "px-6 py-3.5 flex items-center gap-4 cursor-pointer transition-colors border-l-4",
        active ? "bg-slate-700 text-white border-primary" : "border-transparent text-slate-400 hover:bg-slate-700/50 hover:text-white"
      )}
    >
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
              {item.label} ({item.count})
            </span>
            <Link href={item.link}>
              <button className="px-2 py-1 bg-white/10 hover:bg-white/20 text-[9px] font-black uppercase tracking-tighter rounded transition-all">
                Gérer
              </button>
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExtensionCard({ title, desc, status, icon }: { title: string, desc: string, status: 'installed' | 'available', icon: any }) {
  return (
    <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white group hover:scale-[1.02] transition-all">
      <CardContent className="p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="p-4 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary/10 transition-colors">
            {icon}
          </div>
          {status === 'installed' ? (
            <Badge className="bg-green-600 border-none font-black text-[10px]">INSTALLÉ</Badge>
          ) : (
            <Badge variant="outline" className="text-slate-400 border-slate-200 text-[10px]">MODULE</Badge>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
        </div>
        <Button className={cn(
          "w-full h-12 font-black rounded-xl",
          status === 'installed' ? "bg-slate-100 text-slate-400" : "bg-primary hover:bg-primary/90 text-white"
        )}>
          {status === 'installed' ? "Gérer l'application" : "Installer maintenant"}
        </Button>
      </CardContent>
    </Card>
  );
}
