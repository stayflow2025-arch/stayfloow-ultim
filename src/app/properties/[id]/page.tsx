'use client';

import React, { use, useState, useEffect, useRef, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import {
  MapPin, Star, Share2, Heart,
  Wifi, Coffee, Car, Wind, ChevronLeft, ChevronRight, X,
  Loader2, Utensils, Clock,
  Sofa, Trees,
  Users, Check,
  Leaf, Info, Train, Plane, FerrisWheel, Bed, Bath,
  Globe, Languages, Map as MapIcon, Calendar as CalendarIcon,
  Search, Menu, User, Bell, Heart as HeartIcon,
  Image as ImageIcon, Share,
  ThumbsUp, ThumbsDown, MessageSquare, BedDouble, Waves, Dumbbell, Bus, Ban, BellRing as BellConcierge, Flower2
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
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
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { properties as mockProperties } from '@/lib/data';
import { OnboardingMap } from '@/components/onboarding-map';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { Suspense } from 'react';

const placeholderImg = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

export default function PropertyPage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) return null;

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <PropertyPageContent id={id} />
    </Suspense>
  );
}

function PropertyPageContent({ id }: { id: string }) {
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

  const [dates, setDates] = useState<{ from: Date; to: Date }>(() => {
    // Initialisation stable pour éviter le mismatch d'hydratation
    return { from: new Date(), to: addDays(new Date(), 3) };
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
    if (from && to) {
      const dFrom = new Date(from);
      const dTo = new Date(to);
      if (!isNaN(dFrom.getTime()) && !isNaN(dTo.getTime())) {
        setDates({ from: dFrom, to: dTo });
      }
    }
  }, [searchParams]);

  // 3. Charger les avis pour cet établissement
  const reviewsRef = useMemoFirebase(() => {
    return query(
      collection(db, 'reviews'), 
      where('listingId', '==', id),
      where('status', '==', 'published')
    );
  }, [db, id]);
  const { data: reviews, isLoading: reviewsLoading } = useCollection(reviewsRef);

  const aggregateRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return { overall: property?.rating || 8.5, count: 0, categories: {} };
    
    const count = reviews.length;
    const overall = reviews.reduce((acc: number, r: any) => acc + (r.overallRating || 0), 0) / count;
    
    const cats: any = { staff: 0, facilities: 0, cleanliness: 0, comfort: 0, location: 0 };
    reviews.forEach((r: any) => {
      if (r.categories) {
        Object.keys(cats).forEach(key => cats[key] += (r.categories[key] || 0));
      }
    });
    
    Object.keys(cats).forEach(key => cats[key] = (cats[key] / count).toFixed(1));

    return { overall: overall.toFixed(1), count, categories: cats };
  }, [reviews, property]);

  const overviewRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tabId: string) => {
    setActiveCategory(tabId);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nights = useMemo(() => {
    if (!dates.from || !dates.to) return 1;
    const diff = differenceInDays(dates.to, dates.from);
    return isNaN(diff) ? 1 : Math.max(1, diff);
  }, [dates]);

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
      const details = property.details || {};
      let added = false;
      
      if (Number(details.singleRoomsCount) > 0) {
        types.push({ id: 'single', name: 'Chambre Simple', specs: [details.singleRoomBeds || '1 lit simple', 'WiFi gratuit', 'Climatisation'], maxGuests: details.singleRoomCapacity || 1, price: basePrice * 0.7, stock: Number(details.singleRoomsCount) });
        added = true;
      }
      if (Number(details.doubleRoomsCount) > 0) {
        types.push({ id: 'double', name: 'Chambre Double', specs: [details.doubleRoomBeds || '1 grand lit double', 'WiFi gratuit', 'Climatisation'], maxGuests: details.doubleRoomCapacity || 2, price: basePrice, stock: Number(details.doubleRoomsCount) });
        added = true;
      }
      if (Number(details.tripleRoomsCount) > 0) {
        types.push({ id: 'triple', name: 'Chambre Triple', specs: [details.tripleRoomBeds || '1 lit double + 1 lit simple', 'WiFi gratuit', 'Climatisation'], maxGuests: details.tripleRoomCapacity || 3, price: basePrice * 1.3, stock: Number(details.tripleRoomsCount) });
        added = true;
      }
      if (Number(details.parentalSuitesCount) > 0) {
        types.push({ id: 'suite', name: 'Suite Parentale', specs: [details.suiteBeds || '1 lit King Size', 'Espace salon', 'Vue panoramique'], maxGuests: details.suiteCapacity || 4, price: basePrice * 1.6, stock: Number(details.parentalSuitesCount) });
        added = true;
      }

      // Fallback si l'hôtel n'a pas configuré ses chambres
      if (!added) {
        types.push({ id: 'double', name: 'Chambre Double', specs: ['1 grand lit double', 'WiFi gratuit', 'Climatisation'], maxGuests: 2, price: basePrice, stock: 10 });
        types.push({ id: 'suite', name: 'Suite Parentale', specs: ['1 lit King Size', 'Espace salon', 'Vue panoramique'], maxGuests: 3, price: basePrice * 1.6, stock: 3 });
      }
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
    if (typeof address !== 'string' || address.length < 2) return [];
    
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
  const propertyName = property.details?.name || property.name || "Hébergement";
  const rating = property.rating || 8.5;
  const placeholderImg = 'https://picsum.photos/seed/stay/800/600';

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm hidden lg:block">
        <div className="max-w-[1100px] mx-auto px-4 flex">
          <TabButton active={activeTab === 'overview'} label="Vue d'ensemble" onClick={() => scrollToSection(overviewRef, 'overview')} />
          <TabButton active={activeTab === 'availability'} label="Disponibilité" onClick={() => scrollToSection(availabilityRef, 'availability')} />
          <TabButton active={activeTab === 'facilities'} label="Équipements" onClick={() => scrollToSection(facilitiesRef, 'facilities')} />
          <TabButton active={activeTab === 'location'} label="Localisation" onClick={() => scrollToSection(locationRef, 'location')} />
          <TabButton active={activeTab === 'reviews'} label={`Avis (${aggregateRating.count})`} onClick={() => setActiveCategory('reviews')} />
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-4 py-6 space-y-8">
        <section ref={overviewRef} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight flex items-center flex-wrap gap-2">
                {propertyName}
                {(property.details?.propertyType === 'hotel' || property.type?.toLowerCase().includes('hôtel')) && Number(property.details?.stars) > 0 && (
                  <span className="flex items-center gap-0.5 mt-1">
                    {Array.from({ length: Number(property.details.stars) }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 md:w-6 md:h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </span>
                )}
              </h1>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(property.location?.address || property.location || ""))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="underline decoration-dotted underline-offset-4">{String(property.location?.address || property.location || "")}</span>
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
              <Image src={photos[0] || placeholderImg} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <div
              className="hidden md:block relative cursor-pointer group"
              onClick={() => { setCurrentPhotoIndex(1 >= photos.length ? 0 : 1); setLightboxOpen(true); }}
            >
              <Image src={photos[1] || photos[0] || placeholderImg} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <div className="md:row-span-2 relative bg-primary flex flex-col items-center justify-center text-white p-4">
              <div className="text-4xl font-black mb-1">{aggregateRating.overall}</div>
              <p className="font-bold text-center text-xs">Top StayFloow</p>
              <div className="mt-2 text-[10px] font-medium opacity-80 uppercase tracking-tighter">{aggregateRating.count} avis clients</div>
            </div>
            <div
              className="hidden md:block relative cursor-pointer group"
              onClick={() => { setCurrentPhotoIndex(2 >= photos.length ? 0 : 2); setLightboxOpen(true); }}
            >
              <Image src={photos[2] || photos[0] || placeholderImg} alt="Stay" fill className="object-cover group-hover:opacity-90 transition-opacity" />
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
                  <TableHead className="text-white font-bold h-14">Capacité</TableHead>
                  <TableHead className="text-white font-bold h-14">Options</TableHead>
                  <TableHead className="text-white font-bold h-14">Tarif ({nights} {nights > 1 ? 'nuits' : 'nuit'})</TableHead>
                  <TableHead className="text-white font-bold h-14">{quantityLabel}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id} className="hover:bg-slate-50 border-slate-100">
                    <TableCell className="py-6">
                      <h4 className="font-black text-primary text-lg">{room.name}</h4>
                      {room.specs && room.specs.length > 0 && (
                        <div className="mt-2 mb-3">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <span>{room.specs[0]}</span>
                            <span className="flex items-center gap-0.5 ml-1">
                              {(() => {
                                const str = room.specs[0].toLowerCase();
                                const icons = [];
                                let k = 0;
                                if (str.includes('grand lit') || str.includes('king size') || str.includes('lit double')) {
                                  icons.push(<BedDouble key={k++} className="w-5 h-5 text-slate-700" />);
                                }
                                if (str.includes('2 lits simples') || str.includes('jumeaux')) {
                                  icons.push(<Bed key={k++} className="w-5 h-5 text-slate-700" />, <Bed key={k++} className="w-5 h-5 text-slate-700" />);
                                } else if (str.includes('3 lits simples')) {
                                  icons.push(<Bed key={k++} className="w-5 h-5 text-slate-700" />, <Bed key={k++} className="w-5 h-5 text-slate-700" />, <Bed key={k++} className="w-5 h-5 text-slate-700" />);
                                } else if (str.includes('1 lit simple')) {
                                  icons.push(<Bed key={k++} className="w-5 h-5 text-slate-700" />);
                                }
                                if (str.includes('canapé')) {
                                  icons.push(<Sofa key={k++} className="w-5 h-5 text-slate-700" />);
                                }
                                if (icons.length === 0) icons.push(<Bed key={k++} className="w-5 h-5 text-slate-700" />);
                                return icons;
                              })()}
                            </span>
                          </div>
                          <ul className="mt-2 space-y-1">
                            {room.specs.slice(1).map((s: string, i: number) => (
                              <li key={i} className="text-xs text-slate-500 flex items-center gap-2">
                                <Check className="h-3 w-3 text-primary" /> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                        <User className="h-5 w-5 text-primary" />
                        <span>x {room.maxGuests}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6"><p className="text-green-600 text-xs font-bold flex items-center gap-1"><Check className="h-3 w-3" /> Annulation GRATUITE</p></TableCell>
                    <TableCell className="py-6"><p className="text-xl font-black text-slate-900">{isMounted ? formatPrice((room.price || 85) * nights) : '...'}</p><p className="text-[10px] text-slate-400 uppercase font-black">Taxes incluses</p></TableCell>
                    <TableCell className="py-6">
                      <Select value={selectedRooms[room.id]?.toString() || "0"} onValueChange={(v) => setSelectedRooms({ ...selectedRooms, [room.id]: parseInt(v) })}>
                        <SelectTrigger className="w-24 h-12 bg-white font-black"><SelectValue /></SelectTrigger>
                        <SelectContent>{Array.from({ length: (room.stock || 1) + 1 }).map((_, n) => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
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

        <section ref={facilitiesRef} className="pt-10 border-t space-y-8">
          <h2 className="text-2xl font-black text-slate-900">Ses points forts</h2>
          {property.details?.amenities && property.details.amenities.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {property.details.amenities.map((amenity: string, idx: number) => {
                let Icon = Check;
                const lower = amenity.toLowerCase();
                if (lower.includes('wifi') || lower.includes('wi-fi')) Icon = Wifi;
                else if (lower.includes('piscine')) Icon = Waves;
                else if (lower.includes('parking')) Icon = Car;
                else if (lower.includes('climatisation')) Icon = Wind;
                else if (lower.includes('spa') || lower.includes('bien-être')) Icon = Flower2;
                else if (lower.includes('salle de sport') || lower.includes('remise en forme')) Icon = Dumbbell;
                else if (lower.includes('navette')) Icon = Bus;
                else if (lower.includes('petit-déjeuner') || lower.includes('bouilloire')) Icon = Coffee;
                else if (lower.includes('non-fumeurs')) Icon = Ban;
                else if (lower.includes("service d'étage")) Icon = BellConcierge;

                return (
                  <div key={idx} className="flex items-center gap-3 text-slate-700">
                    <Icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-sm">{amenity}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-slate-500">Aucun équipement spécifié.</p>
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

        {/* SECTION AVIS CLIENTS */}
        <section className="pt-10 border-t space-y-10">
           <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ce qu'en disent les voyageurs</h2>
              <div className="flex items-center gap-3">
                <div className="bg-primary text-white text-2xl font-black px-4 py-2 rounded-2xl shadow-lg shadow-primary/20">{aggregateRating.overall}</div>
                <div>
                   <p className="font-black text-slate-900 leading-tight">Exceptionnel</p>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{aggregateRating.count} avis certifiés</p>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { label: 'Personnel', key: 'staff' },
                { label: 'Équipements', key: 'facilities' },
                { label: 'Propreté', key: 'cleanliness' },
                { label: 'Confort', key: 'comfort' },
                { label: 'Rapport qualité/prix', key: 'value' },
                { label: 'Situation géographique', key: 'location' }
              ].map((c) => (
                <div key={c.key} className="space-y-2">
                   <div className="flex justify-between text-sm font-black text-slate-700">
                      <span>{c.label}</span>
                      <span>{(aggregateRating.categories as any)[c.key] || '8.5'}</span>
                   </div>
                   <Progress value={(parseFloat((aggregateRating.categories as any)[c.key] || '8.5') / 10) * 100} className="h-1.5 bg-slate-100" />
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              {reviews?.map((r: any) => {
                const reviewDate = r.createdAt?.toDate ? r.createdAt.toDate() : new Date(r.createdAt || Date.now());
                const safeDate = isNaN(reviewDate.getTime()) ? new Date() : reviewDate;
                
                return (
                  <Card key={r.id} className="border-none shadow-xl rounded-3xl p-8 bg-white hover:scale-[1.01] transition-transform">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-primary font-black text-xl">
                              {r.customerName?.charAt(0) || 'C'}
                          </div>
                          <div>
                              <h4 className="font-black text-slate-900">{r.customerName || 'Voyageur StayFloow'}</h4>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">
                                  Voyage en {r.transport || 'voiture'} • {safeDate instanceof Date && !isNaN(safeDate.getTime()) ? format(safeDate, 'MMMM yyyy', { locale: fr }) : "Date inconnue"}
                                </p>
                          </div>
                        </div>
                        <div className="bg-primary/10 text-primary font-black px-3 py-1 rounded-lg text-lg">
                          {r.overallRating || 8}
                        </div>
                    </div>

                    <h5 className="font-black text-lg text-slate-800 mb-4 italic leading-tight">"{r.commentSummary || 'Aucun résumé disponible'}"</h5>
                    
                    <div className="space-y-3">
                        {r.commentLikes && (
                          <div className="flex gap-3 text-sm font-medium text-slate-600">
                             <ThumbsUp className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                             <p>{r.commentLikes}</p>
                          </div>
                        )}
                        {r.commentDislikes && (
                          <div className="flex gap-3 text-sm font-medium text-slate-500">
                             <ThumbsDown className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                             <p>{r.commentDislikes}</p>
                          </div>
                        )}
                    </div>

                    {r.photos && r.photos.length > 0 && (
                      <div className="flex gap-2 mt-6 overflow-x-auto pb-2 no-scrollbar">
                          {r.photos.map((p: string, i: number) => (
                             <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                                <Image 
                                  src={typeof p === 'string' && p ? p : "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"} 
                                  alt="Review" 
                                  fill 
                                  className="object-cover" 
                                />
                             </div>
                          ))}
                      </div>
                    )}
                  </Card>
                );
              })}

              {(!reviews || reviews.length === 0) && (
                <div className="md:col-span-2 py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                   <h4 className="font-black text-slate-400 uppercase tracking-widest">Aucun avis pour le moment</h4>
                   <p className="text-xs text-slate-400 mt-2">Soyez le premier à donner votre avis après votre séjour !</p>
                </div>
              )}
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
    const query = new URLSearchParams({ 
      from: dates.from instanceof Date && !isNaN(dates.from.getTime()) ? dates.from.toISOString() : new Date().toISOString(), 
      to: dates.to instanceof Date && !isNaN(dates.to.getTime()) ? dates.to.toISOString() : addDays(new Date(), 3).toISOString(), 
      total: (totalBookingPrice || 0).toString() 
    }).toString();
    router.push(`/properties/${id}/book?${query}`);
  }
}


function TabButton({ active, label, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-4", active ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-400 hover:text-primary")}>{label}</button>
  );
}
