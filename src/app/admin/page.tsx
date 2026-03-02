
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  LayoutDashboard, Building, Clock, 
  CheckCircle2, Euro, Loader2, Users, TrendingUp, Tag, Plus, 
  ArrowRight, ShieldCheck, Wallet, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";

const ADMIN_EMAILS = ["stayflow2025@gmail.com", "kiosque.du.passage@gmail.com"];

export default function AdminDashboardMaster() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState("dashboard");

  const isAdmin = useMemo(() => user && ADMIN_EMAILS.includes(user.email || ""), [user]);

  // DATA FETCHING REAL-TIME - Sécurisé par la vérification isAdmin
  const listingsRef = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);
  const { data: listings } = useCollection(listingsRef);

  const usersRef = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, 'users'), limit(1000));
  }, [db, isAdmin]);
  const { data: usersData } = useCollection(usersRef);

  const bookingsRef = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin]);
  const { data: bookings } = useCollection(bookingsRef);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (!ADMIN_EMAILS.includes(user.email || "")) {
        router.replace("/profile");
      }
    }
  }, [user, isUserLoading, router]);

  const stats = useMemo(() => {
    return {
      totalListings: listings?.length || 0,
      pendingListings: listings?.filter(l => l.status === 'pending').length || 0,
      totalUsers: usersData?.length || 0,
      totalRevenue: bookings?.filter(b => b.status === 'approved').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0,
      bookingsToday: bookings?.filter(b => {
        const d = new Date(b.createdAt);
        return d.toDateString() === new Date().toDateString();
      }).length || 0,
    };
  }, [listings, usersData, bookings]);

  if (isUserLoading || !user || !isAdmin) {
    return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans">
      <header className="bg-slate-800 text-white flex items-center h-16 shadow-lg z-50">
        <div className="w-64 flex items-center justify-center border-r border-slate-700 h-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg"><LayoutDashboard className="h-5 w-5" /></div>
            <span className="font-black tracking-tighter text-xl uppercase">StayFloow<span className="text-secondary text-xs">.admin</span></span>
          </Link>
        </div>
        <div className="flex-1 px-8">
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-400">Master Control Panel</h1>
        </div>
        <div className="px-6 flex items-center gap-4">
          <Badge className="bg-green-600 border-none font-black text-[10px]">LIVE SYNC ACTIVE</Badge>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-slate-800 text-slate-300 flex flex-col border-r border-slate-700 shrink-0">
          <div className="flex-1 py-6 space-y-1">
            <SidebarItem icon={<LayoutDashboard />} label="Tableau de Bord" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<Building />} label="Catalogue Maître" onClick={() => router.push('/admin/catalog')} />
            <SidebarItem icon={<Users />} label="Utilisateurs" onClick={() => router.push('/admin/users')} />
            <SidebarItem icon={<Clock />} label="Validations" onClick={() => router.push('/admin/validate')} />
            <SidebarItem icon={<Wallet />} label="Finance & Paiements" onClick={() => router.push('/admin/finance')} />
            <SidebarItem icon={<MessageSquare />} label="Support Client" onClick={() => router.push('/admin/messaging')} />
            <SidebarItem icon={<Tag />} label="Paramètres Site" onClick={() => router.push('/admin/settings')} />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Performances Globales</h2>
              <p className="text-slate-500 font-medium">Données synchronisées en temps réel avec Firestore.</p>
            </div>
            <div className="flex gap-3">
               <Button variant="outline" className="bg-white border-none shadow-sm font-black" onClick={() => router.push('/admin/finance')}>Rapports Finance</Button>
               <Button className="bg-primary hover:bg-primary/90 font-black rounded-xl" onClick={() => router.push('/partners/join')}>+ Nouvelle Annonce</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KpiCard title="Annonces Totales" value={stats.totalListings.toString()} icon={<Building />} color="blue" sub="Gérer l'inventaire" onClick={() => router.push('/admin/catalog')} />
            <KpiCard title="Utilisateurs" value={stats.totalUsers.toString()} icon={<Users />} color="dark-blue" sub="Liste membres" onClick={() => router.push('/admin/users')} />
            <KpiCard title="En attente" value={stats.pendingListings.toString()} icon={<Clock />} color="orange" sub="Vérifier" onClick={() => router.push('/admin/validate')} />
            <KpiCard title="Chiffre d'Affaires" value={formatPrice(stats.totalRevenue)} icon={<TrendingUp />} color="green" sub="Voir détails" onClick={() => router.push('/admin/finance')} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b p-6">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Croissance Réservations
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[350px] p-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="val" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorChart)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b p-6">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" /> Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {bookings?.slice(0, 5).map((b: any) => (
                    <div key={b.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                          <Tag className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 truncate max-w-[150px]">{b.itemName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{b.status}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-primary">{formatPrice(b.totalPrice)}</p>
                    </div>
                  ))}
                  {(!bookings || bookings.length === 0) && (
                    <p className="text-center text-slate-400 font-bold py-10">Aucune activité.</p>
                  )}
                </div>
                <Button variant="ghost" className="w-full mt-6 text-xs font-black uppercase text-slate-400 hover:text-primary" onClick={() => router.push('/admin/catalog')}>
                  Voir tout le catalogue <ArrowRight className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

const chartData = [
  { name: 'Lun', val: 400 },
  { name: 'Mar', val: 300 },
  { name: 'Mer', val: 600 },
  { name: 'Jeu', val: 800 },
  { name: 'Ven', val: 500 },
  { name: 'Sam', val: 900 },
  { name: 'Dim', val: 700 },
];

function SidebarItem({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "px-6 py-3.5 flex items-center gap-4 cursor-pointer transition-all border-l-4",
        active ? "bg-slate-700/50 text-white border-primary" : "border-transparent text-slate-400 hover:bg-slate-700/30 hover:text-white"
      )}
    >
      <span className={cn("h-4 w-4", active ? "text-primary" : "text-slate-500")}>{icon}</span>
      <span className="text-[13px] font-bold">{label}</span>
    </div>
  );
}

function KpiCard({ title, value, icon, color, sub, onClick }: { title: string, value: string, icon: any, color: string, sub: string, onClick: () => void }) {
  const colors: any = {
    "blue": "text-blue-600 bg-blue-50",
    "dark-blue": "text-indigo-600 bg-indigo-50",
    "green": "text-emerald-600 bg-emerald-50",
    "orange": "text-orange-600 bg-orange-50"
  };
  
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden group bg-white hover:shadow-xl transition-all cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className={cn("p-3 rounded-2xl", colors[color])}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          </div>
        </div>
        <p className="text-[10px] font-black text-primary uppercase tracking-tighter flex items-center gap-1">
          {sub} <ArrowRight className="h-2.5 w-2.5" />
        </p>
      </CardContent>
    </Card>
  );
}
