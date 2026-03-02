'use client';

import React, { use, useState, useEffect, useRef, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, 
  Wifi, Coffee, Car, Wind, ChevronLeft, 
  ChevronRight, Calendar as CalendarIcon, Loader2,
  CheckCircle, Info, Utensils, Clock, Dog,
  Sofa, Trees, Camera,
  Users, Check, MessageSquare,
  Navigation, Leaf, Search, X
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
import { Input } from '@/components/ui/input';
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

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  
  const [activeTab, setActiveCategory] = useState('overview');
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Search state from URL or defaults
  const [dest, setDest] = useState(searchParams.get('dest') || "");
  const [dates, setDates] = useState<{ from: Date; to: Date }>({
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : new Date(),
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : addDays(new Date(), 3),
  });
  const [occupancy, setOccupancy] = useState({
    adults: parseInt(searchParams.get('adults') || "2"),
    children: parseInt(searchParams.get('children') || "0"),
    rooms: parseInt(searchParams.get('rooms') || "1"),
  });

  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: dbProperty, isLoading: loading } = useDoc(docRef);

  // Fallback to mock data if not found in Firestore
  const property = useMemo(() => {
    if (dbProperty) return dbProperty;
    return mockProperties.find(p => p.id === id);
  }, [dbProperty, id]);

  // Refs for smooth scroll
  const overviewRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>, tabId: string) => {
    setActiveCategory(tabId);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nights = useMemo(() => {
    return Math.max(1, differenceInDays(dates.to, dates.from));
  }, [dates]);

  // Derive Room Types from actual partner data or mock data
  const roomTypes = useMemo(() => {
    if (!property) return [];
    
    // In DB properties are inside 'details', in mock data they are flat
    const details = property.details || property;
    const types = [];

    // Base price per night
    const basePrice = property.price || 10000;

    if (details.propertyType === 'hotel' || details.type?.toLowerCase().includes('hôtel') || details.type?.toLowerCase().includes('riad')) {
      const singleCount = details.singleRoomsCount || 0;
      const doubleCount = details.doubleRoomsCount || 5; // Default for demo
      const suiteCount = details.parentalSuitesCount || 0;

      if (singleCount > 0) {
        types.push({
          id: 'single',
          name: t('single_rooms'),
          size: '18m²',
          specs: ['1 lit simple', 'WiFi gratuit', 'Salle de bain'],
          maxGuests: 1,
          price: basePrice * 0.8,
          stock: singleCount
        });
      }
      
      // Always show double rooms for hotels in mock if no specific count provided
      types.push({
        id: 'double',
        name: t('double_rooms'),
        size: '24m²',
        specs: ['1 grand lit double', 'WiFi gratuit', 'Climatisation'],
        maxGuests: 2,
        price: basePrice,
        stock: doubleCount > 0 ? doubleCount : 10
      });

      if (suiteCount > 0) {
        types.push({
          id: 'suite',
          name: t('parental_suites'),
          size: '40m²',
          specs: ['1 lit King Size', 'Espace salon', 'Vue panoramique'],
          maxGuests: 3,
          price: basePrice * 1.5,
          stock: suiteCount
        });
      }
    } else {
      // For Villa/Apartment, show as "Entire Property"
      types.push({
        id: 'entire',
        name: `Logement entier (${details.roomsCount || 1} pièces)`,
        size: '120m²',
        specs: [`${details.roomsCount || 1} chambres`, `${details.bathroomsCount || 1} SDB`, 'Cuisine équipée'],
        maxGuests: (details.roomsCount || 1) * 2 || 4,
        price: basePrice,
        stock: 1
      });
    }

    return types;
  }, [property, t]);

  const totalBookingPrice = Object.entries(selectedRooms).reduce((acc, [roomId, qty]) => {
    const room = roomTypes.find(r => r.id === roomId);
    return acc + (room?.price || 0) * qty * nights;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="bg-white p-12 rounded-[2rem] shadow-2xl space-y-6 max-w-md">
          <div className="bg-red-50 text-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Établissement non trouvé</h1>
          <p className="text-slate-500 font-medium">Désolé, nous ne parvenons pas à charger les détails de cet établissement.</p>
          <Button className="w-full h-12 bg-primary font-black rounded-xl" onClick={() => router.push('/')}>
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
          <TabButton active={activeTab === 'rules'} label="Règles de la maison" onClick={() => scrollToSection(rulesRef, 'rules')} />
          <TabButton active={activeTab === 'reviews'} label="Commentaires" onClick={() => scrollToSection(reviewsRef, 'reviews')} />
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
                  <Leaf className="h-3 w-3" /> Certificat de durabilité
                </Badge>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{propertyName}</h1>
              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{property.location?.address || property.location} — </span>
                <button className="text-primary font-bold hover:underline">Excellent emplacement – voir la carte</button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5"><Heart className="h-6 w-6" /></Button>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/5"><Share2 className="h-6 w-6" /></Button>
              <Button 
                onClick={() => scrollToSection(availabilityRef, 'availability')}
                className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-10 rounded-md"
              >
                Réserver
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
                  <p className="text-[11px] opacity-80">{reviewsCount} avis</p>
                </div>
              </div>
            </div>
            <div className="relative group cursor-pointer">
              <Image src={photos[3] || 'https://picsum.photos/seed/p4/800/600'} alt="Side 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white h-8 w-8" />
              </div>
            </div>
            <div className="relative group cursor-pointer bg-slate-100">
              <Image src={photos[4] || 'https://picsum.photos/seed/p5/800/600'} alt="Side 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm underline">+ {photos.length > 5 ? photos.length - 5 : 0} autres photos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Availability Section */}
        <section ref={availabilityRef} className="space-y-6 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900">Disponibilité</h2>
              <div className="bg-[#FEBA02] px-4 py-2 rounded-sm inline-flex items-center gap-2 mt-2 shadow-sm">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-[12px] font-black uppercase">
                  Du {format(dates.from, "dd", { locale: fr })} au {format(dates.to, "dd MMMM yyyy", { locale: fr })} ({nights} nuits) — {occupancy.adults} adultes, {occupancy.children} enfant
                </span>
              </div>
            </div>
            <Button 
              onClick={() => setIsEditModalOpen(true)}
              variant="outline" 
              className="border-primary text-primary font-black h-12 px-8 rounded-md hover:bg-primary/5 transition-all"
            >
              Modifier la recherche
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-[#4C4C4C] hover:bg-[#4C4C4C]">
                <TableRow>
                  <TableHead className="text-white font-bold py-4">Type de logement</TableHead>
                  <TableHead className="text-white font-bold text-center">Nombre de voyageurs</TableHead>
                  <TableHead className="text-white font-bold">Tarif pour {nights} nuits</TableHead>
                  <TableHead className="text-white font-bold">Vos options</TableHead>
                  <TableHead className="text-white font-bold">Sélectionner des chambres</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.id} className="hover:bg-slate-50">
                    <TableCell className="align-top w-[35%] py-6">
                      <div className="space-y-3">
                        <h4 className="font-bold text-[#10B981] underline cursor-pointer text-[15px]">{room.name}</h4>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500 font-medium">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{room.size}</span>
                        </div>
                        <ul className="space-y-1">
                          {room.specs.map(spec => (
                            <li key={spec} className="flex items-center gap-2 text-[12px] text-slate-600">
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
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="space-y-1">
                        <p className="font-black text-lg text-slate-900">{formatPrice(room.price * nights)}</p>
                        <p className="text-[10px] text-slate-400">Taxes et frais compris</p>
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] h-5">Offre StayFloow</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="space-y-3">
                        <div className="text-[12px] space-y-1">
                          <p className="text-green-600 font-bold">Petit-déjeuner inclus</p>
                          <p className="text-green-600 font-bold">Annulation GRATUITE</p>
                          <p className="text-slate-500 italic">Aucun prépaiement requis</p>
                        </div>
                        {room.stock <= 2 && (
                          <p className="text-red-600 font-black text-[11px] uppercase animate-pulse">Dernière chance ! {room.stock} dispo</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="space-y-4">
                        <Select 
                          onValueChange={(val) => setSelectedRooms({...selectedRooms, [room.id]: parseInt(val)})}
                          defaultValue="0"
                        >
                          <SelectTrigger className="w-full bg-white border-slate-300 h-10">
                            <SelectValue placeholder="0" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: Math.min(6, room.stock + 1) }).map((_, n) => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedRooms[room.id] > 0 && (
                          <Button 
                            onClick={() => router.push(`/properties/${id}/book`)}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-10 rounded-sm"
                          >
                            Je réserve
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {totalBookingPrice > 0 && (
            <div className="flex flex-col items-end gap-6 mt-8 animate-in fade-in slide-in-from-bottom-4">
              <Card className="w-full md:w-80 border-2 border-primary shadow-2xl bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-500">Total ({nights} nuits)</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(totalBookingPrice)}</span>
                  </div>
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-sm shadow-xl" onClick={() => router.push(`/properties/${id}/book`)}>
                    Confirmer ma réservation
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 uppercase font-bold">Confirmation instantanée StayFloow</p>
                </CardContent>
              </Card>

              {/* BOUTON RÉSERVER FINAL (DESIGN IMAGE) */}
              <Button 
                onClick={() => router.push(`/properties/${id}/book`)}
                className="bg-[#10B981] hover:bg-[#0da372] text-white font-black text-xl px-16 py-8 rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Réserver
              </Button>
            </div>
          )}
        </section>

        {/* Section 3: Facilities Grid */}
        <section ref={facilitiesRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Équipements les plus populaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <FacilityIcon icon={<Wifi/>} label="Wi-Fi gratuit" />
            <FacilityIcon icon={<Utensils/>} label="Restaurant" />
            <FacilityIcon icon={<Car/>} label="Parking gratuit" />
            <FacilityIcon icon={<Wind/>} label="Climatisation" />
            <FacilityIcon icon={<Coffee/>} label="Machine à café" />
            <FacilityIcon icon={<Clock/>} label="Réception 24h/24" />
          </div>
        </section>

        {/* Section 4: Rules & Reviews (Placeholders) */}
        <section ref={rulesRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Règles de la maison</h2>
          <div className="border rounded-md">
            <RuleRow icon={<Clock/>} label="Arrivée" value="De 14h00 à 00h00" />
            <RuleRow icon={<Clock/>} label="Départ" value="Jusqu'à 12h00" />
            <RuleRow icon={<Info/>} label="Annulation" value="Conditions flexibles StayFloow." />
          </div>
        </section>
      </main>

      {/* SEARCH MODIFIER DIALOG */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <Search className="h-6 w-6 text-primary" /> Modifier votre recherche
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dates de séjour</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full h-14 justify-start font-black text-lg border-slate-200 rounded-xl bg-slate-50">
                    <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                    {dates.from ? (
                      dates.to ? `${format(dates.from, "dd MMM")} — ${format(dates.to, "dd MMM")}` : format(dates.from, "dd MMM")
                    ) : "Choisir les dates"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="center">
                  <Calendar 
                    mode="range" 
                    selected={dates} 
                    onSelect={(range: any) => range && setDates(range)} 
                    locale={fr} 
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adultes</span>
                <Input 
                  type="number" 
                  value={occupancy.adults.toString()} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setOccupancy({...occupancy, adults: isNaN(val) ? 0 : val});
                  }}
                  className="h-12 rounded-xl bg-slate-50 font-black"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enfants</span>
                <Input 
                  type="number" 
                  value={occupancy.children.toString()} 
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setOccupancy({...occupancy, children: isNaN(val) ? 0 : val});
                  }}
                  className="h-12 rounded-xl bg-slate-50 font-black"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t pt-6">
            <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="font-bold text-slate-400">Annuler</Button>
            <Button 
              onClick={() => setIsEditModalOpen(false)}
              className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg"
            >
              Mettre à jour
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TabButton({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "px-6 py-4 text-[13px] font-bold transition-all border-b-4",
        active 
          ? "border-primary text-primary bg-primary/5" 
          : "border-transparent text-slate-500 hover:text-primary hover:bg-slate-50"
      )}
    >
      {label}
    </button>
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
