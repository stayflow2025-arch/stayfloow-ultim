
"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar as CalendarIcon, Users, Building, Car, Compass, Minus, Plus, Clock, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';
import { useRouter, usePathname } from 'next/navigation';

type Category = 'accommodations' | 'cars' | 'circuits';

export default function AdvancedSearchBar() {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  
  const [activeCategory, setActiveCategory] = useState<Category>('accommodations');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [occupancy, setOccupancy] = useState({ adults: 2, children: 0, rooms: 1 });
  const [times, setTimes] = useState({ pickup: "10:00", return: "10:00" });

  useEffect(() => {
    if (pathname === '/cars' || pathname.startsWith('/cars/')) {
      setActiveCategory('cars');
    } else if (pathname === '/circuits' || pathname.startsWith('/circuits/')) {
      setActiveCategory('circuits');
    } else if (pathname === '/' || pathname.startsWith('/search') || pathname.startsWith('/properties')) {
      setActiveCategory('accommodations');
    }
  }, [pathname]);

  const getDateLocale = () => {
    switch (locale) {
      case 'en': return enUS;
      case 'es': return es;
      case 'ar': return arDZ;
      default: return fr;
    }
  };

  const handleTabClick = (category: Category) => {
    setActiveCategory(category);
    if (category === 'accommodations') {
      router.push('/');
    } else if (category === 'cars') {
      router.push('/cars');
    } else if (category === 'circuits') {
      router.push('/circuits');
    }
  };

  const handleSearch = () => {
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
    
    let url = "";
    if (activeCategory === 'cars') {
      url = `/cars/results?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}&pickup_time=${times.pickup}&return_time=${times.return}`;
    } else if (activeCategory === 'circuits') {
      url = `/circuits/results?dest=${encodeURIComponent(destination)}`;
    } else {
      url = `/search?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}&adults=${occupancy.adults}&rooms=${occupancy.rooms}`;
    }
    
    router.push(url);
  };

  const hours = Array.from({ length: 24 * 2 }, (_, i) => {
    const h = Math.floor(i / 2).toString().padStart(2, '0');
    const m = (i % 2 === 0 ? '00' : '30');
    return `${h}:${m}`;
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] w-full">
      {/* TABS - EXACT STYLE FROM IMAGE */}
      <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-1">
        <CategoryTab 
          active={activeCategory === 'accommodations'} 
          onClick={() => handleTabClick('accommodations')}
          icon={<Building className="h-4 w-4" />}
          label={t("accommodations")}
        />
        <CategoryTab 
          active={activeCategory === 'cars'} 
          onClick={() => handleTabClick('cars')}
          icon={<Car className="h-4 w-4" />}
          label={t("car_rental")}
        />
        <CategoryTab 
          active={activeCategory === 'circuits'} 
          onClick={() => handleTabClick('circuits')}
          icon={<Compass className="h-4 w-4" />}
          label={t("tours")}
        />
      </div>

      {/* SEARCH BAR CONTAINER - YELLOW BORDER STYLE */}
      <div className="border-[3px] border-[#FEBA02] p-1 rounded-2xl flex flex-col md:flex-row items-stretch gap-1">
        
        {/* DESTINATION */}
        <div className="flex-[1.5] bg-white rounded-xl flex items-center px-5 py-4 gap-3 group transition-all relative">
          <div className="flex flex-col flex-1">
            {activeCategory === 'cars' && <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{t('pickup_location')}</span>}
            <div className="flex items-center gap-3">
              <MapPin className="text-slate-300 group-hover:text-primary h-5 w-5 shrink-0 transition-colors" />
              <input 
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-bold text-slate-800 placeholder:text-slate-400 outline-none"
                placeholder={activeCategory === 'cars' ? t('pickup_location') : activeCategory === 'circuits' ? 'Où souhaitez-vous aller ?' : t("where_to")}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
          </div>
          {destination && (
            <button onClick={() => setDestination('')} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* DATES */}
        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-[1.5] bg-white rounded-xl flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 transition-all border-l md:border-l-slate-100">
              <div className="flex flex-col flex-1">
                {activeCategory === 'cars' && <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">{t('pickup_date')} — {t('return_date')}</span>}
                <div className="flex items-center gap-3">
                  <CalendarIcon className="text-slate-300 h-5 w-5 shrink-0" />
                  <span className="text-base font-bold text-slate-800 truncate">
                    {dateRange?.from ? (
                      dateRange.to ? `${format(dateRange.from, "dd MMM", { locale: getDateLocale() })} — ${format(dateRange.to, "dd MMM", { locale: getDateLocale() })}` 
                      : format(dateRange.from, "dd MMM", { locale: getDateLocale() })
                    ) : t("dates_placeholder")}
                  </span>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] md:w-auto p-0 border-none shadow-2xl" align="center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              locale={getDateLocale()}
              disabled={{ before: new Date() }}
              className="md:hidden"
            />
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={getDateLocale()}
              disabled={{ before: new Date() }}
              className="hidden md:block"
            />
          </PopoverContent>
        </Popover>

        {/* TIME / OCCUPANCY */}
        {activeCategory === 'cars' ? (
          <div className="flex-1 bg-white rounded-xl flex items-center px-5 py-4 gap-4 border-l md:border-l-slate-100">
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[9px] font-black text-slate-400 uppercase">{t('hour')}</span>
              <Select value={times.pickup} onValueChange={(val) => setTimes({...times, pickup: val})}>
                <SelectTrigger className="border-none p-0 h-auto font-bold text-sm bg-transparent shadow-none focus:ring-0">
                  <Clock className="h-3 w-3 mr-1 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={`p-${h}`} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-px h-8 bg-slate-100" />
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-[9px] font-black text-slate-400 uppercase">{t('hour')}</span>
              <Select value={times.return} onValueChange={(val) => setTimes({...times, return: val})}>
                <SelectTrigger className="border-none p-0 h-auto font-bold text-sm bg-transparent shadow-none focus:ring-0">
                  <Clock className="h-3 w-3 mr-1 text-slate-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={`r-${h}`} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : activeCategory === 'circuits' ? (
          <div className="flex-1 bg-white rounded-xl flex items-center px-5 py-4 gap-3 border-l md:border-l-slate-100">
            <Users className="text-slate-300 h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">Participants</span>
              <input 
                type="number"
                min="1"
                className="w-full bg-transparent border-none focus:ring-0 p-0 text-base font-bold text-slate-800 outline-none"
                value={occupancy.adults}
                onChange={(e) => setOccupancy({...occupancy, adults: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex-1 bg-white rounded-xl flex items-center px-5 py-4 gap-3 cursor-pointer hover:bg-slate-50 transition-all border-l md:border-l-slate-100">
                <Users className="text-slate-300 h-5 w-5 shrink-0" />
                <span className="text-base font-bold text-slate-800 truncate">
                  {occupancy.adults} {t('adult_short')} · {occupancy.children} {t('child_short')} · {occupancy.rooms} {t('room_short')}
                </span>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] md:w-80 p-6 shadow-2xl bg-white rounded-2xl border border-slate-100">
              <div className="space-y-6">
                <OccupancyRow label={t('adults')} value={occupancy.adults} onDec={() => setOccupancy({...occupancy, adults: Math.max(1, occupancy.adults - 1)})} onInc={() => setOccupancy({...occupancy, adults: occupancy.adults + 1})} />
                <OccupancyRow label={t('children')} value={occupancy.children} onDec={() => setOccupancy({...occupancy, children: Math.max(0, occupancy.children - 1)})} onInc={() => setOccupancy({...occupancy, children: occupancy.children + 1})} />
                <OccupancyRow label={t('rooms')} value={occupancy.rooms} onDec={() => setOccupancy({...occupancy, rooms: Math.max(1, occupancy.rooms - 1)})} onInc={() => setOccupancy({...occupancy, rooms: occupancy.rooms + 1})} />
                <Button className="w-full bg-primary font-black text-white hover:bg-primary/90 mt-4 rounded-xl h-12" onClick={() => {}}>{t('start')}</Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* SEARCH BUTTON - SOLID STYLE INSIDE BAR */}
        <Button 
          className="w-full md:w-56 bg-primary hover:bg-primary/90 text-white h-16 md:h-auto font-black text-2xl rounded-xl shadow-lg transition-all active:scale-95 border-none" 
          onClick={handleSearch}
        >
          <span className="flex items-center gap-2">
            {t("search_btn")}
          </span>
        </Button>
      </div>
    </div>
  );
}

function CategoryTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-3 px-6 py-3.5 rounded-full text-sm font-bold transition-all border whitespace-nowrap", 
        active 
          ? "bg-white text-primary border-slate-100 shadow-[0_4px_15px_rgba(0,0,0,0.08)] scale-105" 
          : "bg-slate-400/80 text-white border-transparent hover:bg-slate-500"
      )}
    >
      <span className={cn(active ? "text-primary" : "text-white")}>{icon}</span>
      {label}
    </button>
  );
}

function OccupancyRow({ label, value, onDec, onInc }: { label: string, value: number, onDec: () => void, onInc: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-slate-700 text-sm capitalize">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={onDec} className="h-8 w-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-colors disabled:opacity-30" disabled={value <= 0 && label !== t('adults') || (label === t('adults') && value <= 1)}><Minus className="h-4 w-4" /></button>
        <span className="w-4 text-center font-bold text-sm">{value}</span>
        <button onClick={onInc} className="h-8 w-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-colors"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
