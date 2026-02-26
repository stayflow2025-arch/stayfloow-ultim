
'use client';

import React, { use } from 'react';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, 
  Wifi, Coffee, Car, Wind, ChevronLeft, 
  ChevronRight, Calendar as CalendarIcon, Loader2,
  CheckCircle,
  Info
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

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const docRef = doc(db, 'listings', id);
  const { data: property, loading } = useDoc(docRef);
  const { formatPrice } = useCurrency();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-400 font-bold animate-pulse">Chargement de l'établissement...</p>
        </div>
      </div>
    );
  }

  // Données par défaut si le document n'existe pas encore dans Firestore
  const displayData = property || {
    details: {
      name: "Riad Dar Al-Andalus",
      description: "Niché au cœur de la médina, ce riad historique offre une expérience immersive unique. Entièrement restauré par des artisans locaux, il allie confort moderne et architecture traditionnelle fassie. Profitez de notre patio arboré et de notre terrasse panoramique surplombant les toits de la ville.",
      amenities: ["WiFi haut débit", "Petit-déjeuner traditionnel", "Climatisation réversible", "Navette aéroport", "Service de conciergerie"],
    },
    location: { address: "Derb el-Miter, Fès, Maroc", lat: 34.06, lng: -5.00 },
    price: 12500,
    photos: [
      "https://picsum.photos/seed/riad-detail-1/1200/800",
      "https://picsum.photos/seed/riad-detail-2/1200/800",
      "https://picsum.photos/seed/riad-detail-3/1200/800",
      "https://picsum.photos/seed/riad-detail-4/1200/800"
    ]
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 py-3 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="font-bold text-slate-600 hover:text-primary transition-colors">
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-slate-50"><Share2 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" className="rounded-full border-slate-200 hover:bg-slate-50"><Heart className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contenu Principal (Colonnes Gauche) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Titre et Localisation */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black">STAYFLOOW SELECTION</Badge>
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Note Client : 9.8</Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {displayData.details?.name}
              </h1>
              <div className="flex items-center gap-1 text-primary font-bold hover:underline cursor-pointer transition-all">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{displayData.location?.address}</span>
              </div>
            </div>

            {/* Galerie Photos */}
            <div className="rounded-3xl overflow-hidden shadow-2xl bg-slate-200 aspect-video relative group border-4 border-white">
              <Carousel className="w-full h-full">
                <CarouselContent>
                  {displayData.photos?.map((photo: string, index: number) => (
                    <CarouselItem key={index}>
                      <div className="relative aspect-video w-full">
                        <Image 
                          src={photo} 
                          alt={`${displayData.details?.name} - Photo ${index + 1}`} 
                          fill 
                          className="object-cover"
                          priority={index === 0}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-6 bg-white/90 hover:bg-white border-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-6 bg-white/90 hover:bg-white border-none shadow-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </Carousel>
              <div className="absolute top-6 right-6 bg-black/50 text-white px-4 py-2 rounded-full text-xs font-black backdrop-blur-md">
                {displayData.photos?.length || 1} PHOTOS
              </div>
            </div>

            {/* Description */}
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-8 md:p-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Info className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Présentation</h2>
                </div>
                <p className="text-slate-600 leading-relaxed text-lg font-medium italic">
                  "{displayData.details?.description}"
                </p>
                <Separator className="bg-slate-100" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" /> Points forts
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-500 font-medium">
                      <li>• Emplacement stratégique au cœur historique</li>
                      <li>• Personnel multilingue dédié 24h/24</li>
                      <li>• Restauration gastronomique locale sur place</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-primary" /> Sécurité StayFloow
                    </h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Cet établissement respecte scrupuleusement notre charte de qualité "Gold Partner". Votre réservation est protégée.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Équipements */}
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" /> Ce que propose cet établissement
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {displayData.details?.amenities?.map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
                    <div className="bg-primary/5 p-2 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      {amenity.toLowerCase().includes('wifi') && <Wifi className="h-5 w-5" />}
                      {amenity.toLowerCase().includes('petit') && <Coffee className="h-5 w-5" />}
                      {amenity.toLowerCase().includes('clim') && <Wind className="h-5 w-5" />}
                      {amenity.toLowerCase().includes('navette') && <Car className="h-5 w-5" />}
                      {!['wifi', 'petit', 'clim', 'navette'].some(k => amenity.toLowerCase().includes(k)) && <ShieldCheck className="h-5 w-5" />}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Réservation (Colonne Droite) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 shadow-2xl border-none overflow-hidden rounded-3xl animate-in fade-in slide-in-from-right-4 duration-700">
              <CardContent className="p-0">
                <div className="bg-primary p-8 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-sm font-bold opacity-80 mb-1 uppercase tracking-widest">Offre Exclusive</p>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-4xl font-black">{formatPrice(displayData.price)}</h3>
                      <p className="text-sm font-bold opacity-80">/ nuit</p>
                    </div>
                  </div>
                  {/* Decorative background circle */}
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl" />
                </div>

                <div className="p-8 space-y-8 bg-white">
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          <CalendarIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dates</p>
                          <p className="font-bold text-sm">Choisir mes dates</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                          <Star className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Voyageurs</p>
                          <p className="font-bold text-sm">2 adultes, 0 enfant</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>

                  <Button className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-2xl active:scale-95 transition-all">
                    Réserver maintenant
                  </Button>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500 underline cursor-help decoration-dotted">{formatPrice(displayData.price)} x 3 nuits</span>
                      <span className="font-bold text-slate-900">{formatPrice(displayData.price * 3)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500 underline cursor-help decoration-dotted">Frais de service StayFloow</span>
                      <span className="font-bold text-green-600">OFFERT</span>
                    </div>
                    <div className="flex justify-between text-2xl font-black pt-4 border-t-2 border-slate-50 text-slate-900">
                      <span>Total</span>
                      <span>{formatPrice(displayData.price * 3)}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-dashed border-slate-200">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <p className="text-[10px] text-slate-500 font-bold leading-tight uppercase">
                      Paiement 100% sécurisé via StayFloow Pay
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/contact" className="mt-8 block p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl">
                  <Info className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Besoin d'aide ?</h4>
                  <p className="text-xs text-slate-500">Contactez l'hôte ou notre support 24/7.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-primary text-white py-16 px-8 text-center mt-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link href="/" className="text-3xl font-black tracking-tighter inline-block mb-4">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <p className="opacity-50 text-sm max-w-md mx-auto">
            Le portail de voyage numéro 1 en Afrique. Réservez vos séjours, voitures et circuits en toute confiance.
          </p>
          <div className="pt-8 opacity-30 text-xs">
            © 2025 StayFloow.com. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

