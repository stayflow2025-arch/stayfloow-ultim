
"use client";

import React, { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, getDoc, setDoc } from "firebase/firestore";
import { 
  Calendar, MapPin, MessageSquare, Clock, CheckCircle2, 
  ChevronRight, ArrowLeft, Loader2, Info, XCircle 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useCurrency } from "@/context/currency-context";

export default function UserBookingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  const router = useRouter();

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
    return {
      upcoming: bookings.filter(b => new Date(b.startDate) > now),
      ongoing: bookings.filter(b => new Date(b.startDate) <= now && new Date(b.endDate) >= now),
      past: bookings.filter(b => new Date(b.endDate) < now),
    };
  }, [bookings]);

  const handleContactHost = async (booking: any) => {
    const convId = `conv_${booking.userId}_${booking.partnerId}`;
    const convRef = doc(db, "conversations", convId);
    const snap = await getDoc(convRef);

    if (!snap.exists()) {
      await setDoc(convRef, {
        participants: [booking.userId, booking.partnerId],
        bookingId: booking.id,
        listingId: booking.listingId,
        lastMessage: "Nouvelle réservation",
        lastAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });
    }
    router.push(`/profile/messages?id=${convId}`);
  };

  if (isUserLoading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white py-6 px-8 shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-black tracking-tight">Mes Réservations</h1>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl border shadow-sm h-14 w-full md:w-fit">
            <TabsTrigger value="upcoming" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">À venir</TabsTrigger>
            <TabsTrigger value="ongoing" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">En cours</TabsTrigger>
            <TabsTrigger value="past" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Passées</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <BookingList items={categorized.upcoming} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Aucune réservation à venir." />
          </TabsContent>
          <TabsContent value="ongoing" className="space-y-6">
            <BookingList items={categorized.ongoing} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Aucun voyage en cours." />
          </TabsContent>
          <TabsContent value="past" className="space-y-6">
            <BookingList items={categorized.past} formatPrice={formatPrice} onContact={handleContactHost} emptyMsg="Aucun historique de voyage." />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function BookingList({ items, formatPrice, onContact, emptyMsg }: any) {
  if (items.length === 0) return (
    <div className="py-20 text-center bg-white rounded-3xl border-4 border-dashed border-slate-100">
      <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
      <p className="text-slate-400 font-bold">{emptyMsg}</p>
    </div>
  );

  return items.map((booking: any) => (
    <Card key={booking.id} className="border-none shadow-xl rounded-3xl overflow-hidden bg-white hover:shadow-2xl transition-all">
      <CardContent className="p-0 flex flex-col md:flex-row">
        <div className="relative w-full md:w-64 h-48 bg-slate-100">
          <Image src={booking.itemImage || "https://placehold.co/400x300?text=StayFloow"} alt="Stay" fill className="object-cover" />
          <div className="absolute top-3 left-3">
            <Badge className={cn(
              "font-black text-[10px] uppercase border-none",
              booking.status === 'approved' ? "bg-green-600" : booking.status === 'pending' ? "bg-amber-500" : "bg-red-600"
            )}>
              {booking.status === 'approved' ? 'Confirmé' : booking.status === 'pending' ? 'En attente' : 'Annulé'}
            </Badge>
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-1">{booking.itemName}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{booking.itemType}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(booking.totalPrice)}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Montant total</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="bg-slate-50 p-2 rounded-lg text-slate-400"><Clock className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Dates</p>
                <p className="text-sm font-bold text-slate-700">
                  {format(new Date(booking.startDate), "dd MMM", { locale: fr })} - {format(new Date(booking.endDate), "dd MMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => onContact(booking)} variant="outline" className="border-primary text-primary font-bold rounded-xl h-12 flex-1">
              <MessageSquare className="mr-2 h-4 w-4" /> Contacter l'hôte
            </Button>
            <Button variant="ghost" className="text-slate-400 font-bold rounded-xl h-12 px-6">
              Voir détails
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  ));
}
