
"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Star, ChevronDown } from "lucide-react";

export type FilterStats = {
  ratings: Record<string, number>;
  amenities: Record<string, number>;
};

interface FilterSidebarProps {
  resultCount: number;
  stats: FilterStats;
  selectedAmenities: string[];
  selectedRatings: string[];
  onToggleAmenity: (amenity: string) => void;
  onToggleRating: (rating: string) => void;
}

export function FilterSidebar({ 
  resultCount, 
  stats, 
  selectedAmenities, 
  selectedRatings,
  onToggleAmenity,
  onToggleRating
}: FilterSidebarProps) {
  
  // Liste identique à celle du formulaire Onboarding pour une cohérence parfaite
  const amenitiesList = [
    "Wi-Fi gratuit",
    "Piscine",
    "Climatisation",
    "Parking gratuit",
    "Petit-déjeuner inclus",
    "Vue mer",
    "Cuisine équipée",
    "Restaurant sur place",
    "Réception 24h/24",
    "Animaux domestiques acceptés",
    "Terrasse / balcon / vue",
    "Salle de bain privée"
  ];

  const ratingOptions = [
    { label: "Fabuleux : 9+", value: "9" },
    { label: "Très bien : 8+", value: "8" },
    { label: "Bien : 7+", value: "7" },
    { label: "Agréable : 6+", value: "6" },
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
          {ratingOptions.map((opt) => (
            <FilterRow 
              key={opt.value} 
              label={opt.label} 
              count={stats.ratings[`${opt.value}+`] || 0} 
              id={`rate-${opt.value}`} 
              checked={selectedRatings.includes(opt.value)}
              onChange={() => onToggleRating(opt.value)}
            />
          ))}
        </div>
      </div>

      {/* Popular Equipments Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-[16px] font-bold text-[#10B981]">Équipements populaires</h3>
        <div className="space-y-3">
          {amenitiesList.map((amenity) => (
            <FilterRow 
              key={amenity} 
              label={amenity} 
              count={stats.amenities[amenity] || 0} 
              id={`eq-${amenity}`} 
              checked={selectedAmenities.includes(amenity)}
              onChange={() => onToggleAmenity(amenity)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterRow({ 
  label, 
  count, 
  id, 
  checked, 
  onChange 
}: { 
  label: string, 
  count: number, 
  id: string, 
  checked: boolean, 
  onChange: () => void 
}) {
  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={onChange}>
      <div className="flex items-center space-x-3">
        <Checkbox 
          id={id} 
          checked={checked}
          className="h-5 w-5 rounded-sm border-slate-300 data-[state=checked]:bg-[#10B981] data-[state=checked]:border-[#10B981]" 
        />
        <Label 
          htmlFor={id} 
          className="text-sm font-medium text-slate-900 group-hover:text-[#10B981] transition-colors cursor-pointer"
        >
          {label}
        </Label>
      </div>
      <span className="text-[12px] text-slate-400 font-medium">({count})</span>
    </div>
  );
}
