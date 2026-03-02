
'use client';

import React, { use, useState, useEffect, useRef } from 'react';
import { useDoc, useFirestore, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { 
  MapPin, Star, Share2, Heart, ShieldCheck, 
  Wifi, Coffee, Car, Wind, ChevronLeft, 
  ChevronRight, Calendar as CalendarIcon, Loader2,
  CheckCircle, Info, Utensils, Clock, Dog,
  Gamepad2, Layout, Plug, Bath, Baby,
  ArrowUpCircle, Accessibility, Camera,
  Users, Check, ExternalLink, MessageSquare,
  Navigation, Leaf
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
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveCategory] = useState('overview');
  const [selectedRooms, setSelectedRooms] = useState<Record<string, number>>({});
  
  const docRef = doc(db, 'listings', id);
  const { data: property, loading } = useDoc(docRef);

  // Refs pour le scroll fluide
  const overviewRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const facilitiesRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, tabId: string) => {
    setActiveCategory(tabId);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const displayData = property || {
    id: 'prop-1',
    details: {
      name: "Riad Dar Al-Andalus",
      description: "Niché au cœur de la médina, ce riad historique offre une expérience immersive unique. Entièrement restauré par des artisans locaux, il allie confort moderne et architecture traditionnelle fassie. Profitez de notre patio arboré et de notre terrasse panoramique surplombant les toits de la ville.",
      amenities: ["WiFi gratuit", "Petit-déjeuner inclus", "Climatisation", "Parking gratuit"],
      stars: 5,
      propertyType: "Riad"
    },
    location: { address: "Derb el-Miter, Fès, Maroc" },
    price: 12500,
    photos: [
      "https://images.unsplash.com/photo-1761828122922-5a839ada5b76?w=1200",
      "https://picsum.photos/seed/riad-detail-2/1200/800",
      "https://picsum.photos/seed/riad-detail-3/1200/800",
      "https://picsum.photos/seed/riad-detail-4/1200/800",
      "https://picsum.photos/seed/riad-detail-5/1200/800",
      "https://picsum.photos/seed/riad-detail-6/1200/800"
    ],
    rating: 9.8,
    reviewsCount: 1295
  };

  const roomTypes = [
    { 
      id: 'double', 
      name: 'Chambre Double Deluxe', 
      size: '25m²', 
      specs: ['1 grand lit double', 'Salle de bain privée', 'Climatisation', 'Vue sur le patio'],
      maxGuests: 2,
      price: displayData.price,
      stock: 3
    },
    { 
      id: 'suite', 
      name: 'Suite Junior avec Terrasse', 
      size: '45m²', 
      specs: ['1 lit king size', 'Espace salon', 'Terrasse privée', 'Minibar', 'Cafetière'],
      maxGuests: 3,
      price: displayData.price * 1.8,
      stock: 5
    }
  ];

  const totalBookingPrice = Object.entries(selectedRooms).reduce((acc, [roomId, qty]) => {
    const room = roomTypes.find(r => r.id === roomId);
    return acc + (room?.price || 0) * qty;
  }, 0);

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
                  {[...Array(displayData.details?.stars || 5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#FEBA02] text-[#FEBA02]" />
                  ))}
                </div>
                <Badge className="bg-primary/10 text-primary border-none flex items-center gap-1 h-5 text-[10px] font-bold uppercase">
                  <Leaf className="h-3 w-3" /> Certificat de durabilité
                </Badge>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{displayData.details?.name}</h1>
              <div className="flex items-center gap-2 text-[13px] text-slate-600">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>{displayData.location?.address} — </span>
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

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 aspect-[16/9] md:aspect-[21/9] rounded-lg overflow-hidden">
            <div className="md:col-span-2 md:row-span-2 relative cursor-pointer group">
              <Image src={displayData.photos[0]} alt="Main" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative cursor-pointer group">
              <Image src={displayData.photos[1]} alt="Side 1" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="md:row-span-2 relative bg-slate-900 overflow-hidden flex items-center justify-center group cursor-pointer">
              <Image src={displayData.photos[2]} alt="Side 2" fill className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white p-4">
                <div className="bg-[#10B981] text-white font-black text-xl w-14 h-14 flex items-center justify-center rounded-sm shadow-xl mb-2">
                  {displayData.rating.toFixed(1)}
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg leading-none mb-1">Fabuleux</p>
                  <p className="text-[11px] opacity-80">{displayData.reviewsCount} avis</p>
                </div>
              </div>
            </div>
            <div className="relative group cursor-pointer">
              <Image src={displayData.photos[3]} alt="Side 3" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white h-8 w-8" />
              </div>
            </div>
            <div className="relative group cursor-pointer bg-slate-100">
              <Image src={displayData.photos[4]} alt="Side 4" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-sm underline">+ 40 autres photos</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Quick Review & Map Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border rounded-md p-6 space-y-4">
              <p className="text-[14px] text-slate-700 leading-relaxed">
                {displayData.details?.description}
              </p>
              <div className="bg-slate-50 p-4 rounded flex items-start gap-4">
                <Info className="h-5 w-5 text-primary shrink-0 mt-1" />
                <p className="text-[13px] font-medium text-slate-600">
                  Idéal pour les couples ! Ils donnent à cet établissement la note de <span className="font-black text-slate-900">9,8</span> pour un séjour à deux.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Card className="border shadow-none rounded-md overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-32 w-full">
                  <Image src="https://picsum.photos/seed/map-hotel/400/200" alt="Map" fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button size="sm" className="bg-primary text-white font-bold h-8">Voir sur la carte</Button>
                  </div>
                </div>
                <div className="p-4 bg-white border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-bold">Excellent emplacement !</span>
                    <Badge className="bg-slate-100 text-slate-900 border-none h-6 px-2 font-black">9,8</Badge>
                  </div>
                  <div className="text-[12px] text-slate-500 space-y-1">
                    <p>Points forts :</p>
                    <ul className="space-y-1">
                      <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Au coeur de la ville</li>
                      <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary" /> Très bien noté par les voyageurs</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/10 rounded-md">
              <CardContent className="p-4">
                <h4 className="font-bold text-[14px] mb-2">Pourquoi cet établissement ?</h4>
                <ul className="text-[12px] space-y-3">
                  <li className="flex items-start gap-2">
                    <Coffee className="h-4 w-4 text-primary shrink-0" />
                    <span>Petit-déjeuner noté "Excellent" par 1 200 clients</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-primary shrink-0" />
                    <span>À seulement 500m du centre d'affaires</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 3: Availability Table */}
        <section ref={availabilityRef} className="space-y-6 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Disponibilité</h2>
              <div className="bg-[#FEBA02] px-3 py-1.5 rounded-sm inline-flex items-center gap-2 mt-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="text-[12px] font-black">Du 12 au 15 mars 2025 (3 nuits) — 2 adultes, 0 enfant</span>
              </div>
            </div>
            <Button variant="outline" className="border-primary text-primary font-black h-10 rounded-md">Modifier la recherche</Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-[#4C4C4C] hover:bg-[#4C4C4C]">
                <TableRow>
                  <TableHead className="text-white font-bold py-4">Type de logement</TableHead>
                  <TableHead className="text-white font-bold text-center">Nombre de voyageurs</TableHead>
                  <TableHead className="text-white font-bold">Tarif du jour</TableHead>
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
                          {room.specs.slice(0, 3).map(s => <span key={s} className="bg-slate-100 px-2 py-0.5 rounded">{s}</span>)}
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
                        <p className="font-black text-lg text-slate-900">{formatPrice(room.price)}</p>
                        <p className="text-[10px] text-slate-400">Taxes et frais compris</p>
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] h-5">Offre Genius</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="space-y-3">
                        <div className="text-[12px] space-y-1">
                          <p className="text-green-600 font-bold">Petit-déjeuner inclus</p>
                          <p className="text-green-600 font-bold">Annulation GRATUITE</p>
                          <p className="text-slate-500 italic">Aucun prépaiement requis</p>
                        </div>
                        {room.stock < 5 && (
                          <p className="text-red-600 font-black text-[11px] uppercase animate-pulse">Il nous reste {room.stock} options !</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top py-6">
                      <div className="space-y-4">
                        <Select onValueChange={(val) => setSelectedRooms({...selectedRooms, [room.id]: parseInt(val)})}>
                          <SelectTrigger className="w-full bg-white border-slate-300">
                            <SelectValue placeholder="0" />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
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
            <div className="flex justify-end animate-in fade-in slide-in-from-right-4">
              <Card className="w-full md:w-80 border-2 border-primary shadow-2xl bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-500">Total pour {Object.values(selectedRooms).reduce((a,b)=>a+b, 0)} ch.</span>
                    <span className="text-2xl font-black text-primary">{formatPrice(totalBookingPrice)}</span>
                  </div>
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-sm" onClick={() => router.push(`/properties/${id}/book`)}>
                    Je réserve maintenant
                  </Button>
                  <p className="text-[10px] text-center text-slate-400 uppercase font-bold">Confirmation instantanée StayFloow</p>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Section 4: Facilities Grid */}
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

        {/* Section 5: House Rules */}
        <section ref={rulesRef} className="space-y-6 pt-10 border-t">
          <h2 className="text-xl font-black text-slate-900">Règles de la maison</h2>
          <div className="border rounded-md">
            <RuleRow icon={<Clock/>} label="Arrivée" value="De 14h00 à 00h00" />
            <RuleRow icon={<Clock/>} label="Départ" value="Jusqu'à 12h00" />
            <RuleRow icon={<Info/>} label="Annulation" value="Les conditions varient selon le type d'hébergement." />
            <RuleRow icon={<Baby/>} label="Enfants et lits" value="Tous les enfants sont les bienvenus." />
            <RuleRow icon={<Dog/>} label="Animaux" value="Les animaux de compagnie ne sont pas admis." />
          </div>
        </section>

        {/* Section 6: Reviews */}
        <section ref={reviewsRef} className="space-y-6 pt-10 border-t">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">Commentaires clients</h2>
            <Button variant="outline" className="border-primary text-primary font-bold">Lire tous les avis</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ReviewCard author="Anne" country="Suisse" text="Grande chambre, très propre et bien agencée. Belle salle de bains, douche et baignoire. Petit déjeuner copieux et diversifié. Emplacement idéal...." />
            <ReviewCard author="Sofiane" country="Algérie" text="L'accueil du personnel était exceptionnel. Le riad est magnifique et très bien situé dans la médina. Je recommande vivement !" />
          </div>
        </section>

      </main>
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

function ReviewCard({ author, country, text }: { author: string, country: string, text: string }) {
  return (
    <div className="bg-white border rounded-md p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary font-black h-8 w-8 flex items-center justify-center rounded-full text-xs">
          {author.charAt(0)}
        </div>
        <div>
          <p className="text-[13px] font-black text-slate-900">{author}</p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="mr-1">🌍</span> {country}
          </p>
        </div>
      </div>
      <p className="text-[13px] text-slate-600 italic leading-relaxed">
        "{text}"
      </p>
    </div>
  );
}
