'use client';

import React, { use, useState, useEffect, useRef, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MapPin, Star, Share2, Heart, 
  Wifi, Coffee, Car, Wind, ChevronLeft, 
  Loader2, Utensils, Clock, 
  Sofa, Trees,
  Users, Check,
  Leaf, Info, Train, Plane, FerrisWheel, Bed, Bath,
  Calendar as CalendarIcon,
  Tent
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

  const [dates, setDates] = useState<{ from: Date; to: Date }>({
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(),
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : addDays(new Date(), 3),
  });

  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: dbProperty, isLoading: loading } = useDoc(docRef);

  const property = useMemo(() => dbProperty || mockProperties.find(p => p.id === id), [dbProperty, id]);

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
    const basePrice = property.price || 85;
    const types = [];
    if (property.details?.propertyType === 'hotel' || property.type?.toLowerCase().includes('hôtel')) {
      types.push({ id: 'double', name: 'Chambre Double Standard', specs: ['1 grand lit double', 'WiFi gratuit', 'Climatisation'], maxGuests: 2, price: basePrice, stock: 10 });
      types.push({ id: 'suite', name: 'Suite Parentale King Size', specs: ['1 lit King Size', 'Espace salon', 'Vue panoramique'], maxGuests: 3, price: basePrice * 1.6, stock: 3 });
    } else {
      types.push({ id: 'entire', name: `Logement entier (${property.details?.roomsCount || 1} pièces)`, specs: [`${property.details?.roomsCount || 1} chambres`, `${property.details?.bathroomsCount || 1} SDB`, 'Cuisine équipée'], maxGuests: 4, price: basePrice, stock: 1 });
    }
    return types;
  }, [property]);

  const totalBookingPrice = Object.entries(selectedRooms).reduce((acc, [roomId, qty]) => {
    const room = roomTypes.find(r => r.id === roomId);
    return acc + (room?.price || 0) * qty * nights;
  }, 0);

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
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{property.location?.address || property.location}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button onClick={() => scrollToSection(availabilityRef, 'availability')} className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-black px-8 rounded-xl shadow-lg">Vérifier les prix</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 aspect-[4/3] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-xl">
            <div className="md:col-span-2 md:row-span-2 relative"><Image src={photos[0]} alt="Stay" fill className="object-cover" /></div>
            <div className="hidden md:block relative"><Image src={photos[1] || photos[0]} alt="Stay" fill className="object-cover" /></div>
            <div className="md:row-span-2 relative bg-primary flex flex-col items-center justify-center text-white p-4">
              <div className="text-4xl font-black mb-2">{rating.toFixed(1)}</div>
              <p className="font-bold text-center">Top StayFloow</p>
            </div>
            <div className="hidden md:block relative"><Image src={photos[2] || photos[0]} alt="Stay" fill className="object-cover" /></div>
          </div>
        </section>

        <section ref={availabilityRef} className="pt-10 border-t space-y-6">
          <div className="bg-slate-50 p-4 md:p-8 rounded-[2rem] border border-slate-100"><AdvancedSearchBar hideTabs buttonLabel="Mettre à jour" /></div>
          <div className="border rounded-2xl overflow-hidden shadow-lg bg-white overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader className="bg-slate-900">
                <TableRow>
                  <TableHead className="text-white font-bold h-14">Type d'hébergement</TableHead>
                  <TableHead className="text-white font-bold h-14">Options</TableHead>
                  <TableHead className="text-white font-bold h-14">Tarif ({nights} nuits)</TableHead>
                  <TableHead className="text-white font-bold h-14">Quantité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="py-6">
                      <h4 className="font-black text-primary text-lg">{room.name}</h4>
                      <ul className="mt-2 space-y-1">{room.specs.map((s, i) => <li key={i} className="text-xs text-slate-500 flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> {s}</li>)}</ul>
                    </TableCell>
                    <TableCell className="py-6"><p className="text-green-600 text-xs font-bold flex items-center gap-1"><Check className="h-3 w-3"/> Annulation GRATUITE</p></TableCell>
                    <TableCell className="py-6"><p className="text-xl font-black text-slate-900">{isMounted ? formatPrice(room.price * nights) : '...'}</p><p className="text-[10px] text-slate-400 uppercase font-black">Taxes incluses</p></TableCell>
                    <TableCell className="py-6">
                      <Select value={selectedRooms[room.id]?.toString() || "0"} onValueChange={(v) => setSelectedRooms({...selectedRooms, [room.id]: parseInt(v)})}>
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

        <section ref={locationRef} className="pt-10 border-t space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Localisation</h2>
          <div className="h-[300px] md:h-[450px] rounded-3xl overflow-hidden border-4 border-slate-50 shadow-xl"><OnboardingMap location={property.location?.address || property.location} /></div>
        </section>
      </main>
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
