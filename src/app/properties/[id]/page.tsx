'use client';

import React, { use, useState, useEffect, useRef, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import {
  MapPin, Star, Share2, Heart,
  Wifi, Coffee, Car, Wind, ChevronLeft, ChevronRight, X,
  Loader2, Utensils, Clock,
  Sofa, Trees,
  Users, Check,
  Leaf, Info, Train, Plane, FerrisWheel, Bed, Bath,
  Globe, Languages, Map as MapIcon, Calendar as CalendarIcon,
  Search, Menu, User, Bell, Heart as HeartIcon,
  Image as ImageIcon, Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { properties as mockProperties } from '@/lib/data';
import { OnboardingMap } from '@/components/onboarding-map';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  const [activeTab, setActiveCategory] = useState('overview');
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [dates, setDates] = useState<{ from: Date; to: Date }>({
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(),
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : addDays(new Date(), 3),
  });

  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: dbProperty, isLoading: loading } = useDoc(docRef);

  const property = useMemo(() => {
    if (dbProperty) return dbProperty;
    if (typeof window !== 'undefined') {
      const hiddenMocks = JSON.parse(localStorage.getItem('stayfloow_hidden_mocks') || '[]');
      if (hiddenMocks.includes(id)) return null;
    }
    return mockProperties.find(p => p.id === id);
  }, [dbProperty, id]);

  useEffect(() => {
    setIsMounted(true);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) setDates({ from: new Date(from), to: new Date(to) });
  }, [searchParams]);

  const overviewRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tabId: string) => {
    setActiveCategory(tabId);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nights = Math.max(1, differenceInDays(dates.to, dates.from));

  const roomTypes = useMemo(() => {
    if (!property) return [];
    
    // Calcul du prix dynamique basé sur le nombre d'occupants (Occupancy Pricing)
    const adults = parseInt(searchParams.get('adults') || '2');
    const children = parseInt(searchParams.get('children') || '0');
    const totalGuests = adults + children;
    
    let basePrice = property.price || 85;
    
    // Si l'hôte a défini des prix par nombre de personnes (Occupany pricing)
    if (property.useOccupancyPricing && property.occupancyPrices) {
      const guestCount = Math.min(totalGuests, property.details?.maxCapacity || 10);
      // On cherche le prix défini pour ce nombre exact de personnes
      const occupancyPrice = property.occupancyPrices[guestCount.toString()] || 
                             property.occupancyPrices[Object.keys(property.occupancyPrices).sort().pop() || ""];
      
      if (occupancyPrice) {
        basePrice = occupancyPrice;
      }
    }
    
    const types = [];
    if (property.details?.propertyType === 'hotel' || property.type?.toLowerCase().includes('hôtel')) {
      types.push({ id: 'double', name: 'Chambre Double Standard', specs: ['1 grand lit double', 'WiFi gratuit', 'Climatisation'], maxGuests: 2, price: basePrice, stock: 10 });
      types.push({ id: 'suite', name: 'Suite Parentale King Size', specs: ['1 lit King Size', 'Espace salon', 'Vue panoramique'], maxGuests: 3, price: basePrice * 1.6, stock: 3 });
    } else {
      types.push({ id: 'entire', name: `Logement entier (${property.details?.roomsCount || 1} pièces)`, specs: [`${property.details?.roomsCount || 1} chambres`, `${property.details?.bathroomsCount || 1} SDB`, 'Cuisine équipée'], maxGuests: property.details?.maxCapacity || 4, price: basePrice, stock: 1 });
    }
    return types;
  }, [property, searchParams]);

  const totalBookingPrice = Object.entries(selectedRooms).reduce((acc, [roomId, qty]) => {
    const room = roomTypes.find(r => r.id === roomId);
    return acc + (room?.price || 0) * qty * nights;
  }, 0);

  const quantityLabel = useMemo(() => {
    if (!property) return "Quantité";
    const type = property.details?.propertyType?.toLowerCase() || property.type?.toLowerCase() || "";
    if (type.includes('hotel') || type.includes('hôtel')) return "Nombre de chambres";
    if (type.includes('appartement')) return "Nombre d'appartements";
    if (type.includes('villa')) return "Nombre de villas";
    if (type.includes('maison')) return "Nombre de maisons";
    return "Quantité";
  }, [property]);

  const surroundings = useMemo(() => {
    if (!property) return [];
    const address = property.location?.address || property.location || "";
    if (typeof address !== 'string') return [];
    
    const locationLower = address.toLowerCase();
    const data = [
      { title: "Meilleures attractions", icon: Star, items: [] as any[] },
      { title: "Restaurants et cafés", icon: Utensils, items: [] as any[] },
      { title: "Transports en commun", icon: Train, items: [] as any[] },
      { title: "Aéroports les plus proches", icon: Plane, items: [] as any[] },
      { title: "Environnement naturel", icon: Leaf, items: [] as any[] }
    ];

    if (locationLower.includes('alger')) {
      data[0].items = [{ name: "Mémorial du Martyr", dist: "3,5 km" }, { name: "Casbah d'Alger", dist: "4,2 km" }, { name: "Jardin d'Essai du Hamma", dist: "2,8 km" }];
      data[1].items = [{ name: "Le Bardo", dist: "400 m" }, { name: "Restaurant L'Auberge", dist: "600 m" }];
      data[2].items = [{ name: "Métro El Hamma", dist: "300 m" }, { name: "Gare d'Alger", dist: "1,5 km" }];
      data[3].items = [{ name: "Aéroport d'Alger - Houari Boumédiène", dist: "18 km" }];
      data[4].items = [{ name: "Montagne Bouzareah", dist: "5 km" }, { name: "Mer Méditerranée", dist: "1,2 km" }];
    } else if (locationLower.includes('oran')) {
      data[0].items = [{ name: "Fort de Santa Cruz", dist: "2.5 km" }, { name: "Mosquée Abdellah Ibn Salam", dist: "1.1 km" }];
      data[1].items = [{ name: "Le Méridien", dist: "800 m" }, { name: "Café de Paris", dist: "200 m" }];
      data[2].items = [{ name: "Tramway d'Oran", dist: "500 m" }];
      data[3].items = [{ name: "Aéroport d'Oran - Ahmed Ben Bella", dist: "12 km" }];
      data[4].items = [{ name: "Montagne Murdjadjo", dist: "3 km" }];
    } else if (locationLower.includes('constantine')) {
      data[0].items = [{ name: "Ponts suspendus", dist: "1.2 km" }, { name: "Mosquée Émir Abdelkader", dist: "2.5 km" }];
      data[1].items = [{ name: "Restaurant Panorama", dist: "300 m" }];
      data[3].items = [{ name: "Aéroport de Constantine - Mohamed Boudiaf", dist: "10 km" }];
    } else {
      data[0].items = [{ name: "Centre-ville historique", dist: "1,2 km" }, { name: "Parc Municipal", dist: "800 m" }];
      data[1].items = [{ name: "Cafétéria Centrale", dist: "150 m" }, { name: "Le Gourmet", dist: "450 m" }];
      data[2].items = [{ name: "Arrêt de Bus le plus proche", dist: "200 m" }];
      data[3].items = [{ name: "Aéroport Régional", dist: "25 km" }];
    }

    return data.filter(d => d.items.length > 0);
  }, [property]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Établissement introuvable.</div>;

  const photos = property.photos || property.images || [];
  const propertyName = property.details?.name || property.name;
  const rating = property.rating || 8.5;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm hidden lg:block">
        <div className="max-w-[1100px] mx-auto px-4 flex">
          <TabButton active={activeTab === 'overview'} label="Vue d'ensemble" onClick={() => scrollToSection(overviewRef, 'overview')} />
          <TabButton active={activeTab === 'availability'} label="Disponibilité" onClick={() => scrollToSection(availabilityRef, 'availability')} />
          <TabButton active={activeTab === 'facilities'} label="Équipements" onClick={() => scrollToSection(facilitiesRef, 'facilities')} />
          <TabButton active={activeTab === 'location'} label="Localisation" onClick={() => scrollToSection(locationRef, 'location')} />
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-4 py-6 space-y-8">
        <section ref={overviewRef} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">{propertyName}</h1>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location?.address || property.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="underline decoration-dotted underline-offset-4">{property.location?.address || property.location}</span>
              </a>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button onClick={() => scrollToSection(availabilityRef, 'availability')} className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-black px-8 rounded-xl shadow-lg">Vérifier les prix</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[4/3] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl">
            <div
              className="md:col-span-2 md:row-span-2 relative cursor-pointer group"
              onClick={() => { setCurrentPhotoIndex(0); setLightboxOpen(true); }}
            >
              <Image src={photos[0]} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <div
              className="hidden md:block relative cursor-pointer group"
              onClick={() => { setCurrentPhotoIndex(1 >= photos.length ? 0 : 1); setLightboxOpen(true); }}
            >
              <Image src={photos[1] || photos[0]} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <div className="md:row-span-2 relative bg-primary flex flex-col items-center justify-center text-white p-4">
              <div className="text-4xl font-black mb-2">{rating.toFixed(1)}</div>
              <p className="font-bold text-center">Top StayFloow</p>
            </div>
            <div
              className="hidden md:block relative cursor-pointer group"
              onClick={() => { setCurrentPhotoIndex(2 >= photos.length ? 0 : 2); setLightboxOpen(true); }}
            >
              <Image src={photos[2] || photos[0]} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
            </div>
          </div>
        </section>

        <section ref={availabilityRef} className="pt-10 border-t space-y-6">
          <div className="bg-slate-50 p-4 md:p-8 rounded-[2rem] border border-slate-100"><AdvancedSearchBar hideTabs hideLocation stayOnPage={true} buttonLabel="Mettre à jour" /></div>
          <div className="border rounded-2xl overflow-hidden shadow-lg bg-white overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-900">
                <TableRow>
                  <TableHead className="text-white font-bold h-14">Type d'hébergement</TableHead>
                  <TableHead className="text-white font-bold h-14">Options</TableHead>
                  <TableHead className="text-white font-bold h-14">Tarif ({nights} nuits)</TableHead>
                  <TableHead className="text-white font-bold h-14">{quantityLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="py-6">
                      <h4 className="font-black text-primary text-lg">{room.name}</h4>
                      <ul className="mt-2 space-y-1">{room.specs.map((s, i) => <li key={i} className="text-xs text-slate-500 flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> {s}</li>)}</ul>
                    </TableCell>
                    <TableCell className="py-6"><p className="text-green-600 text-xs font-bold flex items-center gap-1"><Check className="h-3 w-3" /> Annulation GRATUITE</p></TableCell>
                    <TableCell className="py-6"><p className="text-xl font-black text-slate-900">{isMounted ? formatPrice(room.price * nights) : '...'}</p><p className="text-[10px] text-slate-400 uppercase font-black">Taxes incluses</p></TableCell>
                    <TableCell className="py-6">
                      <Select value={selectedRooms[room.id]?.toString() || "0"} onValueChange={(v) => setSelectedRooms({ ...selectedRooms, [room.id]: parseInt(v) })}>
                        <SelectTrigger className="w-24 h-12 bg-white font-black"><SelectValue /></SelectTrigger>
                        <SelectContent>{Array.from({ length: 6 }).map((_, n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalBookingPrice > 0 && (
            <div className="flex flex-col items-center md:items-end gap-6 p-8 bg-primary/5 rounded-[2rem] border-2 border-dashed border-primary/20 animate-in zoom-in-95">
              <div className="text-center md:text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de votre sélection</p>
                <p className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{isMounted ? formatPrice(totalBookingPrice) : '...'}</p>
              </div>
              <Button onClick={handleBookingClick} className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white font-black text-xl px-16 h-16 rounded-2xl shadow-xl">Je réserve mon séjour</Button>
            </div>
          )}
        </section>

        <section ref={locationRef} className="pt-10 border-t space-y-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-900">Localisation</h2>
            <div className="h-[300px] md:h-[450px] rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl">
              <OnboardingMap location={property.location?.address || property.location} />
            </div>
          </div>

          <div className="space-y-8 bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100">
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Environs de l'établissement</h2>
              <p className="text-sm font-medium text-slate-500">Les distances sont calculées à vol d'oiseau. La distance réelle peut varier.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
              {surroundings.map((group, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-900 font-black text-sm uppercase tracking-wider">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                      <group.icon className="w-5 h-5 text-primary" />
                    </div>
                    {group.title}
                  </div>
                  <div className="space-y-3 pl-11">
                    {group.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-baseline gap-4 text-sm">
                        <span className="text-slate-600 font-medium">{item.name}</span>
                        <span className="text-slate-400 font-bold whitespace-nowrap">{item.dist}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox Overlay */}
      {lightboxOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-300"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
            }}
            className="absolute left-4 md:left-10 text-white/70 hover:text-white p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-[110]"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <div className="relative w-full max-w-5xl aspect-[4/3] md:aspect-video px-4 md:px-0" onClick={e => e.stopPropagation()}>
            <Image
              src={photos[currentPhotoIndex] || photos[0]}
              alt={`Photo ${currentPhotoIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
            }}
            className="absolute right-4 md:right-10 text-white/70 hover:text-white p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-[110]"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-bold bg-black/50 px-6 py-2 rounded-full text-base z-[110]">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </div>
  );

  function handleBookingClick() {
    const query = new URLSearchParams({ from: dates.from.toISOString(), to: dates.to.toISOString(), total: totalBookingPrice.toString() }).toString();
    router.push(`/properties/${id}/book?${query}`);
  }
}

function TabButton({ active, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-4", active ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-primary")}>{label}</button>
  );
}
