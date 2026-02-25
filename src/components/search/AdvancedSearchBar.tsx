
"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Calendar as CalendarIcon, Users, Search, Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

export default function AdvancedSearchBar() {
  const [destination, setDestination] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [occupancy, setOccupancy] = useState({ adults: 2, children: 0, rooms: 1 });
  const [activeStep, setActiveStep] = useState<'destination' | 'dates' | 'occupancy' | null>(null);

  // Auto-advance logic: Dates -> Occupancy only when BOTH dates are selected
  useEffect(() => {
    if (activeStep === 'dates' && dateRange?.from && dateRange?.to) {
      const timer = setTimeout(() => {
        setActiveStep('occupancy');
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [dateRange, activeStep]);

  const handleSearch = () => {
    const from = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : '';
    const to = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : '';
    window.location.href = `/search?dest=${encodeURIComponent(destination)}&from=${from}&to=${to}&adults=${occupancy.adults}&rooms=${occupancy.rooms}`;
  };

  return (
    <div className="bg-[#febb02] p-1 rounded-lg shadow-xl w-full">
      <div className="bg-white rounded flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x-2 border-2 border-[#febb02]">
        
        {/* 1. Destination */}
        <div 
          className={cn(
            "flex-1 p-3 flex items-center gap-3 cursor-text hover:bg-slate-50 transition-colors",
            activeStep === 'destination' && "ring-2 ring-primary inset-0 z-10"
          )}
          onClick={() => setActiveStep('destination')}
        >
          <MapPin className="text-muted-foreground h-5 w-5 shrink-0" />
          <div className="flex flex-col w-full">
            <input 
              className="bg-transparent border-none focus:ring-0 p-0 text-sm font-bold placeholder:text-muted-foreground w-full outline-none text-slate-800"
              placeholder="Où allez-vous ?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onFocus={() => setActiveStep('destination')}
            />
          </div>
        </div>

        {/* 2. Dates (Stays open until range is complete) */}
        <Popover 
          open={activeStep === 'dates'} 
          onOpenChange={(open) => setActiveStep(open ? 'dates' : null)}
        >
          <PopoverTrigger asChild>
            <div className={cn(
              "flex-1 p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors",
              activeStep === 'dates' && "ring-2 ring-primary inset-0 z-10"
            )}>
              <CalendarIcon className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="flex flex-col text-sm">
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, "EEE d MMM", { locale: fr })} — ${format(dateRange.to, "EEE d MMM", { locale: fr })}`
                    ) : `${format(dateRange.from, "EEE d MMM", { locale: fr })} — ...`
                  ) : "Arrivée — Départ"}
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-2xl" align="center" sideOffset={8}>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
              locale={fr}
              className="rounded-lg border shadow-xl bg-white"
            />
          </PopoverContent>
        </Popover>

        {/* 3. Occupancy */}
        <Popover 
          open={activeStep === 'occupancy'} 
          onOpenChange={(open) => setActiveStep(open ? 'occupancy' : null)}
        >
          <PopoverTrigger asChild>
            <div className={cn(
              "flex-1 p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors",
              activeStep === 'occupancy' && "ring-2 ring-primary inset-0 z-10"
            )}>
              <Users className="text-muted-foreground h-5 w-5 shrink-0" />
              <div className="flex flex-col text-sm">
                <span className="font-bold text-slate-800 whitespace-nowrap">
                  {occupancy.adults} adultes · {occupancy.children} enfants · {occupancy.rooms} chambre
                </span>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 shadow-2xl bg-white border" align="end" sideOffset={8}>
            <div className="space-y-6">
              <OccupancyRow 
                label="Adultes" 
                value={occupancy.adults} 
                onDec={() => setOccupancy({...occupancy, adults: Math.max(1, occupancy.adults - 1)})}
                onInc={() => setOccupancy({...occupancy, adults: occupancy.adults + 1})}
              />
              <OccupancyRow 
                label="Enfants" 
                value={occupancy.children} 
                onDec={() => setOccupancy({...occupancy, children: Math.max(0, occupancy.children - 1)})}
                onInc={() => setOccupancy({...occupancy, children: occupancy.children + 1})}
              />
              <OccupancyRow 
                label="Chambres" 
                value={occupancy.rooms} 
                onDec={() => setOccupancy({...occupancy, rooms: Math.max(1, occupancy.rooms - 1)})}
                onInc={() => setOccupancy({...occupancy, rooms: occupancy.rooms + 1})}
              />
              <Button className="w-full bg-primary font-bold" onClick={() => setActiveStep(null)}>Terminé</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Search Button */}
        <div className="p-1 md:w-40 flex items-center justify-center">
          <Button 
            className="w-full h-full bg-[#006ce4] hover:bg-[#0057b8] text-white text-lg rounded py-3 font-bold" 
            onClick={handleSearch}
          >
            Rechercher
          </Button>
        </div>
      </div>
    </div>
  );
}

function OccupancyRow({ label, value, onDec, onInc }: { label: string, value: number, onDec: () => void, onInc: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-slate-700">{label}</span>
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-sm border-[#006ce4] text-[#006ce4] hover:bg-[#f0f6ff]" 
          onClick={onDec}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center font-bold text-lg">{value}</span>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-sm border-[#006ce4] text-[#006ce4] hover:bg-[#f0f6ff]" 
          onClick={onInc}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
