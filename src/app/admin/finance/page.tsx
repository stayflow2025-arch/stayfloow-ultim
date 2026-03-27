"use client";

import React, { useMemo, useEffect } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { 
  Wallet, Download, ArrowLeft, Loader2, 
  Euro, CreditCard, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import { checkIsAdmin } from "@/lib/admin-config";

export default function AdminFinancePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { formatPrice } = useCurrency();

  // Détection robuste de l'administrateur
  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Chargement sécurisé des réservations uniquement si Admin confirmé
  const bookingsRef = useMemoFirebase(() => {
    if (!isAdmin || !db || isUserLoading || !user) return null;
    return query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  }, [db, isAdmin, isUserLoading, user]);
  
  const { data: bookings, isLoading } = useCollection(bookingsRef);

  const stats = useMemo(() => {
    const total = bookings?.filter(b => b.status === 'approved').reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
    const commission = total * 0.15; // 15% Plateforme
    return { total, commission, netPartner: total - commission };
  }, [bookings]);

  if (isUserLoading || !user || !isAdmin) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-800 text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Finance & Revenus</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Suivi des flux monétaires</p>
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20 font-black h-12 px-6 rounded-xl hover:bg-white/10">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FinanceKpiCard title="Volume Total" value={formatPrice(stats.total)} desc="Ventes brutes enregistrées" icon={<Wallet/>} color="blue" />
              <FinanceKpiCard title="Commissions StayFloow" value={formatPrice(stats.commission)} desc="15% de frais plateforme" icon={<ArrowUpRight/>} color="green" highlight />
              <FinanceKpiCard title="Revenus Partenaires" value={formatPrice(stats.netPartner)} desc="À reverser aux hôtes" icon={<CreditCard/>} color="dark" />
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Historique des Transactions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black text-[10px] uppercase pl-8 py-6">ID Transaction</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Service</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Montant Brut</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Part Plateforme</TableHead>
                      <TableHead className="font-black text-[10px] uppercase">Date</TableHead>
                      <TableHead className="font-black text-[10px] uppercase pr-8 text-right">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((b: any) => (
                      <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-bold text-slate-400 pl-8">#TX-{b.id.substring(0,8)}</TableCell>
                        <TableCell className="font-black text-slate-900">{b.itemName}</TableCell>
                        <TableCell className="font-black text-slate-900">{formatPrice(b.totalPrice)}</TableCell>
                        <TableCell className="font-bold text-emerald-600">+{formatPrice(b.totalPrice * 0.15)}</TableCell>
                        <TableCell className="text-slate-500 text-xs font-bold">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="pr-8 text-right">
                          <Badge className={cn(
                            "font-black text-[9px] uppercase",
                            b.status === 'approved' ? "bg-green-600" : "bg-slate-400"
                          )}>{b.status === 'approved' ? 'Encaissé' : b.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!bookings || bookings.length === 0) && (
                  <div className="py-32 text-center">
                    <Euro className="h-12 w-12 text-slate-100 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Aucune transaction trouvée.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function FinanceKpiCard({ title, value, desc, icon, highlight = false }: any) {
  return (
    <Card className={cn(
      "border-none shadow-lg rounded-3xl p-8 relative overflow-hidden",
      highlight ? "bg-slate-900 text-white" : "bg-white text-slate-900"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl", highlight ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-400")}>
          {icon}
        </div>
        <Badge className={highlight ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}>LIVE</Badge>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
      </div>
      <p className="mt-4 text-xs font-medium opacity-40 italic">{desc}</p>
      {highlight && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />}
    </Card>
  );
}