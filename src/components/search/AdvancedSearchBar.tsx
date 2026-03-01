
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar as CalendarIcon, Building, Car, Compass, Users, Plus, Minus, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Category = 'accommodations' | 'cars' | 'circuits';

export default function AdvancedSearchBar() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isClient, setIsClient] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('accommodations');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // State pour l'occupation
  const [occupancy, setOccupancy] = useState({
    adults: 2,
    children: 0,
    childrenAges: [] as number[],
    rooms: 1,
    pets: false
  });

  const [isOccupancyOpen, setIsOccupancyOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (pathname.startsWith('/cars')) {
      setActiveCategory('cars');
    } else if (pathname.startsWith('/circuits')) {
      setActiveCategory('circuits');
    } else {
      setActiveCategory('accommodations');
    }
  }, [pathname]);

  const getDateLocale = useCallback(() => {
    switch (locale) {
      case 'en': return enUS;
      case 'es': return es;
      case 'ar': return arDZ;
      default: return fr;
    }
  }, [locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
    
    const occupancyParams = `adults=${occupancy.adults}&children=${occupancy.children}&rooms=${occupancy.rooms}&pets=${occupancy.pets}`;
    
    let url = "";
    if (activeCategory === 'cars') {
      url = `/cars/results?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}`;
    } else if (activeCategory === 'circuits') {
      url = `/circuits/results?dest=${encodeURIComponent(destination)}`;
    } else {
      url = `/search?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}&${occupancyParams}`;
    }
    
    router.push(url);
  };

  const updateOccupancy = (field: 'adults' | 'children' | 'rooms', delta: number) => {
    setOccupancy(prev => {
      const newVal = Math.max(field === 'adults' ? 1 : field === 'rooms' ? 1 : 0, prev[field] + delta);
      
      let newAges = [...prev.childrenAges];
      if (field === 'children') {
        if (delta > 0) {
          newAges.push(0);
        } else if (delta < 0) {
          newAges.pop();
        }
      }

      return { ...prev, [field]: newVal, childrenAges: newAges };
    });
  };

  const getOccupancySummary = () => {
    const parts = [];
    parts.push(`${occupancy.adults} ${occupancy.adults > 1 ? t('adults_plural') : t('adult_singular')}`);
    if (occupancy.children > 0) {
      parts.push(`${occupancy.children} ${occupancy.children > 1 ? t('children_plural') : t('child_singular')}`);
    }
    parts.push(`${occupancy.rooms} ${occupancy.rooms > 1 ? t('rooms_plural') : t('room_singular')}`);
    return parts.join(' · ');
  };

  if (!isClient) return <div className="w-full h-[85px] bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="w-full">
      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-1">
        <TabLink 
          href="/" 
          active={activeCategory === 'accommodations'} 
          icon={<Building className="h-5 w-5" />} 
          label={t("accommodations")} 
        />
        <TabLink 
          href="/cars" 
          active={activeCategory === 'cars'} 
          icon={<Car className="h-5 w-5" />} 
          label={t("car_rental")} 
        />
        <TabLink 
          href="/circuits" 
          active={activeCategory === 'circuits'} 
          icon={<Compass className="h-5 w-5" />} 
          label={t("tours")} 
        />
      </div>

      <form onSubmit={handleSearch} className="bg-[#FEBA02] p-[2px] rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch gap-0 border-2 border-[#FEBA02]">
        {/* Colonne 1 : Destination */}
        <div className={cn(
          "flex-[1.2] bg-white flex flex-col justify-center px-6 py-3 min-h-[85px] relative group border-slate-100 transition-colors hover:bg-slate-50",
          locale === 'ar' ? "md:rounded-r-lg border-l" : "md:rounded-l-lg border-r"
        )}>
          <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight mb-1.5 leading-none">
            {activeCategory === 'cars' ? t('pickup_location') : t('where_to')}
          </span>
          <div className="flex items-center gap-3">
            <MapPin className="text-slate-300 h-5 w-5 shrink-0" />
            <input 
              className="w-full bg-transparent border-none focus:ring-0 p-0 text-lg font-black text-slate-800 placeholder:text-slate-300 outline-none"
              placeholder={activeCategory === 'cars' ? t('pickup_location') : t('where_to')}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        {/* Colonne 2 : Dates */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-[1.2] bg-white flex flex-col justify-center px-6 py-3 min-h-[85px] cursor-pointer hover:bg-slate-50 transition-colors border-r border-slate-100">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight mb-1.5 leading-none">
                {activeCategory === 'cars' ? "Départ — Retour" : "Arrivée — Départ"}
              </span>
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-slate-300 h-5 w-5 shrink-0" />
                <span className="text-lg font-black text-slate-800 truncate">
                  {dateRange?.from ? (
                    dateRange.to ? `${format(dateRange.from, "dd MMM", { locale: getDateLocale() })} — ${format(dateRange.to, "dd MMM", { locale: getDateLocale() })}` 
                    : format(dateRange.from, "dd MMM", { locale: getDateLocale() })
                  ) : "Choisir les dates"}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-2xl z-[100]" align="center">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={getDateLocale()} disabled={{ before: new Date() }} />
          </PopoverContent>
        </Popover>

        {/* Colonne 3 : Occupation (Uniquement pour hébergements) */}
        {activeCategory === 'accommodations' && (
          <Popover open={isOccupancyOpen} onOpenChange={setIsOccupancyOpen}>
            <PopoverTrigger asChild>
              <div className="flex-[1.5] bg-white flex flex-col justify-center px-6 py-3 min-h-[85px] cursor-pointer hover:bg-slate-50 transition-colors border-r border-slate-100">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight mb-1.5 leading-none">
                  {t('guests_rooms')}
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 truncate">
                    <Users className="text-slate-300 h-5 w-5 shrink-0" />
                    <span className="text-lg font-black text-slate-800 truncate">
                      {getOccupancySummary()}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-6 space-y-6 border-none shadow-2xl rounded-2xl bg-white z-[100]" align="center">
              {/* Adultes */}
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-700 text-base">{t('adults')}</Label>
                <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button type="button" onClick={() => updateOccupancy('adults', -1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary disabled:opacity-20" disabled={occupancy.adults <= 1}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-black text-slate-800">{occupancy.adults}</span>
                  <button type="button" onClick={() => updateOccupancy('adults', 1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Enfants */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-700 text-base">{t('children')}</Label>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-1 border border-slate-200">
                    <button type="button" onClick={() => updateOccupancy('children', -1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary disabled:opacity-20" disabled={occupancy.children <= 0}>
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-black text-slate-800">{occupancy.children}</span>
                    <button type="button" onClick={() => updateOccupancy('children', 1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {occupancy.children > 0 && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                    {occupancy.childrenAges.map((age, idx) => (
                      <Select key={idx} defaultValue={age.toString()}>
                        <SelectTrigger className="h-10 font-bold border-slate-200 rounded-md">
                          <SelectValue placeholder="Âge" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 18 }).map((_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i} {t('age_label')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                )}
                
                {occupancy.children > 0 && (
                  <p className="text-[10px] text-slate-500 leading-relaxed italic">
                    {t('children_age_info')}
                  </p>
                )}
              </div>

              {/* Chambres */}
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-700 text-base">{t('rooms')}</Label>
                <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button type="button" onClick={() => updateOccupancy('rooms', -1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary disabled:opacity-20" disabled={occupancy.rooms <= 1}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-6 text-center font-black text-slate-800">{occupancy.rooms}</span>
                  <button type="button" onClick={() => updateOccupancy('rooms', 1)} className="h-8 w-8 bg-white shadow-sm rounded-md flex items-center justify-center text-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <Separator />

              {/* Animaux */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pets" className="font-bold text-slate-700 text-sm">{t('travel_with_pet')}</Label>
                  <Switch 
                    id="pets" 
                    checked={occupancy.pets} 
                    onCheckedChange={(checked) => setOccupancy(prev => ({ ...prev, pets: checked }))} 
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-medium">{t('service_animal_info')}</p>
                  <button type="button" className="text-[10px] text-primary font-bold hover:underline text-left">
                    {t('learn_more_service_animal')}
                  </button>
                </div>
              </div>

              <Button 
                onClick={() => setIsOccupancyOpen(false)}
                className="w-full bg-white border border-primary text-primary hover:bg-slate-50 font-black h-12 rounded-lg"
              >
                {t('done')}
              </Button>
            </PopoverContent>
          </Popover>
        )}

        <button 
          type="submit" 
          className={cn(
            "bg-primary hover:bg-[#059669] text-white px-12 py-4 flex items-center justify-center transition-all active:scale-95 min-h-[85px] group outline-none",
            locale === 'ar' ? "md:rounded-l-lg" : "md:rounded-r-lg"
          )}
        >
          <span className="text-2xl font-black tracking-tight group-hover:scale-105 transition-transform">
            {t("search_btn")}
          </span>
        </button>
      </form>
    </div>
  );
}

function TabLink({ href, active, icon, label }: { href: string, active: boolean, icon: any, label: string }) {
  return (
    <Link 
      href={href}
      prefetch={true}
      className={cn(
        "flex items-center gap-3 px-8 py-4 rounded-full text-base font-black transition-all border-none whitespace-nowrap outline-none", 
        active 
          ? "bg-white text-primary shadow-xl scale-105" 
          : "bg-[#065f46] text-white hover:bg-[#044d35]"
      )}
    >
      <span className={cn(active ? "text-primary" : "text-white")}>{icon}</span>
      {label}
    </Link>
  );
}

function Separator() {
  return <div className="h-px bg-slate-100 w-full" />;
}
