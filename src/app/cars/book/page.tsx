
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, Calendar as CalendarIcon, ShieldCheck, 
  Info, CreditCard, Users, Briefcase, Settings2, Fuel, 
  CheckCircle, Loader2, Globe, Phone, Mail, User
} from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { CrossSellCard } from "@/components/cross-sell-card";

function BookCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [dialCode, setDialCode] = useState("+213");
  const [phone, setPhone] = useState("");

  const carId = searchParams.get('id') || 'mock';
  const pickupLocation = searchParams.get('pickup') || "Alger, Algérie";
  const options = searchParams.get('options')?.split(',') || [];

  const basePrice = carId === 'mock-car-1' ? 7500 : 12000;
  const days = parseInt(searchParams.get('days') || '3');
  const optionsCost = options.length * 1500; // Simulation
  const total = (basePrice * days) + optionsCost;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation API
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
              Votre véhicule est réservé. Un email de confirmation contenant votre QR Code de retrait a été envoyé.
            </p>
            <Button className="w-full h-14 bg-primary text-white font-black rounded-xl text-lg shadow-xl" onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
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
      {/* Header Simple */}
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
          
          {/* Colonne Gauche: Formulaire Conducteur */}
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
                      <Label className="font-black text-slate-700 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Prénom *</Label>
                      <Input placeholder="Ex: Sofiane" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Nom *</Label>
                      <Input placeholder="Ex: Belkacem" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email *</Label>
                      <Input type="email" placeholder="votre@email.com" className="h-14 rounded-xl bg-slate-50 border-slate-100" required />
                    </div>
                    <div className="space-y-3">
                      <Label className="font-black text-slate-700 flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Téléphone *</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={dialCode} 
                          onChange={(e) => setDialCode(e.target.value)}
                          className="w-24 h-14 text-center font-bold bg-slate-50 border-slate-100 rounded-xl" 
                        />
                        <Input 
                          placeholder="550 00 00 00" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="flex-1 h-14 rounded-xl bg-slate-50 border-slate-100" 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-black text-slate-700 flex items-center gap-2"><Globe className="h-4 w-4 text-primary" /> Pays de résidence *</Label>
                    <select className="w-full h-14 px-4 rounded-xl bg-slate-50 border-slate-100 font-bold outline-none focus:ring-2 ring-primary/20">
                      <option>Algérie</option>
                      <option>France</option>
                      <option>Maroc</option>
                      <option>Tunisie</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black">2</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vérification & Conditions</h2>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-10 space-y-6">
                  <div className="flex items-start gap-4 p-6 bg-primary/5 rounded-2xl border-2 border-primary/10">
                    <Checkbox id="licence" className="mt-1" required />
                    <Label htmlFor="licence" className="text-sm font-bold text-slate-700 leading-relaxed cursor-pointer">
                      Je confirme posséder un permis de conduire valide depuis plus de 2 ans et avoir l'âge minimum requis (21 ans) au moment de la prise en charge.
                    </Label>
                  </div>
                  
                  <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <Checkbox id="terms" className="mt-1" required />
                    <Label htmlFor="terms" className="text-sm font-medium text-slate-500 leading-relaxed cursor-pointer">
                      J'accepte les conditions générales de location et la politique de confidentialité de StayFloow.com.
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-black">3</div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Paiement Sécurisé</h2>
              </div>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <label className="flex items-center justify-between p-6 border-2 border-primary bg-primary/5 rounded-2xl cursor-pointer">
                      <div className="flex items-center gap-4">
                        <CreditCard className="h-6 w-6 text-primary" />
                        <span className="font-black">Carte Bancaire</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-5 bg-slate-200 rounded" />
                        <div className="w-8 h-5 bg-slate-200 rounded" />
                      </div>
                    </label>
                    <label className="flex items-center justify-between p-6 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-black">P</div>
                        <span className="font-bold">PayPal</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-300 italic">SECURE</span>
                    </label>
                  </div>

                  <div className="mt-10 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-4">
                      <h4 className="text-xl font-black flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-secondary" /> Prêt pour le départ ?
                      </h4>
                      <p className="text-white/60 text-sm max-w-md">
                        En cliquant sur "Confirmer", votre demande sera envoyée au partenaire. Vous ne serez débité qu'après validation.
                      </p>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-16 bg-secondary hover:bg-secondary/90 text-primary font-black text-xl rounded-2xl shadow-2xl active:scale-95 transition-all mt-4"
                      >
                        {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmer et Payer"}
                      </Button>
                    </div>
                    {/* Décoration */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Colonne Droite: Récapitulatif Véhicule */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="overflow-hidden shadow-2xl border-none rounded-[2.5rem] bg-white">
                <div className="relative h-56 w-full">
                  <Image 
                    src={carId === 'mock-car-1' ? "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800" : "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800"} 
                    alt="Vehicle" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">EXCELLENT CHOIX !</div>
                </div>
                
                <CardContent className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI'}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Berline Premium / SUV</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <MiniSpec icon={<Users />} value="5 Places" />
                    <MiniSpec icon={<Settings2 />} value="Automatique" />
                    <MiniSpec icon={<Fuel />} value="Hybride" />
                    <MiniSpec icon={<Briefcase />} value="3 Valises" />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-400 uppercase text-[10px] tracking-widest">Détails Tarif</span>
                      <span className="text-primary">{days} jours</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">Prix location</span>
                        <span className="font-bold">{formatPrice(basePrice * days)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">Options ({options.length})</span>
                        <span className="font-bold text-primary">+{formatPrice(optionsCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 font-medium">Taxes locales (19%)</span>
                        <span className="text-green-600 font-bold">Inclus</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Total estimé</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">{formatPrice(total)}</p>
                    </div>
                    <ShieldCheck className="h-10 w-10 text-primary opacity-20" />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-center gap-2 text-[10px] text-green-600 font-black uppercase">
                      <CheckCircle className="h-3 w-3" /> Annulation Gratuite
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Jusqu'à 48h avant la prise en charge.</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/10 rounded-3xl">
                <CardContent className="p-6 flex gap-4">
                  <Info className="h-6 w-6 text-primary shrink-0" />
                  <p className="text-xs text-slate-600 font-bold leading-relaxed">
                    Besoin d'aide pour votre réservation ? Contactez notre support 24/7 au +213 550 00 00 00.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}

function MiniSpec({ icon, value }: { icon: any, value: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-500 font-bold text-xs bg-slate-50 p-2 rounded-lg">
      <span className="text-primary h-3.5 w-3.5">{icon}</span>
      <span>{value}</span>
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
