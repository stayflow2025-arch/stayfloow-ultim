
"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Filter, Star, Info } from "lucide-react";
import { Button } from "./ui/button";

export function FilterSidebar({ resultCount }: { resultCount: number }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl sticky top-24">
      <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" /> Filtrer ({resultCount})
        </h3>
        <Button variant="ghost" size="sm" className="text-[10px] font-black text-primary p-0 h-auto">TOUT EFFACER</Button>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Budget */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Budget par nuit</h4>
          <div className="space-y-3">
            <FilterItem label="0 - 5 000 DZD" />
            <FilterItem label="5 000 - 10 000 DZD" />
            <FilterItem label="10 000 - 20 000 DZD" />
            <FilterItem label="20 000 DZD +" />
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Étoiles */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Étoiles</h4>
          <div className="space-y-3">
            {[5, 4, 3, 2].map(s => (
              <FilterItem 
                key={s} 
                label={`${s} étoiles`} 
                icon={<div className="flex ml-1">{Array(s).fill(0).map((_, i) => <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />)}</div>} 
              />
            ))}
          </div>
        </div>

        <Separator className="bg-slate-100" />

        {/* Équipements populaires */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Équipements</h4>
          <div className="space-y-3">
            <FilterItem label="WiFi gratuit" />
            <FilterItem label="Piscine" />
            <FilterItem label="Petit-déjeuner inclus" />
            <FilterItem label="Parking gratuit" />
          </div>
        </div>

        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
              Les filtres vous aident à trouver l'hébergement idéal selon vos critères spécifiques.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterItem({ label, icon }: { label: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      <Checkbox id={label} className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-primary transition-all" />
      <Label htmlFor={label} className="text-sm font-bold text-slate-600 leading-none flex items-center group-hover:text-primary transition-colors cursor-pointer">
        {label} {icon}
      </Label>
    </div>
  );
}
