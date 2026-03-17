
"use client";

import React, { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  Lock 
} from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CrossSellCard } from "@/components/cross-sell-card";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { sendBookingConfirmationEmail } from "@/lib/mail";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createStripeCheckout } from "@/lib/stripe-payment";

function BookCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");

  const carId = searchParams.get('id') || 'mock';
  const pickupLocation = searchParams.get('pickup') || "Alger, Algérie";
  const options = useMemo(() => searchParams.get('options')?.split(',').filter(o => o) || [], [searchParams]);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const totalParam = searchParams.get('total');
  const days = parseInt(searchParams.get('days') || '3');

  const carRef = useMemoFirebase(() => carId.startsWith('mock') ? null : doc(db, 'listings', carId), [db, carId]);
  const { data: dbCar, isLoading: carLoading } = useDoc(carRef);

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || "",
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phone: "",
    dialCode: "+213",
  });

  const displayCar = useMemo(() => {
    if (dbCar) return {
      name: dbCar.details?.brand + " " + (dbCar.details?.model || dbCar.details?.name),
      image: dbCar.photos?.[0] || "https://picsum.photos/seed/car/800/600",
      price: dbCar.price || 85
    };
    return {
      name: carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI',
      image: carId === 'mock-car-1' ? "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800" : "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800",
      price: carId === 'mock-car-1' ? 50 : 85
    };
  }, [dbCar, carId]);

  const fullTotal = useMemo(() => {
    if (totalParam) return parseFloat(totalParam);
    const optionsCost = options.length * 10;
    return (displayCar.price * days) + optionsCost;
  }, [totalParam, displayCar.price, days, options.length]);

  const depositTotal = fullTotal * 0.14;
  const onSiteTotal = fullTotal * 0.86;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const resNum = `ST-CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      if (paymentMethod === 'card') {
        const url = await createStripeCheckout(
          db, 
          finalUserId, 
          "price_car_placeholder", 
          window.location.origin + "/profile/bookings?success=true",
          window.location.href
        );
        window.location.href = url;
        return;
      }

      await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: dbCar?.ownerId || "stayfloow_fleet",
        listingId: carId,
        itemName: displayCar.name,
        itemType: 'car_rental',
        itemImage: displayCar.image,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        totalPrice: fullTotal,
        depositPaid: depositTotal,
        status: 'approved',
        startDate: fromParam || new Date().toISOString(),
        endDate: toParam || addDays(new Date(), days).toISOString(),
        createdAt: new Date().toISOString(),
        reservationNumber: resNum,
        pickupLocation
      });

      await sendBookingConfirmationEmail({
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        reservationNumber: resNum,
        itemName: displayCar.name,
        itemType: 'location de voiture',
        hostName: "StayFloow Fleet",
        hostEmail: "fleet@stayfloow.com",
        hostPhone: "+213 550 00 00 00",
        bookingDetails: { 
          startDate: fromParam || new Date().toISOString(), 
          endDate: toParam || addDays(new Date(), days).toISOString(),
          totalPrice: fullTotal,
          depositAmount: depositTotal
        }
      });

      setIsSuccess(true);
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur Stripe." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <Card className="max-w-md w-full mx-auto border-none shadow-2xl rounded-3xl p-12 bg-white">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-8" />
            <h1 className="text-3xl font-black mb-4">Réservation Confirmée !</h1>
            <Button className="w-full h-14 bg-primary text-white font-black rounded-xl" onClick={() => router.push('/profile/bookings')}>Voir mes réservations</Button>
          </Card>
          <CrossSellCard location={pickupLocation.split(',')[0].trim()} bookedItemType="car" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col">
      <header className="bg-primary text-white py-6 px-8 shadow-md flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-black hover:opacity-80 transition-all"><ArrowLeft className="h-5 w-5" /> Retour</button>
        <div className="text-2xl font-black">StayFloow<span className="text-secondary">.com</span></div>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-2xl font-black uppercase">Conducteur & Paiement Stripe</CardTitle></CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3"><Label className="font-bold">Prénom</Label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-14 rounded-xl" required /></div>
                  <div className="space-y-3"><Label className="font-bold">Nom</Label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-14 rounded-xl" required /></div>
                </div>
                <div className="space-y-3"><Label className="font-bold">Email</Label><Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" className="h-14 rounded-xl" required /></div>
                
                <div className="pt-8 border-t">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-3"><CreditCard className="h-6 w-6 text-primary" /> Mode de Paiement (Sécurisé)</h3>
                  <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 flex gap-3">
                    <Lock className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-xs text-blue-700 font-medium italic">Vous allez être redirigé vers Stripe pour saisir vos informations de carte en toute sécurité.</p>
                  </div>

                  <RadioGroup onValueChange={setPaymentMethod} defaultValue="card" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Label htmlFor="card" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", paymentMethod === 'card' ? "border-primary bg-primary/5" : "border-slate-100")}>
                      <RadioGroupItem value="card" id="card" className="sr-only" /><CreditCard className="h-6 w-6 text-primary" /><span className="font-bold">Carte Bancaire (Stripe)</span>
                    </Label>
                    <Label htmlFor="paypal" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", paymentMethod === 'paypal' ? "border-primary bg-primary/5" : "border-slate-100")}>
                      <RadioGroupItem value="paypal" id="paypal" className="sr-only" /><div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div><span className="font-bold">PayPal</span>
                    </Label>
                  </RadioGroup>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-xl rounded-2xl shadow-xl mt-8">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : `Payer ${formatPrice(depositTotal)} via Stripe`}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="overflow-hidden shadow-2xl border-none rounded-[2.5rem] bg-white">
              <div className="relative h-56 w-full"><Image src={displayCar.image} alt="Vehicle" fill className="object-cover" /></div>
              <CardContent className="p-8 space-y-6">
                <h3 className="text-2xl font-black">{displayCar.name}</h3>
                <Separator />
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm"><span className="text-slate-500">Prix total</span><span className="font-black">{formatPrice(fullTotal)}</span></div>
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10"><span className="text-xs font-bold text-primary">EN LIGNE (14%)</span><span className="font-black text-primary">{formatPrice(depositTotal)}</span></div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-xs font-bold text-slate-500">SUR PLACE (86%)</span><span className="font-black text-slate-700">{formatPrice(onSiteTotal)}</span></div>
                </div>
                <div className="pt-4 border-t flex justify-between items-end"><div><p className="text-[10px] font-black text-slate-400 uppercase">Total Transaction</p><p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(fullTotal)}</p></div><ShieldCheck className="h-8 w-8 text-primary opacity-20" /></div>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function BookCarPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <BookCarContent />
    </Suspense>
  );
}
