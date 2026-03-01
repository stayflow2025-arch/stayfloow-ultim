
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar as CalendarIcon, Building, Car, Compass } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr, enUS, es, arDZ } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { useLanguage } from '@/context/language-context';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

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
    
    let url = "";
    if (activeCategory === 'cars') {
      url = `/cars/results?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}`;
    } else if (activeCategory === 'circuits') {
      url = `/circuits/results?dest=${encodeURIComponent(destination)}`;
    } else {
      url = `/search?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}`;
    }
    
    router.push(url);
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
        <div className={cn(
          "flex-[1.5] bg-white flex flex-col justify-center px-6 py-3 min-h-[85px] relative group border-slate-100 transition-colors hover:bg-slate-50",
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

        <Popover>
          <PopoverTrigger asChild>
            <div className="flex-[1.5] bg-white flex flex-col justify-center px-6 py-3 min-h-[85px] cursor-pointer hover:bg-slate-50 transition-colors border-r border-slate-100">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight mb-1.5 leading-none">
                {activeCategory === 'cars' ? "Date de départ — Date de retour" : "Arrivée — Départ"}
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
