
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar as CalendarIcon, ShieldCheck, Info, CreditCard } from "lucide-react";
import Image from "next/image";

export default function BookCarPage() {
  const router = useRouter();

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  const handleBooking = () => {
    console.log("Booking confirmed for StayFloow.com");
    alert("Redirection vers PayPal sécurisé...");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Simple */}
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <button onClick={() => router.back()} className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" /> Retour
          </button>
          <div className="text-xl font-black">StayFloow<span className="text-secondary">.com</span></div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche: Formulaire et Paiement */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl border-none">
              <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Votre Réservation</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Dates de location</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start text-left font-bold border-slate-200">
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "dd MMM", { locale: fr })} — {format(date.to, "dd MMM", { locale: fr })}
                            </>
                          ) : (
                            format(date.from, "dd MMM yyyy", { locale: fr })
                          )
                        ) : (
                          "Choisir les dates"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-500 font-medium">Prix / jour</span>
                    <span className="font-bold">7 500 DZD</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-black text-slate-900">Total estimé</span>
                    <span className="text-xl font-black text-primary">22 500 DZD</span>
                  </div>

                  <Button 
                    className="w-full h-14 bg-[#0070ba] hover:bg-[#003087] text-white font-black text-lg rounded-xl flex items-center justify-center gap-2"
                    onClick={handleBooking}
                  >
                    <PayPalIcon className="h-6 w-20" />
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Paiement 100% sécurisé via StayFloow
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10">
              <CardContent className="p-4 flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Annulation gratuite</strong> jusqu'à 48h avant la prise en charge. Aucun frais de dossier caché.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Colonne Droite: Détails Véhicule */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden shadow-lg border-none">
              <div className="relative h-80 w-full">
                <Image 
                  src="https://picsum.photos/seed/car-booking/1200/800" 
                  alt="Dacia Duster" 
                  fill 
                  className="object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">SUV PREMIUM</span>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900">Dacia Duster 4x4</h2>
                    <p className="text-slate-500 flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-green-600" /> Certifié Partenaire Gold StayFloow</p>
                  </div>
                  <div className="bg-slate-100 p-3 rounded-xl flex flex-col items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase">Note</span>
                    <span className="text-xl font-black text-primary">4.8/5</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <FeatureItem icon="👥" label="5 Places" />
                  <FeatureItem icon="⚙️" label="Manuelle" />
                  <FeatureItem icon="⛽" label="Diesel" />
                  <FeatureItem icon="❄️" label="Climatisé" />
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-slate-900 border-b pb-2">Inclus dans votre offre :</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <li className="flex items-center gap-2"><CheckIcon /> Kilométrage illimité</li>
                    <li className="flex items-center gap-2"><CheckIcon /> Assurance tous risques</li>
                    <li className="flex items-center gap-2"><CheckIcon /> Assistance 24h/24</li>
                    <li className="flex items-center gap-2"><CheckIcon /> Livraison à l'hôtel</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureItem({ icon, label }: { icon: string, label: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center gap-1 border border-slate-100">
      <span className="text-2xl">{icon}</span>
      <span className="text-[10px] font-bold text-slate-600 uppercase">{label}</span>
    </div>
  );
}

function CheckIcon() {
  return <ShieldCheck className="h-4 w-4 text-primary" />;
}

function PayPalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.067 8.178c-.552 4.153-3.26 6.326-7.315 6.326h-1.333c-.38 0-.693.277-.768.651l-.747 3.731c-.025.123-.132.214-.258.214H6.84a.263.263 0 0 1-.259-.315l1.83-9.146c.075-.374.402-.651.783-.651h4.293c1.392 0 2.47.311 3.234.934.693.564 1.055 1.398.934 2.51l.012-.254zm-2.036-.33c-.563-.457-1.334-.683-2.292-.683h-3.328c-.126 0-.233.091-.258.214l-1.332 6.66c-.015.074.041.141.116.141h1.333c.126 0 .233-.091.258-.214l.43-2.152c.075-.374.402-.651.783-.651h.333c2.704 0 4.509-1.448 4.877-4.212.08-.601-.131-1.047-.506-1.352l.01.25zM12.752 4.1h-4.293c-.953 0-1.77.692-1.957 1.628l-1.83 9.146c-.035.176.1.341.28.341h2.806c.126 0 .233-.091.258-.214l.747-3.731c.075-.374.402-.651.783-.651h1.333c5.068 0 8.454-2.717 9.142-7.898.374-2.812-.527-4.908-2.259-6.315-1.541-1.252-3.738-1.942-6.541-1.942H8.459c-.953 0-1.77.692-1.957 1.628L4.67 14.545c-.035.176.1.341.28.341h2.806c.126 0 .233-.091.258-.214l.43-2.152c.075-.374.402-.651.783-.651h.333c2.704 0 4.509-1.448 4.877-4.212.181-1.36-.08-2.396-.707-3.15-.65-.779-1.688-1.218-3.08-1.218l.1.012z"/>
    </svg>
  );
}
