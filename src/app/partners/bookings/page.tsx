
"use client";

import React, { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { 
  Calendar, User, CheckCircle2, XCircle, 
  ArrowLeft, Loader2, Search, Filter, 
  MapPin, Clock, MessageSquare, Phone
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
import { useToast } from "@/hooks/use-toast";

export default function PartnerBookingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();

  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, "bookings"), where("partnerId", "==", user.uid), orderBy("createdAt", "desc"));
  }, [db, user]);
  
  const { data: bookings, isLoading } = useCollection(bookingsRef);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: newStatus });
      toast({ title: "Statut mis à jour", description: `La réservation est désormais : ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de modifier le statut." });
    }
  };

  if (isUserLoading || isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white py-8 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/partners/dashboard')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Réservations Reçues</h1>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{bookings?.length || 0} demandes au total</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
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
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {booking.id.substring(0,8)}</span>
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
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Votre Revenu Net</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(booking.totalPrice * 0.85)}</p>
                    <p className="text-[9px] font-bold text-slate-400 italic">(-15% commission plateforme)</p>
                  </div>

                  <div className="flex flex-col justify-center items-end gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <Button onClick={() => handleStatusUpdate(booking.id, 'approved')} className="w-full h-12 bg-green-600 hover:bg-green-700 font-black rounded-xl">Accepter</Button>
                        <Button onClick={() => handleStatusUpdate(booking.id, 'rejected')} variant="outline" className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 font-black rounded-xl">Refuser</Button>
                      </>
                    )}
                    <Button variant="ghost" onClick={() => router.push(`/partners/messaging?id=${booking.id}`)} className="w-full text-slate-400 font-bold uppercase text-[10px]">
                      <MessageSquare className="mr-2 h-4 w-4" /> Discuter avec le client
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(!bookings || bookings.length === 0) && (
            <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
              <Calendar className="h-16 w-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-400">Aucune réservation pour le moment.</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
