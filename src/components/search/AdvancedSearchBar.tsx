
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, Calendar as CalendarIcon, Building, Car, Compass, Users, Plus, Minus, ChevronDown, Loader2, Info } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Category = 'accommodations' | 'cars' | 'circuits';

interface AdvancedSearchBarProps {
  hideTabs?: boolean;
  buttonLabel?: string;
  hideLocation?: boolean;
  stayOnPage?: boolean;
}

export default function AdvancedSearchBar({ hideTabs = false, hideLocation = false, stayOnPage = false, buttonLabel }: AdvancedSearchBarProps) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [isClient, setIsClient] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('accommodations');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
    const dest = searchParams.get('dest');
    if (dest) setDestination(dest);
    
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (from && to) setDateRange({ from: new Date(from), to: new Date(to) });
    
    const adults = searchParams.get('adults');
    const children = searchParams.get('children');
    const rooms = searchParams.get('rooms');
    
    if (adults || children || rooms) {
      setOccupancy(prev => ({
        ...prev,
        adults: adults ? parseInt(adults) : prev.adults,
        children: children ? parseInt(children) : prev.children,
        rooms: rooms ? parseInt(rooms) : prev.rooms
      }));
    }

    if (pathname.startsWith('/cars')) setActiveCategory('cars');
    else if (pathname.startsWith('/circuits')) setActiveCategory('circuits');
    else setActiveCategory('accommodations');
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (destination.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const fetchCities = async () => {
      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&countrycodes=dz,eg,ma&addressdetails=1&limit=6&featuretype=city`);
        const data = await response.json();
        const formatted = data.map((item: any) => ({
          main: item.address.city || item.address.town || item.address.village || item.name,
          sub: `${item.address.state || ""}, ${item.address.country || ""}`.trim()
        }));
        setSuggestions(formatted.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.main === v.main) === i));
        setShowSuggestions(formatted.length > 0);
      } catch (e) {} finally {
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

    if (!hideLocation && (!destination || destination.trim().length === 0)) {
      toast({
        variant: "destructive",
        title: "Veuillez indiquer une destination pour lancer la recherche."
      });
      return;
    }

    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
    
    const hasInfant = occupancy.childrenAges.some(age => age < 2);
    
    const params = new URLSearchParams({
      dest: destination,
      from,
      to,
      adults: occupancy.adults.toString(),
      children: occupancy.children.toString(),
      rooms: occupancy.rooms.toString(),
      hasInfants: hasInfant.toString()
    }).toString();
    
    if (stayOnPage) {
      router.push(`${pathname}?${params}`, { scroll: false });
      return;
    }

    if (activeCategory === 'cars') router.push(`/cars/results?${params}`);
    else if (activeCategory === 'circuits') router.push(`/circuits/results?${params}`);
    else router.push(`/search?${params}`);
  };

  const updateOccupancy = (field: 'adults' | 'children' | 'rooms', delta: number) => {
    setOccupancy(prev => {
      const newValue = Math.max(field === 'children' ? 0 : 1, prev[field] + delta);
      let newAges = [...prev.childrenAges];
      
      if (field === 'children') {
        if (delta > 0) {
          newAges.push(12);
        } else if (newAges.length > 0) {
          newAges.pop();
        }
      }
      
      return {
        ...prev,
        [field]: newValue,
        childrenAges: newAges
      };
    });
  };

  const updateChildAge = (index: number, age: number) => {
    setOccupancy(prev => {
      const newAges = [...prev.childrenAges];
      newAges[index] = age;
      return { ...prev, childrenAges: newAges };
    });
  };

  const handleTabClick = (cat: Category) => {
    setActiveCategory(cat);
    if (cat === 'cars') router.push('/cars');
    else if (cat === 'circuits') router.push('/circuits');
    else router.push('/'); // Redirection vers accueil pour Hébergement
  };

  const finalButtonLabel = buttonLabel || (isClient ? t('search_btn') : 'Rechercher');

  if (!isClient) return <div className="w-full h-20 bg-slate-100 animate-pulse rounded-xl" />;

  return (
    <div className="w-full">
      {!hideTabs && (
        <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 overflow-x-auto no-scrollbar py-1">
          <TabButton active={activeCategory === 'accommodations'} icon={<Building className="h-4 w-4 md:h-5 md:w-5" />} label={t("accommodations")} onClick={() => handleTabClick('accommodations')} />
          <TabButton active={activeCategory === 'cars'} icon={<Car className="h-4 w-4 md:h-5 md:w-5" />} label={t("car_rental")} onClick={() => handleTabClick('cars')} />
          <TabButton active={activeCategory === 'circuits'} icon={<Compass className="h-4 w-4 md:h-5 md:w-5" />} label={t("tours")} onClick={() => handleTabClick('circuits')} />
        </div>
      )}

      <form onSubmit={handleSearch} className="bg-[#FEBA02] p-1 rounded-2xl shadow-2xl flex flex-col md:flex-row items-stretch gap-1 relative z-40">
        {!hideLocation && (
          <div className="flex-[1.5] bg-white rounded-xl flex flex-col justify-center px-4 py-3 min-h-[75px] md:min-h-[85px] relative transition-colors hover:bg-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{activeCategory === 'cars' ? t('pickup_location') : t('where_to')}</span>
            <div className="flex items-center gap-3">
              <MapPin className="text-slate-300 h-5 w-5 shrink-0" />
              <input 
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm md:text-lg font-black text-slate-800 outline-none" 
                placeholder={activeCategory === 'cars' ? t('pickup_location') : t('where_to')} 
                value={destination} 
                onChange={(e) => setDestination(e.target.value)} 
                onFocus={() => destination.length >= 2 && setShowSuggestions(true)} 
              />
              {isLoadingSuggestions && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div ref={suggestionsRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2">
                {suggestions.map((s, i) => (
                  <div key={i} onClick={() => { setDestination(s.main); setShowSuggestions(false); }} className="flex items-center gap-4 p-4 hover:bg-primary/5 cursor-pointer">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div className="flex flex-col"><span className="font-black text-slate-900">{s.main}</span><span className="text-[10px] text-slate-400 uppercase font-bold">{s.sub}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 bg-white rounded-xl flex flex-col justify-center px-4 py-3 min-h-[75px] md:min-h-[85px] cursor-pointer hover:bg-slate-50 transition-colors">
              <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{activeCategory === 'cars' ? t("pickup_return") : t("arrival_departure")}</span>
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-slate-300 h-5 w-5 shrink-0" />
                <span className="text-sm md:text-lg font-black text-slate-800 truncate">
                  {dateRange?.from ? (dateRange.to ? `${format(dateRange.from, "dd MMM", { locale: getDateLocale() })} — ${format(dateRange.to, "dd MMM", { locale: getDateLocale() })}` : format(dateRange.from, "dd MMM", { locale: getDateLocale() })) : t("choose_dates")}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-2xl z-[100]" align="center">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={getDateLocale()} disabled={{ before: new Date() }} />
          </PopoverContent>
        </Popover>

        {activeCategory === 'accommodations' && (
          <Popover open={isOccupancyOpen} onOpenChange={setIsOccupancyOpen}>
            <PopoverTrigger asChild>
              <div className="flex-1 bg-white rounded-xl flex flex-col justify-center px-4 py-3 min-h-[75px] md:min-h-[85px] cursor-pointer hover:bg-slate-50 transition-colors">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">{t('guests_rooms')}</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 truncate"><Users className="text-slate-300 h-5 w-5 shrink-0" /><span className="text-sm md:text-lg font-black text-slate-800 truncate">{occupancy.adults} · {occupancy.children} · {occupancy.rooms}</span></div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[340px] p-6 space-y-6 border-none shadow-2xl rounded-2xl bg-white z-[100]" align="center">
              <OccupancyRow label={t('adults')} value={occupancy.adults} onMinus={() => updateOccupancy('adults', -1)} onPlus={() => updateOccupancy('adults', 1)} min={1} />
              <OccupancyRow label={t('children')} value={occupancy.children} onMinus={() => updateOccupancy('children', -1)} onPlus={() => updateOccupancy('children', 1)} min={0} />
              
              {occupancy.children > 0 && (
                <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('age_of_child')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {occupancy.childrenAges.map((age, i) => (
                      <div key={i} className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{t('child_singular')} {i + 1}</span>
                        <Select value={age.toString()} onValueChange={(v) => updateChildAge(i, parseInt(v))}>
                          <SelectTrigger className="h-10 bg-slate-50 border-slate-100 rounded-lg font-bold text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="z-[110]">
                            {Array.from({ length: 18 }).map((_, n) => (
                              <SelectItem key={n} value={n.toString()} className="font-bold">
                                {n} {n <= 1 ? t('year_label') : t('years_label')} {n < 2 ? `(${t('free_label')})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                  {occupancy.childrenAges.some(a => a < 2) && (
                    <div className="bg-emerald-50 p-3 rounded-xl flex gap-2 items-start border border-emerald-100">
                      <Info className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      <p className="text-[9px] font-medium text-emerald-800 leading-tight">
                        {t('infant_free_info')}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <OccupancyRow label={t('rooms')} value={occupancy.rooms} onMinus={() => updateOccupancy('rooms', -1)} onPlus={() => updateOccupancy('rooms', 1)} min={1} />
              <Button onClick={() => setIsOccupancyOpen(false)} className="w-full bg-primary text-white font-black h-12 rounded-xl mt-4">{t('done')}</Button>
            </PopoverContent>
          </Popover>
        )}

        <button type="submit" className="bg-primary hover:bg-[#059669] text-white px-8 md:px-12 py-4 flex items-center justify-center transition-all active:scale-95 rounded-xl min-h-[75px] md:min-h-[85px] group">
          <span className="text-xl md:text-2xl font-black tracking-tight group-hover:scale-105 transition-transform">{finalButtonLabel}</span>
        </button>
      </form>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-full text-xs md:text-base font-black transition-all border-none whitespace-nowrap outline-none", active ? "bg-white text-primary shadow-xl scale-105" : "bg-[#065f46] text-white hover:bg-[#044d35]")}>
      {icon} {label}
    </button>
  );
}

function OccupancyRow({ label, value, onMinus, onPlus, min }: any) {
  return (
    <div className="flex items-center justify-between">
      <Label className="font-bold text-slate-800">{label}</Label>
      <div className="flex items-center border rounded-lg overflow-hidden h-10 w-28">
        <button type="button" onClick={onMinus} disabled={value <= min} className="flex-1 h-full text-primary hover:bg-slate-50 disabled:opacity-30 border-r transition-colors"><Minus className="h-4 w-4 mx-auto" /></button>
        <span className="w-10 text-center font-bold text-slate-900">{value}</span>
        <button type="button" onClick={onPlus} className="flex-1 h-full text-primary hover:bg-slate-50 border-l transition-colors"><Plus className="h-4 w-4 mx-auto" /></button>
      </div>
    </div>
  );
}
