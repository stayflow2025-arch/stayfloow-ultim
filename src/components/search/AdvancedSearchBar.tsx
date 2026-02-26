"use client";

import React, { useState } from 'react';
import { MapPin, Calendar as CalendarIcon, Users, Building, Car, Compass, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';

type Category = 'accommodations' | 'cars' | 'circuits';

export default function AdvancedSearchBar() {
  const { t, locale } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>('accommodations');
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [occupancy, setOccupancy] = useState({ adults: 2, children: 0, rooms: 1 });

  const getDateLocale = () => {
    switch (locale) {
      case 'en': return enUS;
      case 'es': return es;
      case 'ar': return arDZ;
      default: return fr;
    }
  };

  const handleSearch = () => {
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
    window.location.href = `/search?type=${activeCategory}&dest=${encodeURIComponent(destination)}&from=${from}&to=${to}&adults=${occupancy.adults}&rooms=${occupancy.rooms}`;
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
        <CategoryTab 
          active={activeCategory === 'accommodations'} 
          onClick={() => setActiveCategory('accommodations')}
          icon={<Building className="h-4 w-4" />}
          label={t("accommodations")}
        />
        <CategoryTab 
          active={activeCategory === 'cars'} 
          onClick={() => setActiveCategory('cars')}
          icon={<Car className="h-4 w-4" />}
          label={t("car_rental")}
        />
        <CategoryTab 
          active={activeCategory === 'circuits'} 
          onClick={() => setActiveCategory('circuits')}
          icon={<Compass className="h-4 w-4" />}
          label={t("tours")}
        />
      </div>

      <div className="bg-[#febb02] p-1 rounded-lg shadow-2xl flex flex-col md:flex-row items-stretch gap-1">
        <div className="flex-1 bg-white rounded flex items-center px-4 py-3 gap-3 focus-within:ring-2 ring-primary transition-all">
          <MapPin className="text-slate-400 h-5 w-5 shrink-0" />
          <input 
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-slate-800 placeholder:text-slate-500 outline-none"
            placeholder={t("where_to")}
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 bg-white rounded flex items-center px-4 py-3 gap-3 cursor-pointer hover:bg-slate-50 transition-all">
              <CalendarIcon className="text-slate-400 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">
                {dateRange?.from ? (
                  dateRange.to ? `${format(dateRange.from, "dd MMM", { locale: getDateLocale() })} — ${format(dateRange.to, "dd MMM", { locale: getDateLocale() })}` 
                  : format(dateRange.from, "dd MMM", { locale: getDateLocale() })
                ) : t("dates_placeholder")}
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="center">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={getDateLocale()}
              disabled={{ before: new Date() }}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-1 bg-white rounded flex items-center px-4 py-3 gap-3 cursor-pointer hover:bg-slate-50 transition-all">
              <Users className="text-slate-400 h-5 w-5 shrink-0" />
              <span className="text-sm font-bold text-slate-800 truncate">
                {occupancy.adults} ad · {occupancy.children} enf · {occupancy.rooms} ch.
              </span>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 shadow-2xl bg-white rounded-xl border border-slate-100">
            <div className="space-y-6">
              <OccupancyRow label="Adultes" value={occupancy.adults} onDec={() => setOccupancy({...occupancy, adults: Math.max(1, occupancy.adults - 1)})} onInc={() => setOccupancy({...occupancy, adults: occupancy.adults + 1})} />
              <OccupancyRow label="Enfants" value={occupancy.children} onDec={() => setOccupancy({...occupancy, children: Math.max(0, occupancy.children - 1)})} onInc={() => setOccupancy({...occupancy, children: occupancy.children + 1})} />
              <OccupancyRow label="Chambres" value={occupancy.rooms} onDec={() => setOccupancy({...occupancy, rooms: Math.max(1, occupancy.rooms - 1)})} onInc={() => setOccupancy({...occupancy, rooms: occupancy.rooms + 1})} />
              <Button className="w-full bg-primary font-black text-white hover:bg-primary/90 mt-4 rounded-md h-12" onClick={() => {}}>Terminé</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Button className="md:w-40 bg-[#006ce4] hover:bg-[#0052ad] text-white h-14 md:h-auto font-black text-xl rounded shadow-lg transition-transform active:scale-95" onClick={handleSearch}>
          {t("search_btn")}
        </Button>
      </div>
    </div>
  );
}

function CategoryTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border border-transparent whitespace-nowrap", active ? "bg-white/20 text-white border-white shadow-sm" : "text-white/80 hover:bg-white/10")}>
      {icon} {label}
    </button>
  );
}

function OccupancyRow({ label, value, onDec, onInc }: { label: string, value: number, onDec: () => void, onInc: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-slate-700 text-sm">{label}</span>
      <div className="flex items-center gap-4">
        <button onClick={onDec} className="h-8 w-8 rounded border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-colors disabled:opacity-30" disabled={value <= 0 && label !== "Adultes" || (label === "Adultes" && value <= 1)}><Minus className="h-4 w-4" /></button>
        <span className="w-4 text-center font-bold text-sm">{value}</span>
        <button onClick={onInc} className="h-8 w-8 rounded border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-colors"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
