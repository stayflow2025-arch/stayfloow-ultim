
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Calendar as CalendarIcon, Building, Car, Compass, Users, Plus, Minus, ChevronDown, Loader2, Baby } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';
import { useRouter, usePathname } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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

  // Autocomplete States
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Handle outside click for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocomplete logic
  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchCities = async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&countrycodes=dz,eg&addressdetails=1&limit=6&featuretype=city`
        );
        const data = await response.json();
        
        const formatted = data.map((item: any) => {
          const addr = item.address;
          const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || item.name;
          const stateName = addr.state || addr.province || addr.county || "";
          const countryName = addr.country || "";
          
          return {
            full: item.display_name,
            main: cityName,
            sub: stateName ? `${stateName}, ${countryName}` : countryName
          };
        });

        const unique = formatted.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.main === v.main) === i);
        
        setSuggestions(unique);
        setShowSuggestions(unique.length > 0);
      } catch (e) {
        console.error("Autocomplete fetch error", e);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchCities, 400);
    return () => clearTimeout(timer);
  }, [destination]);

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
    
    const hasInfants = occupancy.childrenAges.some(age => age < 2);
    const occupancyParams = `adults=${occupancy.adults}&children=${occupancy.children}&rooms=${occupancy.rooms}&pets=${occupancy.pets}&hasInfants=${hasInfants}`;
    
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
        if (delta > 0) newAges.push(10);
        else if (delta < 0) newAges.pop();
      }
      return { ...prev, [field]: newVal, childrenAges: newAges };
    });
  };

  const updateChildAge = (idx: number, age: string) => {
    setOccupancy(prev => {
      const newAges = [...prev.childrenAges];
      newAges[idx] = parseInt(age);
      return { ...prev, childrenAges: newAges };
    });
  };

  const getOccupancySummary = () => {
    const parts = [];
    parts.push(`${occupancy.adults} ${occupancy.adults > 1 ? t('adults_plural') : t('adult_singular')}`);
    if (occupancy.children > 0) parts.push(`${occupancy.children} ${occupancy.children > 1 ? t('children_plural') : t('child_singular')}`);
    parts.push(`${occupancy.rooms} ${occupancy.rooms > 1 ? t('rooms_plural') : t('room_singular')}`);
    return parts.join(' · ');
  };

  if (!isClient) return <div className="w-full h-[85px] bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="w-full">
      <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar py-1">
        <TabButton 
          active={activeCategory === 'accommodations'} 
          icon={<Building className="h-5 w-5" />} 
          label={t("accommodations")} 
          onClick={() => router.push('/')}
        />
        <TabButton 
          active={activeCategory === 'cars'} 
          icon={<Car className="h-5 w-5" />} 
          label={t("car_rental")} 
          onClick={() => router.push('/cars')}
        />
        <TabButton 
          active={activeCategory === 'circuits'} 
          icon={<Compass className="h-5 w-5" />} 
          label={t("tours")} 
          onClick={() => router.push('/circuits')}
        />
      </div>

      <form onSubmit={handleSearch} className="bg-[#FEBA02] p-[2px] rounded-xl shadow-2xl flex flex-col md:flex-row items-stretch gap-0 border-2 border-[#FEBA02] relative z-40">
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
              autoComplete="off"
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => destination.length >= 2 && setShowSuggestions(true)}
            />
            {isLoadingSuggestions && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-300"
            >
              <div className="p-2">
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setDestination(s.main);
                      setShowSuggestions(false);
                    }}
                    className="flex items-center gap-4 p-4 hover:bg-primary/5 cursor-pointer rounded-xl transition-colors group"
                  >
                    <div className="bg-slate-50 p-2.5 rounded-xl group-hover:bg-primary/10 transition-colors">
                      <MapPin className="h-5 w-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-slate-900 group-hover:text-primary transition-colors truncate">{s.main}</span>
                      <span className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-tighter">{s.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

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
            <Calendar 
              mode="range" 
              selected={dateRange} 
              onSelect={setDateRange} 
              numberOfMonths={2} 
              locale={getDateLocale()} 
              disabled={{ before: new Date() }}
              weekStartsOn={1}
            />
          </PopoverContent>
        </Popover>

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
            <PopoverContent className="w-[380px] p-6 space-y-6 border-none shadow-2xl rounded-[2rem] bg-white z-[100]" align="center">
              {/* ADULTES */}
              <div className="flex items-center justify-between">
                <Label className="font-bold text-slate-800 text-[15px]">{t('adults')}</Label>
                <CounterControl value={occupancy.adults} onMinus={() => updateOccupancy('adults', -1)} onPlus={() => updateOccupancy('adults', 1)} min={1} />
              </div>

              {/* ENFANTS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-slate-800 text-[15px]">{t('children')}</Label>
                  <CounterControl value={occupancy.children} onMinus={() => updateOccupancy('children', -1)} onPlus={() => updateOccupancy('children', 1)} min={0} />
                </div>
                
                {occupancy.children > 0 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
                    {Array.from({ length: occupancy.children }).map((_, idx) => (
                      <div key={idx} className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          ÂGE DE L'ENFANT {idx + 1}
                        </Label>
                        <Select 
                          value={occupancy.childrenAges[idx]?.toString() || "10"} 
                          onValueChange={(val) => updateChildAge(idx, val)}
                        >
                          <SelectTrigger className="h-14 font-black border-slate-200 rounded-xl focus:ring-primary/20 transition-all bg-white text-slate-900 shadow-sm">
                            <SelectValue placeholder="Choisir l'âge" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px] rounded-xl border-none shadow-2xl z-[150] bg-white">
                            {Array.from({ length: 18 }).map((_, i) => (
                              <SelectItem key={i} value={i.toString()} className="font-bold py-3 cursor-pointer">
                                {i} {i <= 1 ? "an" : "ans"} {i < 2 ? "(Gratuit)" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3">
                  <Baby className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-[12px] text-emerald-800 leading-tight font-bold">
                    {t('infant_free_info')}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label className="font-bold text-slate-800 text-[15px]">{t('rooms')}</Label>
                <CounterControl value={occupancy.rooms} onMinus={() => updateOccupancy('rooms', -1)} onPlus={() => updateOccupancy('rooms', 1)} min={1} />
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pets" className="font-bold text-slate-800 text-[15px]">{t('travel_with_pet')}</Label>
                  <Switch id="pets" checked={occupancy.pets} onCheckedChange={(checked) => setOccupancy(prev => ({ ...prev, pets: checked }))} />
                </div>
              </div>

              <Button 
                onClick={() => setIsOccupancyOpen(false)} 
                className="w-full bg-primary text-white font-black h-14 rounded-xl mt-4 shadow-xl shadow-primary/20"
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

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-8 py-4 rounded-full text-base font-black transition-all border-none whitespace-nowrap outline-none cursor-pointer", 
        active 
          ? "bg-white text-primary shadow-xl scale-105" 
          : "bg-[#065f46] text-white hover:bg-[#044d35]"
      )}
    >
      <span className={cn(active ? "text-primary" : "text-white")}>{icon}</span>
      {label}
    </button>
  );
}

function CounterControl({ value, onMinus, onPlus, min }: { value: number, onMinus: () => void, onPlus: () => void, min: number }) {
  return (
    <div className="flex items-center border border-slate-400 rounded-md overflow-hidden h-11 w-32">
      <button 
        type="button" 
        onClick={onMinus} 
        disabled={value <= min}
        className="flex-1 h-full flex items-center justify-center text-primary hover:bg-slate-50 disabled:opacity-30 border-r border-slate-200 transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-10 text-center font-medium text-slate-900 text-sm">
        {value}
      </span>
      <button 
        type="button" 
        onClick={onPlus} 
        className="flex-1 h-full flex items-center justify-center text-primary hover:bg-slate-50 border-l border-slate-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
