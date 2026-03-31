
"use client";

import React, { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Calendar, MapPin, MessageSquare, Clock, CheckCircle2, 
  ChevronRight, ArrowLeft, Loader2, Info, XCircle, ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { CrossSellCard } from "@/components/cross-sell-card";
import { CheckCircle } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { fr } from "date-fns/locale";

function UserBookingsContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';

  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: bookings, isLoading } = useCollection(bookingsRef);

  const categorized = useMemo(() => {
    if (!bookings) return { upcoming: [], ongoing: [], past: [] };
    const now = new Date();
    
    const safeDate = (dateStr: any) => {
      if (!dateStr) return new Date();
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    };

    return {
      upcoming: bookings.filter(b => safeDate(b.startDate) > now),
      ongoing: bookings.filter(b => {
        const start = safeDate(b.startDate);
        const end = b.endDate ? safeDate(b.endDate) : addDays(start, 1);
        return start <= now && end >= now;
      }),
      past: bookings.filter(b => {
        const end = b.endDate ? safeDate(b.endDate) : safeDate(b.startDate);
        return end < now;
      }),
    };
  }, [bookings]);

  const handleContactHost = async (booking: any) => {
    const convId = `conv_${booking.userId}_${booking.partnerId}`;
    const convRef = doc(db, "conversations", convId);
    
    await setDoc(convRef, {
      participants: [booking.userId, booking.partnerId],
      bookingId: booking.id,
      listingId: booking.listingId,
      lastMessage: "Demande d'info sur réservation",
      lastAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    }, { merge: true });

    router.push(`/profile/messages?id=${convId}`);
  };

  if (isUserLoading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {isSuccess && (
        <div className="bg-white border-b shadow-2xl animate-in fade-in zoom-in-95 duration-700">
           <div className="max-w-5xl mx-auto py-20 px-8 text-center space-y-8">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
                <CheckCircle className="h-24 w-24 text-green-500 mx-auto relative z-10 animate-bounce" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Réservation Confirmée !</h2>
                <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Votre paiement a été reçu avec succès. Un e-mail de confirmation vient de vous être envoyé.</p>
              </div>
              <div className="pt-4">
                <Button onClick={() => router.replace('/profile/bookings')} variant="outline" className="rounded-2xl h-14 px-10 font-black border-2 border-slate-100 hover:border-primary transition-all">
                  Consulter mes séjours
                </Button>
              </div>
              
              {/* Cross-Sell Suggestions */}
              <CrossSellCard location="votre destination" bookedItemType="property" />
           </div>
        </div>
      )}

      <header className="bg-primary text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Mes Réservations</h1>
              <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{bookings?.length || 0} séjours enregistrés</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <Tabs defaultValue="upcoming" className="space-y-10">
          <TabsList className="bg-white p-1 rounded-2xl border shadow-sm h-14 w-full md:w-fit">
            <TabsTrigger value="upcoming" className="rounded-xl px-10 font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-white">À venir</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-xl px-10 font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-white">En cours</TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-10 font-black text-xs uppercase data-[state=active]:bg-primary data-[state=active]:text-white">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BookingList items={categorized.upcoming} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Prêt pour votre prochain voyage ? Trouvez votre destination idéale." />
          </TabsContent>
          
          <TabsContent value="ongoing" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BookingList items={categorized.ongoing} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Aucun séjour en cours actuellement." />
          </TabsContent>
          
          <TabsContent value="past" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BookingList items={categorized.past} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Vous n'avez pas encore de voyages terminés." />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function UserBookingsPage() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <UserBookingsContent />
    </React.Suspense>
  );
}

function BookingList({ items, formatPrice, onContact, emptyMsg }: any) {
  if (items.length === 0) return (
    <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100 px-8">
      <Calendar className="h-16 w-16 text-slate-100 mx-auto mb-6" />
      <h3 className="text-xl font-bold text-slate-400 mb-4">{emptyMsg}</h3>
      <Button className="bg-primary hover:bg-primary/90 font-black px-8 h-12 rounded-xl" asChild><Link href="/">Explorer le catalogue</Link></Button>
    </div>
  );

  return items.map((booking: any) => (
    <Card key={booking.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all border-l-8 border-l-primary/20 group">
      <CardContent className="p-0 flex flex-col md:flex-row">
        <div className="relative w-full md:w-72 h-56 bg-slate-100 overflow-hidden shrink-0">
          <Image src={booking.itemImage || "https://placehold.co/400x300?text=StayFloow"} alt="Stay" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
          <div className="absolute top-4 left-4">
            <Badge className={cn(
              "font-black text-[9px] uppercase px-3 py-1 shadow-lg border-none",
              booking.status === 'approved' ? "bg-green-600" : booking.status === 'pending' ? "bg-amber-500" : "bg-red-600"
            )}>
              {booking.status === 'approved' ? 'CONFIRMÉ' : booking.status === 'pending' ? 'EN ATTENTE' : 'ANNULÉ'}
            </Badge>
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{booking.itemType}</span>
              <h3 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{booking.itemName}</h3>
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase pt-1">
                <MapPin className="h-3 w-3 text-primary" /> Emplacement certifié
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix Payé</p>
              <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(booking.totalPrice)}</p>
              <div className="flex items-center gap-1 justify-end mt-1 text-green-600 font-bold text-[9px]">
                <ShieldCheck className="h-3 w-3" /> PAIEMENT SÉCURISÉ
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-primary"><Clock className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Période du séjour</p>
                <p className="font-black text-slate-700 text-sm">
                  {(() => {
                    const start = new Date(booking.startDate);
                    if (isNaN(start.getTime())) return "Date inconnue";
                    const formattedStart = format(start, "dd MMM", { locale: fr });
                    
                    if (booking.endDate) {
                      const end = new Date(booking.endDate);
                      if (isNaN(end.getTime())) return formattedStart;
                      return `${formattedStart} — ${format(end, "dd MMM yyyy", { locale: fr })}`;
                    }
                    return formattedStart;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-3 rounded-2xl text-slate-400"><Info className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</p>
                <p className="font-black text-slate-700 text-sm">#{booking.reservationNumber || booking.id.substring(0,8)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button onClick={() => onContact(booking)} variant="outline" className="border-primary text-primary font-black rounded-xl h-12 flex-1 shadow-sm hover:bg-primary/5 uppercase text-[10px] tracking-widest">
              <MessageSquare className="mr-2 h-4 w-4" /> Contacter l'hôte
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl h-12 px-8 uppercase text-[10px] tracking-widest">
              Détails voyage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ));
}
