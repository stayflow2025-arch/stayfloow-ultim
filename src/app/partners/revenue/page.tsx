
"use client";

import React, { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { 
  TrendingUp, Wallet, ArrowLeft, Loader2, 
  CreditCard, ShieldCheck, Download, Calendar, DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

export default function PartnerRevenuePage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { formatPrice } = useCurrency();

  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "bookings"), where("partnerId", "==", user.uid), where("status", "==", "approved"));
  }, [db, user]);
  
  const { data: bookings, isLoading } = useCollection(bookingsRef);

  const stats = useMemo(() => {
    const total = bookings?.reduce((acc, b) => acc + (b.totalPrice || 0), 0) || 0;
    const net = total * 0.85;
    const commission = total * 0.15;
    return { total, net, commission };
  }, [bookings]);

  if (isUserLoading || isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-primary text-white py-8 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/partners/dashboard')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-black uppercase tracking-tight">Revenus & Finances</h1>
          </div>
          <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-black">
            <Download className="mr-2 h-4 w-4" /> Exporter PDF
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FinanceCard title="Volume d'affaires" value={formatPrice(stats.total)} desc="Montant total brut" icon={<TrendingUp/>} />
          <FinanceCard title="Commission StayFloow" value={formatPrice(stats.commission)} desc="15% de frais plateforme" icon={<ShieldCheck/>} />
          <FinanceCard title="Votre Revenu Net" value={formatPrice(stats.net)} desc="Prêt pour virement" icon={<Wallet/>} highlight />
        </div>

        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-slate-50 border-b p-8">
            <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Historique des Paiements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead className="font-black text-[10px] uppercase pl-8 py-6">ID</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Service</TableHead>
                  <TableHead className="font-black text-[10px] uppercase">Date</TableHead>
                  <TableHead className="font-black text-[10px] uppercase pr-8 text-right">Votre Part</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((b: any) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-bold text-slate-400 pl-8">#TX-{b.id.substring(0,6)}</TableCell>
                    <TableCell className="font-black text-slate-900">{b.itemName}</TableCell>
                    <TableCell className="text-slate-500 text-xs font-bold">{new Date(b.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="pr-8 text-right font-black text-emerald-600">
                      +{formatPrice(b.totalPrice * 0.85)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!bookings || bookings.length === 0) && (
              <div className="py-32 text-center text-slate-400 font-bold">Aucune transaction enregistrée.</div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function FinanceCard({ title, value, desc, icon, highlight = false }: any) {
  return (
    <Card className={cn(
      "border-none shadow-lg rounded-3xl p-8",
      highlight ? "bg-primary text-white" : "bg-white"
    )}>
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-3 rounded-2xl", highlight ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400")}>
          {icon}
        </div>
        <Badge className={highlight ? "bg-secondary text-primary" : "bg-slate-100 text-slate-400"}>TOTAL</Badge>
      </div>
      <div>
        <p className="text-3xl font-black tracking-tighter">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{title}</p>
      </div>
      <p className="mt-4 text-xs font-medium opacity-40 italic">{desc}</p>
    </Card>
  );
}
