
"use client";

import React, { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { 
  Building, Calendar, CreditCard, MessageSquare, 
  TrendingUp, Users, ArrowRight, Loader2, Star, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

export default function PartnerDashboardPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // 1. Charger les annonces du partenaire
  const listingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "listings"), where("ownerId", "==", user.uid));
  }, [db, user]);
  const { data: listings, isLoading: listingsLoading } = useCollection(listingsRef);

  // 2. Charger les réservations reçues
  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "bookings"), where("partnerId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
  }, [db, user]);
  const { data: bookings, isLoading: bookingsLoading } = useCollection(bookingsRef);

  // Calcul des statistiques
  const stats = useMemo(() => {
    if (!listings || !bookings) return { active: 0, pending: 0, revenue: 0, bookingsCount: 0 };
    return {
      active: listings.filter(l => l.status === 'approved').length,
      pending: listings.filter(l => l.status === 'pending').length,
      bookingsCount: bookings.length,
      revenue: bookings.filter(b => b.status === 'approved').reduce((acc, b) => acc + (b.totalPrice || 0), 0) * 0.85
    };
  }, [listings, bookings]);

  if (isUserLoading || listingsLoading || bookingsLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  if (!user) {
    router.replace("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Partenaire */}
      <header className="bg-primary text-white py-12 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Bonjour, {user.displayName || 'Partenaire'} !</h1>
            <p className="text-white/80 font-medium">Votre centre de commande StayFloow en temps réel.</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-black" asChild>
              <Link href="/partners/join">Ajouter une offre</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 -mt-10 space-y-8">
        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Annonces Actives" value={stats.active.toString()} icon={<Building />} color="green" />
          <StatCard title="En attente" value={stats.pending.toString()} icon={<Eye />} color="orange" />
          <StatCard title="Réservations" value={stats.bookingsCount.toString()} icon={<Calendar />} color="blue" />
          <StatCard title="Gains Nets" value={formatPrice(stats.revenue)} icon={<CreditCard />} color="dark" highlight />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* DERNIÈRES RÉSERVATIONS */}
          <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b p-8">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Réservations Récentes</CardTitle>
                  <CardDescription>Suivi des demandes entrantes.</CardDescription>
                </div>
                <Button variant="ghost" className="text-primary font-black uppercase text-xs" onClick={() => router.push('/partners/bookings')}>
                  Tout gérer <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-bold pl-8 py-4">Service</TableHead>
                    <TableHead className="font-bold">Client</TableHead>
                    <TableHead className="font-bold">Prix Brut</TableHead>
                    <TableHead className="text-right font-bold pr-8">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.map((b: any) => (
                    <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/partners/bookings?id=${b.id}`)}>
                      <TableCell className="font-black text-slate-700 pl-8">{b.itemName}</TableCell>
                      <TableCell className="text-sm font-medium text-slate-500">{b.customerName || 'Voyageur'}</TableCell>
                      <TableCell className="font-black text-slate-900">{formatPrice(b.totalPrice)}</TableCell>
                      <TableCell className="text-right pr-8">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase",
                          b.status === 'approved' ? "bg-green-600" : b.status === 'pending' ? "bg-amber-500" : "bg-red-600"
                        )}>{b.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!bookings || bookings.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-40 text-center text-slate-400 font-bold italic">
                        Aucune réservation pour le moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* SIDEBAR MESSAGES */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-50/50 border-b p-8">
                <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" /> Messages
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-slate-400 text-sm font-medium mb-6">Communiquez directement avec vos clients voyageurs.</p>
                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-xl shadow-lg" onClick={() => router.push('/partners/messaging')}>
                  Ouvrir la Messagerie
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-2xl rounded-3xl p-8 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" /> Booster mes ventes
                </h3>
                <p className="text-white/60 text-xs font-medium leading-relaxed">
                  Activez l'offre "StayFloow Direct" pour permettre la réservation instantanée et augmenter votre visibilité de 40%.
                </p>
                <Button className="mt-6 bg-secondary text-primary hover:bg-white font-black w-full h-12 rounded-xl transition-all">
                  Activer maintenant
                </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color, highlight = false }: any) {
  const colors: any = {
    "green": "bg-green-50 text-green-600",
    "orange": "bg-orange-50 text-orange-600",
    "blue": "bg-blue-50 text-blue-600",
    "dark": "bg-slate-900 text-white"
  };

  return (
    <Card className={cn(
      "border-none shadow-lg rounded-3xl p-6 transition-all hover:scale-[1.02]",
      highlight ? "bg-slate-900 text-white" : "bg-white"
    )}>
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl", highlight ? "bg-white/10 text-white" : colors[color])}>
          {icon}
        </div>
        <Badge className={highlight ? "bg-secondary text-primary" : "bg-slate-100 text-slate-400"}>LIVE</Badge>
      </div>
      <div>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
      </div>
    </Card>
  );
}
