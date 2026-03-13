"use client";

import { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Calendar as CalendarIcon, ShieldCheck, 
  Info, CreditCard, Users, Briefcase, Settings2, Fuel, 
  CheckCircle, Loader2, Globe, Phone, Mail, User as UserIcon, MapPin
} from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CrossSellCard } from "@/components/cross-sell-card";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { sendBookingConfirmationEmail } from "@/lib/mail";

function BookCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const carId = searchParams.get('id') || 'mock';
  const pickupLocation = searchParams.get('pickup') || "Alger, Algérie";
  const options = searchParams.get('options')?.split(',').filter(o => o) || [];
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const totalParam = searchParams.get('total');
  const days = parseInt(searchParams.get('days') || '3');

  const carRef = useMemoFirebase(() => carId.startsWith('mock') ? null : doc(db, 'listings', carId), [db, carId]);
  const { data: dbCar, loading: carLoading } = useDoc(carRef);

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || "",
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
    email: user?.email || "",
    phone: "",
    dialCode: "+213"
  });

  const displayCar = useMemo(() => {
    if (dbCar) return {
      name: dbCar.details?.brand + " " + (dbCar.details?.model || dbCar.details?.name),
      image: dbCar.photos?.[0] || "https://placehold.co/800x600?text=Car+StayFloow",
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
    const resNum = `ST-CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const finalUserId = user?.uid || `guest_${Date.now()}`;

    try {
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
      toast({ title: "Véhicule réservé !" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la réservation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <Card className="max-w-md w-full mx-auto border-none shadow-2xl rounded-[2.5rem] p-12 text-center bg-white animate-in zoom-in-95">
            <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Réservation Confirmée !</h1>
            <p className="text-slate-500 mb-10 leading-relaxed text-lg font-medium">
              Votre véhicule est réservé. Retrouvez les détails dans votre portail client StayFloow.
            </p>
            <div className="space-y-3">
              <Button className="w-full h-14 bg-primary text-white font-black rounded-xl text-lg shadow-xl" onClick={() => router.push('/profile/bookings')}>
                Voir mes réservations
              </Button>
              <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => router.push('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </Card>

          <CrossSellCard 
            location={pickupLocation.split(',')[0].trim()} 
            bookedItemType="car" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col">
      <header className="bg-primary text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-black hover:opacity-80 transition-all">
            <ArrowLeft className="h-5 w-5" /> Retour à l'offre
          </button>
          <div className="text-2xl font-black tracking-tighter">StayFloow<span className="text-secondary">.com</span></div>
          <div className="w-10 hidden md:block" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black">1</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Coordonnées du conducteur</h2>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> Prénom *</Label>
                      <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Ex: Sofiane" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><UserIcon className="h-4 w-4 text-primary" /> Nom *</Label>
                      <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Ex: Belkacem" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email *</Label>
                      <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} type="email" placeholder="votre@email.com" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Téléphone *</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={formData.dialCode} 
                          onChange={(e) => setFormData({...formData, dialCode: e.target.value})}
                          className="w-24 h-14 text-center font-bold bg-slate-50 border-slate-100 rounded-xl" 
                        />
                        <Input 
                          placeholder="550 00 00 00" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="flex-1 h-14 rounded-xl bg-slate-50 border-slate-100" 
                          required 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black">2</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Paiement Sécurisé</h2>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-10">
                  <div className="bg-slate-900 rounded-3xl p-8 text-white">
                    <h4 className="text-xl font-black mb-4 flex items-center gap-2"><ShieldCheck className="text-secondary" /> Finaliser ma location</h4>
                    <p className="text-white/60 text-sm mb-8">Paiement 100% sécurisé via StayFloow Pay.</p>
                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-secondary text-primary font-black text-xl rounded-2xl shadow-xl">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Payez maintenant " + formatPrice(depositTotal)}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="overflow-hidden shadow-2xl border-none rounded-[2.5rem] bg-white">
                <div className="relative h-56 w-full">
                  <Image src={displayCar.image} alt="Vehicle" fill className="object-cover" />
                </div>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{displayCar.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <CalendarIcon className="h-4 w-4 text-primary" /> 
                      {fromParam ? format(new Date(fromParam), "dd MMM") : "..."} — {toParam ? format(new Date(toParam), "dd MMM yyyy") : "..."}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <MapPin className="h-4 w-4 text-primary" /> {pickupLocation}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Prix total ({days}j)</span>
                      <span className="font-black text-slate-900">{formatPrice(fullTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-xs font-bold text-primary">À PAYER EN LIGNE (14%)</span>
                      <span className="font-black text-primary">{formatPrice(depositTotal)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500">À PAYER SUR PLACE (86%)</span>
                      <span className="font-black text-slate-700">{formatPrice(onSiteTotal)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                      ℹ Notre plateforme prélève uniquement 14% du montant total à titre de frais de service lors de votre réservation en ligne. Le solde restant (86%) est réglé directement sur place auprès du prestataire à votre arrivée.
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total Réservation</p>
                        <p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(fullTotal)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
