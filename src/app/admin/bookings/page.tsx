"use client";

import React, { useMemo, useEffect } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { 
  Calendar, User, ArrowLeft, Loader2, Search, Filter, 
  ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { checkIsAdmin } from "@/lib/admin-config";

export default function AdminBookingsPage() {
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

  // On attend que isAdmin soit formellement TRUE avant de lancer la requête Firestore globale
  const bookingsRef = useMemoFirebase(() => {
    if (!isAdmin || !db || isUserLoading || !user) return null;
    return query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  }, [db, isAdmin, isUserLoading, user]);
  
  const { data: bookings, isLoading } = useCollection(bookingsRef);

  const handleStatusUpdate = (id: string, newStatus: string) => {
    if (!isAdmin) return;
    const docRef = doc(db, "bookings", id);
    updateDocumentNonBlocking(docRef, { status: newStatus });
  };

  if (isUserLoading || !isAdmin || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-primary h-12 w-12 mx-auto" />
          <p className="text-white/50 font-black uppercase tracking-widest text-[10px]">Vérification des accès administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-slate-800 text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Gestion des Réservations</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôle global ({bookings?.length || 0} transactions)</p>
            </div>
          </div>
          <Badge className="bg-green-600 border-none font-black text-[10px]">SYNC LIVE ACTIVE</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Rechercher par voyageur ou annonce..." className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold" />
          </div>
          <Button variant="outline" className="h-14 px-6 rounded-2xl bg-white border-none shadow-sm font-black uppercase text-[10px]"><Filter className="mr-2 h-4 w-4" /> Filtres</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings?.map((booking: any) => (
              <Card key={booking.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all border-l-8 border-l-primary/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "font-black text-[9px] uppercase",
                          booking.status === 'approved' ? "bg-green-600" : booking.status === 'pending' ? "bg-amber-500" : "bg-red-600"
                        )}>{booking.status}</Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {booking.id}</span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">{booking.itemName}</h3>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <User className="h-4 w-4 text-primary" /> {booking.customerName}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Calendar className="h-4 w-4 text-primary" /> {booking.startDate ? format(new Date(booking.startDate), "dd MMM yyyy", { locale: fr }) : '...'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center border-l border-slate-50 pl-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Montant Transaction</p>
                      <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(booking.totalPrice)}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-green-600 font-bold text-[10px]">
                        <ShieldCheck className="h-3 w-3" /> PAIEMENT SÉCURISÉ
                      </div>
                    </div>

                    <div className="flex flex-col justify-center items-end gap-3">
                      <Button onClick={() => handleStatusUpdate(booking.id, 'approved')} className="w-full h-12 bg-green-600 hover:bg-green-700 font-black rounded-xl">Approuver</Button>
                      <Button onClick={() => handleStatusUpdate(booking.id, 'rejected')} variant="outline" className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 font-black rounded-xl">Refuser</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}