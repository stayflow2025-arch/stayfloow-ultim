"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, Search, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function FilterSidebar({ resultCount }: { resultCount: number }) {
  const { t } = useLanguage();

  const equipments = [
    { label: "Wi-Fi gratuit", count: 124, id: "eq-wifi" },
    { label: "Climatisation", count: 89, id: "eq-ac" },
    { label: "Parking gratuit", count: 67, id: "eq-parking" },
    { label: "Petit-déjeuner inclus", count: 54, id: "eq-bf" },
    { label: "Piscine", count: 32, id: "eq-pool" },
    { label: "Restaurant sur place", count: 41, id: "eq-rest" },
    { label: "Réception 24h/24", count: 76, id: "eq-rec" },
    { label: "Animaux domestiques acceptés", count: 28, id: "eq-pets" },
    { label: "Terrasse / balcon / vue", count: 45, id: "eq-view" },
    { label: "Cuisine / coin cuisine", count: 38, id: "eq-kitchen" },
    { label: "Prises électriques près du lit", count: 92, id: "eq-plugs" },
    { label: "Salle de bain privée", count: 110, id: "eq-bath" },
    { label: "Lit bébé / lit supplémentaire", count: 15, id: "eq-baby" },
    { label: "Ascenseur", count: 48, id: "eq-elev" },
    { label: "Accessibilité PMR", count: 12, id: "eq-handi" },
  ];

  return (
    <div className="space-y-6">
      {/* Title with Green Star */}
      <div className="flex items-center gap-2 border-b pb-4">
        <div className="bg-[#10B981] p-1.5 rounded-sm">
          <Star className="h-4 w-4 text-white fill-white" />
        </div>
        <h2 className="text-[18px] font-bold text-[#10B981]">Filtres intelligents</h2>
      </div>

      {/* Quick Search */}
      <div className="space-y-2">
        <Label className="font-bold text-slate-900">Que recherchez-vous ?</Label>
        <div className="relative">
          <input 
            className="w-full bg-slate-50 border rounded-md h-10 pl-3 pr-10 text-[13px] focus:ring-2 ring-[#10B981]/20 outline-none"
            placeholder="Exemple : annulation gratuite..."
          />
          <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
        <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-md h-10 shadow-sm mt-2">
          Trouver des hébergements
        </Button>
      </div>

      {/* Ratings Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-[16px] font-bold text-slate-900">Note des commentaires</h3>
        <div className="space-y-3">
          <FilterRow label="Fabuleux : 9+" count={16} id="rate-9" />
          <FilterRow label="Très bien : 8+" count={71} id="rate-8" />
          <FilterRow label="Bien : 7+" count={82} id="rate-7" />
          <FilterRow label="Agréable : 6+" count={86} id="rate-6" />
        </div>
      </div>

      {/* NEW: Popular Equipments Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-[16px] font-bold text-[#10B981]">Équipements populaires</h3>
        <div className="space-y-3">
          {equipments.map((eq) => (
            <FilterRow key={eq.id} label={eq.label} count={eq.count} id={eq.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, count, id }: { label: string, count: number, id: string }) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex items-center space-x-3">
        <Checkbox id={id} className="h-5 w-5 rounded-sm border-slate-300 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]" />
        <Label htmlFor={id} className="text-sm font-medium text-slate-900 group-hover:text-[#10B981] transition-colors cursor-pointer">
          {label}
        </Label>
      </div>
      <span className="text-[12px] text-slate-400 font-medium">({count})</span>
    </div>
  );
}
