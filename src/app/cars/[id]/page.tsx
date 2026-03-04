'use client';

import React, { use, useState, useMemo, useEffect } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, 
  ChevronLeft, Loader2, Info, Fuel, Gauge, Users, Calendar as CalendarIcon, 
  ArrowRight, Check, CheckCircle, Briefcase, Settings2, MessageSquare, AlertTriangle, X, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  // State pour le prix dynamique et la recherche
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // États de recherche modifiables
  const [pickupLocation, setPickupLocation] = useState("");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });

  // États temporaires pour le formulaire de modification
  const [tempLocation, setTempLocation] = useState("");
  const [tempDates, setTempDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  const docRef = doc(db, 'listings', id);
  const { data: car, loading } = useDoc(docRef);

  useEffect(() => {
    if (car && !pickupLocation) {
      setPickupLocation(car.location?.address || "Aéroport d'Alger (ALG), Algérie");
    }
  }, [car, pickupLocation]);

  const optionsList = [
    { id: 'insurance', label: 'Protection Complète (Zéro Franchise)', price: 15 },
    { id: 'gps', label: 'GPS Haute Précision', price: 5 },
    { id: 'baby_seat', label: 'Siège Bébé / Enfant', price: 8 },
    { id: 'additional_driver', label: 'Conducteur Additionnel', price: 10 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const displayData = car || {
    id: id,
    details: {
      name: id === 'mock-car-1' ? 'Duster 4x4 Sahara' : 'Golf 8 GTI',
      brand: id === 'mock-car-1' ? 'Dacia' : 'Volkswagen',
      description: "Véhicule premium parfaitement entretenu. Idéal pour vos déplacements sur StayFloow.com. Inclut toutes les options de confort et sécurité.",
      amenities: ["Climatisation", "Kilométrage illimité", "Assurance tous risques", "Transmission automatique"],
      fuel: id === 'mock-car-1' ? 'Diesel' : 'Essence',
      transmission: id === 'mock-car-1' ? 'Manuelle' : 'Automatique',
      seats: 5,
      luggage: 3,
      minAge: 21,
      cancellation: "48h"
    },
    location: { address: "Aéroport d'Alger (ALG), Algérie" },
    price: id === 'mock-car-1' ? 50 : 85,
    photos: [
      "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=1200",
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=1200"
    ],
    rating: 9.2,
    reviewsCount: 156
  };

  const daysCount = Math.max(1, differenceInDays(dateRange.to, dateRange.from));

  const optionsTotal = selectedOptions.reduce((acc, optId) => {
    const opt = optionsList.find(o => o.id === optId);
    return acc + (opt?.price || 0);
  }, 0);

  const totalPrice = (displayData.price * daysCount) + optionsTotal;

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const openEditModal = () => {
    setTempLocation(pickupLocation);
    setTempDates({ from: dateRange.from, to: dateRange.to });
    setIsEditDialogOpen(true);
  };

  const saveSearchChanges = () => {
    if (tempLocation) setPickupLocation(tempLocation);
    if (tempDates.from && tempDates.to) {
      setDateRange({ from: tempDates.from, to: tempDates.to });
    }
    setIsEditDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header Dates/Lieux Modifiable */}
      <div className="bg-slate-900 text-white py-4 px-6 sticky top-16 z-40 shadow-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar w-full md:w-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Lieu de prise</span>
              <span className="text-sm font-bold truncate">{pickupLocation || displayData.location?.address}</span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Dates de location</span>
              <span className="text-sm font-bold">
                {format(dateRange.from, "dd MMM", { locale: fr })} — {format(dateRange.to, "dd MMM", { locale: fr })} ({daysCount} jours)
              </span>
            </div>
          </div>
          <Button 
            onClick={openEditModal}
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-white font-black h-10 px-6 rounded-full transition-all"
          >
            Modifier la recherche
          </Button>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            {/* Titre & Rating */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary text-white font-black text-[10px] px-2 py-0.5">STAYFLOOW APPROVED</Badge>
                  {displayData.details?.cancellation === "48h" && (
                    <div className="flex items-center gap-1 text-green-600 font-bold text-xs">
                      <CheckCircle className="h-3 w-3" /> Annulation gratuite (48h)
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  {displayData.details?.brand} {displayData.details?.model || displayData.details?.name}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> {displayData.location?.address}
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-right">
                  <p className="font-black text-slate-900 leading-none mb-1">
                    {displayData.rating >= 9 ? "Fabuleux" : "Très Bien"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{displayData.reviewsCount} avis clients</p>
                </div>
                <div className="bg-primary text-white font-black text-xl w-12 h-12 flex items-center justify-center rounded-xl shadow-lg">
                  {displayData.rating?.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Photos */}
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-200 aspect-video relative group border-4 border-white">
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {displayData.photos?.map((photo: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full">
                        <Image src={photo} alt="Car" fill className="object-cover" priority={index === 0} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-6 bg-white/90 hover:bg-white" />
                <CarouselNext className="right-6 bg-white/90 hover:bg-white" />
              </Carousel>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SpecBox icon={<Users className="h-5 w-5"/>} label="Places" value={`${displayData.details?.seats || 5} Adultes`} />
              <SpecBox icon={<Briefcase className="h-5 w-5"/>} label="Bagages" value={`${displayData.details?.luggage || 2} Valises`} />
              <SpecBox icon={<Settings2 className="h-5 w-5"/>} label="Boîte" value={displayData.details?.transmission || 'Manuelle'} />
              <SpecBox icon={<Fuel className="h-5 w-5"/>} label="Énergie" value={displayData.details?.fuel || 'Diesel'} />
            </div>

            {/* Instructions Prise en Charge */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" /> Instructions de prise en charge
                </h2>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 font-medium">
                  "Navette gratuite disponible au Terminal 1 et 2. Un agent StayFloow vous accueillera avec une pancarte à votre nom à la sortie des bagages."
                </div>
              </CardContent>
            </Card>

            {/* Options Supplémentaires */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900">Options supplémentaires</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {optionsList.map((opt) => (
                  <div 
                    key={opt.id} 
                    onClick={() => toggleOption(opt.id)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer",
                      selectedOptions.includes(opt.id) ? "border-primary bg-primary/5" : "border-white bg-white hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox checked={selectedOptions.includes(opt.id)} />
                      <span className="font-bold text-slate-700 text-sm">{opt.label}</span>
                    </div>
                    <span className="font-black text-primary text-sm">+{formatPrice(opt.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Avis Clients */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-primary" /> Ce que disent les voyageurs
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReviewCard author="Sofiane B." content="Véhicule impeccable, propre et puissant. L'accueil à l'aéroport était parfait." rating={10} />
                <ReviewCard author="Karima L." content="Service très professionnel. Je recommande vivement pour un séjour en Algérie." rating={9} />
              </div>
            </div>
          </div>

          {/* Sidebar de Réservation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-40 shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
              <div className="bg-primary p-8 text-white">
                <p className="text-[10px] font-black opacity-80 mb-1 uppercase tracking-widest">Récapitulatif Tarifaire</p>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-4xl font-black">{formatPrice(totalPrice)}</h3>
                  <p className="text-xs font-bold opacity-80">Total TTC</p>
                </div>
              </div>

              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">Prix location ({daysCount}j)</span>
                    <span className="font-bold">{formatPrice(displayData.price * daysCount)}</span>
                  </div>
                  {selectedOptions.length > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span className="font-medium">Options ({selectedOptions.length})</span>
                      <span className="font-bold">+{formatPrice(optionsTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">TVA Algérie (19%)</span>
                    <span className="text-green-600 font-bold">Inclus</span>
                  </div>
                </div>

                <Separator />

                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                    Âge minimum requis : {displayData.details?.minAge || 21} ans. Permis de conduire valide depuis plus de 2 ans exigé.
                  </p>
                </div>

                <Button className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl" asChild>
                  <Link href={`/cars/book?id=${id}&options=${selectedOptions.join(',')}&days=${daysCount}&pickup=${encodeURIComponent(pickupLocation)}&from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&total=${totalPrice}`}>
                    Suivant <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-green-600">
                    <CheckCircle className="h-4 w-4" /> Aucun frais de réservation
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <ShieldCheck className="h-4 w-4" /> Garantie StayFloow Best Price
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* MODAL DE MODIFICATION DE LA RECHERCHE */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" /> Modifier la recherche
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Lieu de prise en charge</Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <Input 
                  value={tempLocation} 
                  onChange={(e) => setTempLocation(e.target.value)}
                  className="h-14 pl-12 rounded-xl bg-slate-50 border-slate-100 font-bold" 
                  placeholder="Ex: Aéroport d'Alger..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-black text-xs uppercase tracking-widest text-slate-400">Dates de location</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-14 justify-start text-left font-bold rounded-xl border-slate-100 bg-slate-50">
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {tempDates.from && tempDates.to ? (
                      <>
                        {format(tempDates.from, "dd MMM", { locale: fr })} — {format(tempDates.to, "dd MMM", { locale: fr })}
                      </>
                    ) : (
                      "Sélectionner des dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="center">
                  <Calendar
                    mode="range"
                    selected={{ from: tempDates.from, to: tempDates.to }}
                    onSelect={(range: any) => setTempDates({ from: range?.from, to: range?.to })}
                    locale={fr}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="font-bold text-slate-400">
              Annuler
            </Button>
            <Button 
              onClick={saveSearchChanges}
              className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-14 rounded-xl shadow-xl shadow-primary/20"
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SpecBox({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-1 group hover:border-primary transition-all">
      <div className="text-primary mb-1 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

function ReviewCard({ author, content, rating }: { author: string, content: string, rating: number }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-black text-slate-900">{author}</span>
        <Badge className="bg-primary/10 text-primary font-black">{rating}/10</Badge>
      </div>
      <p className="text-sm text-slate-500 italic leading-relaxed">"{content}"</p>
    </div>
  );
}
