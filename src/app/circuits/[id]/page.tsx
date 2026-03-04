"use client";

import React, { use, useState, useEffect, useMemo } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  ChevronLeft, Star, Clock, MapPin, Share2, Heart, 
  Check, Info, X, Users, Calendar as CalendarIcon, Loader2, ShieldCheck, Globe, Minus, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { circuits as mockCircuits } from '@/lib/data';

export default function CircuitDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const docRef = doc(db, 'listings', id);
  const { data: dbCircuit, loading } = useDoc(docRef);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({
    adult: 1, child: 0, infant: 0
  });

  // Fallback sur les données mockées si Firestore ne renvoie rien
  const circuit = dbCircuit || mockCircuits.find(c => c.id === id);

  // Dates autorisées par le guide
  const allowedDates = useMemo(() => {
    const datesStr = circuit?.details?.availableDates || circuit?.availableDates || [];
    return datesStr.map((d: string) => new Date(d));
  }, [circuit]);

  useEffect(() => {
    // Sélectionner la première date disponible par défaut
    if (allowedDates.length > 0 && !selectedDate) {
      setSelectedDate(allowedDates[0]);
    }
  }, [allowedDates, selectedDate]);

  useEffect(() => {
    // Initialiser les compteurs si le circuit a des types de tickets spécifiques
    if (circuit?.details?.ticketTypes) {
      const initialCounts: Record<string, number> = {};
      circuit.details.ticketTypes.forEach((t: any) => {
        initialCounts[t.id] = t.id === 'adult' ? 1 : 0;
      });
      setTicketCounts(initialCounts);
    } else if (circuit?.ticketTypes) {
        const initialCounts: Record<string, number> = {};
        circuit.ticketTypes.forEach((t: any) => {
          initialCounts[t.id] = t.id === 'adult' ? 1 : 0;
        });
        setTicketCounts(initialCounts);
    }
  }, [circuit]);

  const updateCount = (tid: string, delta: number) => {
    setTicketCounts(prev => ({ ...prev, [tid]: Math.max(0, prev[tid] + delta) }));
  };

  const calculateTotal = () => {
    if (!circuit) return 0;
    const types = circuit.details?.ticketTypes || circuit.ticketTypes || [{ id: 'adult', price: circuit.price || circuit.pricePerPerson }];
    return types.reduce((acc: number, type: any) => acc + (type.price * (ticketCounts[type.id] || 0)), 0);
  };

  const handleBooking = () => {
    const total = calculateTotal();
    const params = new URLSearchParams({
      id: id,
      date: selectedDate?.toISOString() || '',
      tickets: JSON.stringify(ticketCounts),
      total: total.toString()
    });
    router.push(`/circuits/book?${params.toString()}`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;
  if (!circuit) return <div className="p-20 text-center font-black">Circuit introuvable.</div>;

  const amenities = circuit.details?.amenities || circuit.amenities || [];
  const photos = circuit.photos || circuit.images || ['https://picsum.photos/seed/hero/800/600'];
  const name = circuit.details?.name || circuit.title;
  const duration = circuit.details?.duration || circuit.duration;
  const location = circuit.location?.address || circuit.location;
  const description = circuit.details?.description || circuit.description;
  const languages = circuit.details?.languages || circuit.languages || ['Français', 'Arabe'];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Sticky */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-16 z-40 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600 hover:text-primary">
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="rounded-full"><Share2 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-full text-red-500"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          {/* Main Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary font-black px-3">CERTIFIÉ STAYFLOOW</Badge>
              <div className="flex items-center gap-1"><Star className="h-4 w-4 text-amber-400 fill-amber-400" /> <span className="font-black">{circuit.rating || '9.2'}</span></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">{name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> {duration}</div>
              <div className="flex items-center gap-1.5 text-primary"><MapPin className="h-4 w-4" /> {location}</div>
            </div>
          </div>

          {/* Photo Gallery */}
          <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <Image src={photos[0]} alt="Hero" fill className="object-cover" />
          </div>

          {/* Details */}
          <div className="space-y-12 bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100">
            {/* Free Cancellation */}
            <div className="flex items-start gap-4 p-6 bg-green-50 rounded-3xl border border-green-100">
              <div className="bg-green-600 p-2 rounded-full text-white"><Check className="h-5 w-5" /></div>
              <div>
                <h4 className="font-black text-lg text-green-900">Annulation gratuite</h4>
                <p className="text-green-700 text-sm font-medium">Jusqu'à 24 heures à l'avance pour un remboursement intégral.</p>
              </div>
            </div>

            <Separator />

            {/* Languages */}
            <div className="space-y-4">
              <h4 className="font-black text-xl flex items-center gap-2"><Globe className="h-6 w-6 text-primary" /> Langues disponibles</h4>
              <div className="flex flex-wrap gap-3">
                {languages.map((l: string) => (
                  <Badge key={l} variant="secondary" className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold">
                    {l === 'Français' ? '🇫🇷' : l === 'Arabe' ? '🇩🇿' : l === 'Anglais' ? '🇬🇧' : '🌍'} {l}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h4 className="font-black text-xl">Points forts & Services inclus</h4>
                <ul className="space-y-4">
                  {amenities.map((a: string) => (
                    <li key={a} className="flex items-start gap-3 text-sm font-bold text-slate-600">
                      <Check className="h-5 w-5 text-primary shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="font-black text-xl">Restrictions</h4>
                <ul className="space-y-4">
                  {circuit.restrictions?.map((r: string) => (
                    <li key={r} className="flex items-start gap-3 text-sm font-bold text-slate-400 italic">
                      <X className="h-5 w-5 text-red-400 shrink-0" /> {r}
                    </li>
                  )) || (
                    <li className="flex items-start gap-3 text-sm font-bold text-slate-400 italic">
                      <X className="h-5 w-5 text-red-400 shrink-0" /> {t('Non accessible aux fauteuils')}
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <Separator />

            {/* Long Description */}
            <div className="space-y-6">
              <h4 className="font-black text-2xl">Description du circuit</h4>
              <p className="text-slate-600 leading-relaxed text-lg font-medium italic border-l-4 border-primary/20 pl-6">
                "{description}"
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Ticket Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Vérifier disponibilités</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Date Selection - Restricted to Allowed Dates */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">1. Choisir une date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-14 justify-start font-black text-lg border-slate-200 rounded-2xl">
                        <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                        {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Choisir parmi dates dispo"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="start">
                      <Calendar 
                        mode="single" 
                        selected={selectedDate} 
                        onSelect={setSelectedDate} 
                        locale={fr} 
                        disabled={(date) => {
                          // Désactiver si avant aujourd'hui OU si pas dans la liste allowedDates
                          if (date < new Date(new Date().setHours(0,0,0,0))) return true;
                          if (allowedDates.length > 0) {
                            return !allowedDates.some(allowed => isSameDay(allowed, date));
                          }
                          return false;
                        }} 
                      />
                    </PopoverContent>
                  </Popover>
                  {allowedDates.length > 0 && (
                    <p className="text-[9px] text-primary font-black uppercase tracking-widest text-center mt-2">
                      {allowedDates.length} dates ouvertes par le guide
                    </p>
                  )}
                </div>

                {/* Ticket Selection */}
                <div className="space-y-6">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Nombre de participants</label>
                  <div className="space-y-4">
                    {(circuit.details?.ticketTypes || circuit.ticketTypes || [{id: 'adult', name: 'Adulte', price: circuit.price || circuit.pricePerPerson}]).map((type: any) => (
                      <div key={type.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <p className="font-black text-slate-900">{type.name}</p>
                          <p className="text-xs font-bold text-primary">{formatPrice(type.price)}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <button onClick={() => updateCount(type.id, -1)} className="h-8 w-8 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary disabled:opacity-20" disabled={ticketCounts[type.id] === 0}><Minus className="h-4 w-4" /></button>
                          <span className="w-6 text-center font-black">{ticketCounts[type.id] || 0}</span>
                          <button onClick={() => updateCount(type.id, 1)} className="h-8 w-8 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Plus className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Total à payer</p>
                    <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(calculateTotal())}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Taxes et frais compris</p>
                  </div>
                </div>

                <Button 
                  onClick={handleBooking}
                  disabled={calculateTotal() === 0 || !selectedDate}
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                >
                  Suivant
                </Button>
              </CardContent>
            </Card>

            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex gap-4">
              <ShieldCheck className="h-8 w-8 text-primary shrink-0 opacity-50" />
              <p className="text-xs text-slate-600 leading-relaxed font-bold">
                <strong>Réservez maintenant, payez plus tard :</strong> sécurisez votre place aujourd'hui sans frais de pré-paiement sur StayFloow.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
