
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Calendar as CalendarIcon, ShieldCheck, 
  Info, CreditCard, Users, Briefcase, Settings2, Fuel, 
  CheckCircle, Loader2, Globe, Phone, Mail, User as UserIcon
} from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CrossSellCard } from "@/components/cross-sell-card";
import { useFirestore, useUser } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
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

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dialCode: "+213"
  });

  const carId = searchParams.get('id') || 'mock';
  const pickupLocation = searchParams.get('pickup') || "Alger, Algérie";
  const options = searchParams.get('options')?.split(',') || [];

  const basePrice = carId === 'mock-car-1' ? 7500 : 12000;
  const days = parseInt(searchParams.get('days') || '3');
  const optionsCost = options.length * 1500;
  const total = (basePrice * days) + optionsCost;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Connexion requise", description: "Veuillez vous connecter pour réserver." });
      router.push("/auth/login");
      return;
    }

    setIsSubmitting(true);
    const resNum = `ST-CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // Enregistrer dans Firestore
      await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        partnerId: "stayfloow_fleet",
        listingId: carId,
        itemName: carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI',
        itemType: 'car_rental',
        itemImage: carId === 'mock-car-1' ? "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800" : "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800",
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        totalPrice: total,
        status: 'approved',
        startDate: new Date().toISOString(),
        endDate: addDays(new Date(), days).toISOString(),
        createdAt: new Date().toISOString(),
        reservationNumber: resNum
      });

      await sendBookingConfirmationEmail({
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        reservationNumber: resNum,
        itemName: carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI',
        itemType: 'location de voiture',
        hostName: "StayFloow Fleet",
        hostEmail: "fleet@stayfloow.com",
        hostPhone: "+213 550 00 00 00",
        bookingDetails: { startDate: new Date().toISOString(), totalPrice: total }
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
                      {isSubmitting ? <Loader2 className="animate-spin" /> : "Payer " + formatPrice(total)}
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
                  <Image src={carId === 'mock-car-1' ? "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800" : "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800"} alt="Vehicle" fill className="object-cover" />
                </div>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI'}</h3>
                  <Separator />
                  <div className="flex justify-between items-end pt-2">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total TTC</p><p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(total)}</p></div>
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
