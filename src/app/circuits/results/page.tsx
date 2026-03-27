"use client";

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search as SearchIcon, Loader2, Map as MapIcon, 
  Info, ChevronRight, Calendar as CalendarIcon, MapPin, X, Star, Clock, Check
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { CircuitSearchSidebar, type CircuitFilterStats } from '@/components/car-search-sidebar'; // Will reuse layout
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/context/currency-context';

function CircuitResultsContent() {
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  
  const [circuits, setCircuits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(searchParams.get('dest') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
    to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
  });

  useEffect(() => {
    const fetchCircuits = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'listings'), where('category', '==', 'circuit'), where('status', '==', 'approved'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCircuits(data);
      } catch (e) {
        console.error("Error fetching circuits:", e);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchCircuits();
  }, [db]);

  const filteredResults = circuits.filter(c => {
    if (destination && !c.location?.address?.toLowerCase().includes(destination.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar Horizontal - Capture 2 Style */}
      <div className="bg-primary pt-6 pb-12 px-4">
        <div className="max-w-[1100px] mx-auto">
          <div className="bg-[#FEBA02] p-1 rounded-lg shadow-2xl flex flex-col md:flex-row items-stretch gap-1">
            <div className="flex-[1.5] bg-white rounded flex items-center px-4 py-3 gap-3">
              <MapPin className="text-slate-400 h-5 w-5" />
              <div className="flex flex-col flex-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Destination</span>
                <input 
                  className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-black text-slate-800 outline-none"
                  placeholder="Où souhaitez-vous aller ?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <div className="flex-[1.5] bg-white rounded flex items-center px-4 py-3 gap-3 cursor-pointer">
                  <CalendarIcon className="text-slate-400 h-5 w-5" />
                  <div className="flex flex-col flex-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Dates</span>
                    <span className="text-sm font-black text-slate-800">
                      {dateRange?.from ? format(dateRange.from, "dd MMM yyyy") : "Sélectionnez des dates"}
                    </span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="range" selected={dateRange} onSelect={setDateRange} locale={fr} />
              </PopoverContent>
            </Popover>

            <Button className="md:w-44 bg-primary hover:bg-primary/90 text-white h-14 md:h-auto font-black text-xl rounded shadow-lg border-none">
              Rechercher
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar simple simulation */}
        <aside className="w-full lg:w-[280px] shrink-0 space-y-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h2 className="text-lg font-black text-primary flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 fill-primary" /> Filtres intelligents
            </h2>
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Note des guides</p>
              {[9, 8, 7, 6].map(n => (
                <div key={n} className="flex items-center gap-3">
                  <Checkbox id={`rate-${n}`} />
                  <label htmlFor={`rate-${n}`} className="text-sm font-bold text-slate-700">Supérieur à {n}+</label>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <h1 className="text-2xl font-black text-slate-900">
            {filteredResults.length} circuits disponibles à {destination || 'votre destination'}
          </h1>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Préparation de votre aventure...</p>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredResults.map((circuit) => (
                <div key={circuit.id} className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden flex flex-col md:flex-row hover:shadow-xl transition-all group group/card">
                  <div className="relative w-full md:w-[280px] h-[200px] md:h-auto shrink-0">
                    <Image src={circuit.photos?.[0] || 'https://picsum.photos/seed/tour/400/300'} alt={circuit.details?.name} fill className="object-cover group-hover/card:scale-105 transition-transform duration-700" />
                    <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">CERTIFIÉ STAYFLOOW</div>
                  </div>

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                          <MapPin className="h-3 w-3 text-primary" /> {circuit.location?.address}
                        </div>
                        <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="font-black text-sm">{circuit.rating?.toFixed(1) || '8.5'}</span>
                        </div>
                      </div>
                      <h3 className="text-2xl font-black text-primary leading-tight mb-2 group-hover/card:underline">{circuit.details?.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 italic mb-4">"{circuit.details?.description}"</p>
                      
                      <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full"><Clock className="h-3.5 w-3.5 text-primary" /> {circuit.details?.duration}</div>
                        <div className="flex items-center gap-1.5 text-green-600"><Check className="h-4 w-4" /> Annulation gratuite</div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">À partir de</p>
                        <p className="text-2xl font-black text-slate-900">{formatPrice(circuit.price)} <span className="text-xs font-bold text-slate-400">/ pers</span></p>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl" asChild>
                        <Link href={`/circuits/${circuit.id}`}>Voir Détails</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-slate-50 rounded-3xl border-4 border-dashed">
              < Compass className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-400">Aucun circuit trouvé</h3>
              <p className="text-slate-500">Essayez d'autres dates ou une autre destination.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CircuitResultsPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <CircuitResultsContent />
    </Suspense>
  );
}
