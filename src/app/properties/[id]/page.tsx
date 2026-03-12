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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';
import { format, addDays, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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

  // Search state from URL or defaults
  const [dates, setDates] = useState<{ from: Date; to: Date }>({
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(),
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : addDays(new Date(), 3),
  });

  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: dbProperty, isLoading: loading } = useDoc(docRef);

  // Fallback to mock data if not found in Firestore
  const property = useMemo(() => {
    if (dbProperty) return dbProperty;
    return mockProperties.find(p => p.id === id);
  }, [dbProperty, id]);

  // Sync dates with URL changes
  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) {
      setDates({ from: new Date(from), to: new Date(to) });
    }
  }, [searchParams]);

  // Refs for smooth scroll
  const overviewRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const surroundingsRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tabId: string) => {
    setActiveCategory(tabId);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nights = useMemo(() => {
    return Math.max(1, differenceInDays(dates.to, dates.from));
  }, [dates]);

  // Room types calculation...
  const roomTypes = useMemo(() => {
    if (!property) return [];
    
    const details = property.details || property;
    const types = [];
    const basePrice = property.price || 10000;

    if (details.propertyType === 'hotel' || details.type?.toLowerCase().includes('hôtel') || details.type?.toLowerCase().includes('riad')) {
      const singleCount = details.singleRoomsCount || 0;
      const doubleCount = details.doubleRoomsCount || 0; 
      const suiteCount = details.parentalSuitesCount || 0;

      if (singleCount > 0) {
        types.push({
          id: 'single',
          name: 'Chambre Individuelle Confort',
          size: '18m²',
          specs: ['1 lit simple', 'WiFi haut débit', 'Salle de bain privée'],
          maxGuests: 1,
          price: basePrice * 0.8,
          stock: singleCount
        });
      }
      
      if (doubleCount > 0 || (singleCount === 0 && suiteCount === 0)) {
        types.push({
          id: 'double',
          name: 'Chambre Double Standard',
          size: '24m²',
          specs: ['1 grand lit double', 'WiFi haut débit', 'Climatisation'],
          maxGuests: 2,
          price: basePrice,
          stock: doubleCount > 0 ? doubleCount : 10
        });
      }

      if (suiteCount > 0) {
        types.push({
          id: 'suite',
          name: 'Suite Parentale King Size',
          size: '45m²',
          specs: ['1 lit King Size', 'Espace salon privatif', 'Vue panoramique'],
          maxGuests: 3,
          price: basePrice * 1.6,
          stock: suiteCount
        });
      }
    } else {
      types.push({
        id: 'entire',
        name: `Logement entier (${details.roomsCount || 1} pièces)`,
        size: '120m²',
        specs: [
          `${details.roomsCount || 1} chambres`, 
          `${details.bathroomsCount || 1} SDB`, 
          details.cuisinesCount ? `${details.cuisinesCount} cuisine(s)` : null,
          details.livingRoomsCount ? `${details.livingRoomsCount} salon(s)` : null,
          details.gardensCount ? `${details.gardensCount} jardin(s)` : null,
          'Cuisine équipée premium'
        ].filter(Boolean) as string[],
        maxGuests: details.maxCapacity || (details.roomsCount || 1) * 2 || 4,
        price: basePrice,
        stock: 1
      });
    }

    return types;
  }, [property]);

  const totalBookingPrice = Object.entries(selectedRooms).reduce((acc, [roomId, qty]) => {
    const room = roomTypes.find(r => r.id === roomId);
    return acc + (room?.price || 0) * qty * nights;
  }, 0);

  const surroundings = useMemo(() => {
    if (!property) return null;
    const addr = (property.location?.address || property.location || "").toLowerCase();
    
    if (addr.includes("alger")) {
      return {
        attractions: [
          { name: "Jardin d'Essai du Hamma", dist: "1,2 km" },
          { name: "Casbah d'Alger", dist: "2,8 km" }
        ],
        restaurants: [
          { name: "Café El Kheima", dist: "300 m" }
        ],
        nature: [
          { name: "Mer - Baie d'Alger", dist: "500 m" }
        ],
        transport: [
          { name: "Métro - Station Tafourah", dist: "900 m" }
        ],
        airports: [
          { name: "Aéroport d'Alger", dist: "18 km" }
        ]
      };
    }
    
    return {
      attractions: [{ name: "Centre-ville historique", dist: "1,5 km" }],
      restaurants: [{ name: "Restaurant La Table", dist: "300 m" }],
      nature: [{ name: "Parc municipal", dist: "1,1 km" }],
      transport: [{ name: "Arrêt de bus", dist: "250 m" }],
      airports: [{ name: "Aéroport le plus proche", dist: "25 km" }]
    };
  }, [property]);

  const handleBookingClick = () => {
    const query = new URLSearchParams({
      from: dates.from.toISOString(),
      to: dates.to.toISOString(),
      total: totalBookingPrice.toString(),
      rooms: JSON.stringify(selectedRooms)
    }).toString();
    router.push(`/properties/${id}/book?${query}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl text-center max-w-md">
          <Info className="h-16 w-16 text-primary/20 mx-auto mb-6" />
          <h1 className="text-2xl font-black text-slate-900 mb-2">Hébergement introuvable</h1>
          <p className="text-slate-500 mb-8">Désolé, nous ne parvenons pas à trouver les détails de cet établissement.</p>
          <Button className="bg-primary hover:bg-primary/90 font-black px-8 h-12 rounded-xl" onClick={() => router.push('/')}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  const photos = property.photos || property.images || [];
  const propertyName = property.details?.name || property.name;
  const rating = property.rating || 8.5;
  const reviewsCount = property.reviewsCount || 125;
  const stars = property.details?.stars || property.stars || 4;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-white border-b shadow-sm hidden md:block">
        <div className="max-w-[1100px] mx-auto px-4 flex">
          <TabButton active={activeTab === 'overview'} label="Vue d'ensemble" onClick={() => scrollToSection(overviewRef, 'overview')} />
          <TabButton active={activeTab === 'availability'} label="Disponibilité" onClick={() => scrollToSection(availabilityRef, 'availability')} />
          <TabButton active={activeTab === 'facilities'} label="Équipements" onClick={() => scrollToSection(facilitiesRef, 'facilities')} />
          <TabButton active={activeTab === 'surroundings'} label="Environs" onClick={() => scrollToSection(surroundingsRef, 'surroundings')} />
          <TabButton active={activeTab === 'location'} label="Localisation" onClick={() => scrollToSection(locationRef, 'location')} />
          <TabButton active={activeTab === 'rules'} label="Règles de la maison" onClick={() => scrollToSection(rulesRef, 'rules')} />
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-4 py-6 space-y-8">
        
        {/* Section 1: Header & Gallery */}
        <section ref={overviewRef} className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(stars)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#FEBA02] text-[#FEBA02]" />
                  ))}
                </div>
                <Badge className="bg-primary/10 text-primary border-none flex items-center gap-1 h-5 text-[10px] font-bold uppercase">
                  <Leaf className="h-3 w-3" /> Certificat StayFloow Pro
                </Badge>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{propertyName}</h1>
              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{property.location?.address || property.location} — </span>
                <button onClick={() => scrollToSection(locationRef, 'location')} className="text-primary font-bold hover:underline">Voir l'emplacement sur la carte</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5"><Heart className="h-6 w-6" /></Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5"><Share2 className="h-6 w-6" /></Button>
              <Button 
                onClick={() => scrollToSection(availabilityRef, 'availability')}
                className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-10 rounded-md"
              >
                Vérifier les prix
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden shadow-md">
            <div className="md:col-span-2 md:row-span-2 relative cursor-pointer group">
              <Image src={photos[0] || 'https://picsum.photos/seed/p1/800/600'} alt="Main" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative cursor-pointer group">
              <Image src={photos[1] || 'https://picsum.photos/seed/p2/800/600'} alt="Side 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="md:row-span-2 relative bg-slate-900 overflow-hidden flex items-center justify-center group cursor-pointer">
              <Image src={photos[2] || 'https://picsum.photos/seed/p3/800/600'} alt="Side 2" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white p-4">
                <div className="bg-[#10B981] text-white font-black text-xl w-14 h-14 flex items-center justify-center rounded-sm shadow-xl mb-2">
                  {rating.toFixed(1)}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg leading-none mb-1">{rating >= 9 ? "Fabuleux" : "Très bien"}</p>
                  <p className="text-[11px] opacity-80">{reviewsCount} avis certifiés</p>
                </div>
              </div>
            </div>
            <div className="relative group cursor-pointer">
              <Image src={photos[3] || 'https://picsum.photos/seed/p4/800/600'} alt="Side 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative group cursor-pointer bg-slate-100">
              <Image src={photos[4] || 'https://picsum.photos/seed/p5/800/600'} alt="Side 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm underline">+ {photos.length > 5 ? photos.length - 5 : 0} photos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Availability Section with Advanced Search Bar */}
        <section ref={availabilityRef} className="space-y-6 pt-10 border-t">
          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <AdvancedSearchBar hideTabs buttonLabel="Modifier la recherche" />
          </div>

          <div className="border rounded-md overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-[#4C4C4C] hover:bg-[#4C4C4C]">
                <TableRow>
                  <TableHead className="text-white font-bold py-4">Option d'hébergement</TableHead>
                  <TableHead className="text-white font-bold text-center">Capacité</TableHead>
                  <TableHead className="text-white font-bold">Tarif total ({nights} nuits)</TableHead>
                  <TableHead className="text-white font-bold">Conditions</TableHead>
                  <TableHead className="text-white font-bold">Quantité</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id} className="hover:bg-slate-50">
                    <TableCell className="align-top py-6">
                      <div className="space-y-3">
                        <h4 className="font-bold text-[#10B981] underline cursor-pointer text-[15px]">{room.name}</h4>
                        <ul className="space-y-1">
                          {room.specs.map((spec, i) => (
                            <li key={i} className="flex items-center gap-2 text-[12px] text-slate-600">
                              <Check className="h-3 w-3 text-primary" /> {spec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-top py-6">
                      <div className="flex justify-center gap-0.5">
                        {[...Array(room.maxGuests)].map((_, i) => <Users key={i} className="h-4 w-4 text-slate-400" />)}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Max {room.maxGuests} pers.</span>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <p className="font-black text-lg text-slate-900">{formatPrice(room.price * nights)}</p>
                      <p className="text-[10px] text-slate-400">Toutes taxes incluses</p>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="text-[12px] space-y-1">
                        <p className="text-green-600 font-bold flex items-center gap-1"><Check className="h-3 w-3"/> Petit-déjeuner inclus</p>
                        <p className="text-green-600 font-bold flex items-center gap-1"><Check className="h-3 w-3"/> Annulation GRATUITE</p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <Select 
                        value={selectedRooms[room.id]?.toString() || "0"}
                        onValueChange={(val) => setSelectedRooms({...selectedRooms, [room.id]: parseInt(val)})}
                      >
                        <SelectTrigger className="w-full bg-white border-slate-300 h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: Math.min(6, room.stock + 1) }).map((_, n) => (
                            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-[9px] text-slate-400 mt-1 uppercase font-bold text-center">{room.stock} dispo(s)</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalBookingPrice > 0 && (
            <div className="flex flex-col items-end gap-6 mt-8 p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="text-right">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Total de votre sélection</p>
                <p className="text-4xl font-black text-[#10B981] tracking-tighter">{formatPrice(totalBookingPrice)}</p>
              </div>
              <Button 
                onClick={handleBookingClick}
                className="bg-[#10B981] hover:bg-[#0da372] text-white font-black text-xl px-16 py-8 rounded-xl shadow-xl transition-all active:scale-95"
              >
                Je réserve mon séjour
              </Button>
            </div>
          )}
        </section>

        {/* Section 3: Facilities Grid */}
        <section ref={facilitiesRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Équipements de l'établissement</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <FacilityIcon icon={<Wifi/>} label="Wi-Fi gratuit" />
            <FacilityIcon icon={<Utensils/>} label="Restaurant" />
            <FacilityIcon icon={<Car/>} label="Parking privé" />
            <FacilityIcon icon={<Wind/>} label="Climatisation" />
            <FacilityIcon icon={<Coffee/>} label="Thé & Café" />
            <FacilityIcon icon={<Clock/>} label="Conciergerie 24h/24" />
          </div>
        </section>

        {/* Section 4: Composition Technique */}
        <section className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Composition & Espaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Bed className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Chambres</p>
                <p className="text-lg font-black text-slate-900">{property.details?.roomsCount || 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Bath className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">SDB</p>
                <p className="text-lg font-black text-slate-900">{property.details?.bathroomsCount || 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Users className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Capacité</p>
                <p className="text-lg font-black text-slate-900">{property.details?.maxCapacity || property.details?.maxGroupSize || 2} Pers.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Utensils className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Cuisines</p>
                <p className="text-lg font-black text-slate-900">{property.details?.cuisinesCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Sofa className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Salons</p>
                <p className="text-lg font-black text-slate-900">{property.details?.livingRoomsCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Trees className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Jardins</p>
                <p className="text-lg font-black text-slate-900">{property.details?.gardensCount || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="bg-primary/10 p-3 rounded-xl text-primary"><Tent className="h-6 w-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Toilettes</p>
                <p className="text-lg font-black text-slate-900">{property.details?.toiletsCount || 1}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section Surrounding POIs */}
        <section ref={surroundingsRef} className="space-y-8 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Aux alentours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-[15px] text-slate-900"><FerrisWheel className="h-5 w-5 text-slate-600" /> Attractions touristiques</h3>
              {surroundings?.attractions.map((item, i) => <SurroundingRow key={i} label={item.name} dist={item.dist} />)}
            </div>
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 font-bold text-[15px] text-slate-900"><Plane className="h-5 w-5 text-slate-600" /> Aéroports & Transports</h3>
              {surroundings?.airports.map((item, i) => <SurroundingRow key={i} label={item.name} dist={item.dist} />)}
            </div>
          </div>
        </section>

        {/* Section Location & Map */}
        <section ref={locationRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Localisation précise</h2>
          <div className="rounded-2xl overflow-hidden border-4 border-slate-50 shadow-xl h-[400px]">
            <OnboardingMap location={property.location?.address || property.location} />
          </div>
        </section>

        {/* Section Rules */}
        <section ref={rulesRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Règles & Conditions</h2>
          <div className="border rounded-md">
            <RuleRow icon={<Clock/>} label="Arrivée" value="De 14h00 à 23h00 (Arrivée tardive possible sur demande)" />
            <RuleRow icon={<Clock/>} label="Départ" value="Avant 12h00" />
            <RuleRow icon={<Info/>} label="Annulation" value="Annulation gratuite jusqu'à 48 heures avant l'arrivée." />
          </div>
        </section>
      </main>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className={cn("px-6 py-4 text-[13px] font-bold transition-all border-b-4", active ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-500 hover:text-primary hover:bg-slate-50")}>{label}</button>
  );
}

function FacilityIcon({ icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center p-4">
      <div className="text-primary">{icon}</div>
      <span className="text-[12px] font-medium text-slate-600">{label}</span>
    </div>
  );
}

function SurroundingRow({ label, dist }: { label: string, dist: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-[13px] text-slate-700 font-medium">{label}</span>
      <span className="text-[12px] text-slate-500 font-bold whitespace-nowrap">{dist}</span>
    </div>
  );
}

function RuleRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex flex-col md:flex-row border-b last:border-0">
      <div className="md:w-48 p-4 bg-slate-50 flex items-center gap-3">
        <div className="text-slate-400">{icon}</div>
        <span className="text-[13px] font-bold text-slate-700">{label}</span>
      </div>
      <div className="flex-1 p-4 bg-white flex items-center">
        <span className="text-[13px] text-slate-600">{value}</span>
      </div>
    </div>
  );
}
