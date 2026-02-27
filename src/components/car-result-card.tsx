
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, MapPin, ChevronRight, Gauge, Fuel, Users, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { useCurrency } from "@/context/currency-context";
import { Button } from "./ui/button";
import { useState } from "react";

export interface CarListing {
  id: string;
  name: string;
  brand: string;
  supplier: string;
  rating: number;
  reviewsCount: number;
  location: string;
  distance: string;
  description: string;
  images: string[];
  specs: string[];
  pricePerDay: number;
  isAutomatic: boolean;
  category: string;
}

interface CarResultCardProps {
  car: CarListing;
  viewMode?: "grid" | "list";
}

export function CarResultCard({ car, viewMode = "list" }: CarResultCardProps) {
  const { formatPrice } = useCurrency();
  const [isFavorite, setIsFavorited] = useState(false);

  const ratingText = car.rating >= 9 ? "Fabuleux" : car.rating >= 8.5 ? "Exceptionnel" : car.rating >= 8 ? "Très bien" : "Bien";

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow group p-4 gap-4">
      {/* Photo (Exact 200x150 sur desktop) */}
      <div className="relative w-full md:w-[240px] h-[180px] shrink-0 rounded-md overflow-hidden">
        <Image 
          src={car.images[0] || 'https://picsum.photos/seed/car/400/300'} 
          alt={`${car.brand} ${car.name}`} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button 
          onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorite); }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm z-10"
        >
          <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-[#10B981]")} />
        </button>
      </div>

      {/* Details (Middle) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/cars/${car.id}`}>
                <h3 className="text-[18px] font-bold text-[#10B981] hover:text-[#059669] hover:underline transition-all truncate leading-tight">
                  {car.brand} {car.name} {car.isAutomatic ? "Automatique" : "Manuelle"}
                </h3>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-[12px] mb-2">
              <span className="text-slate-900 font-bold">{car.supplier}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[#10B981] font-bold underline cursor-pointer">Indiquer sur la carte</span>
              <span className="text-slate-500">{car.location}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-900 leading-none mb-1">{ratingText}</p>
              <p className="text-[11px] text-slate-500 italic">{car.reviewsCount} avis clients</p>
            </div>
            <div className="bg-[#10B981] text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-sm rounded-bl-none">
              {car.rating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-3">
          <p className="text-[#6B6B6B] text-[14px] leading-relaxed line-clamp-2">
            {car.description}
            <Link href={`/cars/${car.id}`} className="text-[#10B981] hover:underline ml-1 font-medium">En savoir plus</Link>
          </p>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4">
            {car.specs.map((spec, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500 text-[12px]">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                {spec}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[#059669] text-[12px] font-bold">
            <ShieldCheck className="h-4 w-4" /> Annulation gratuite • Payez sur place
          </div>
        </div>
      </div>

      {/* Pricing (Right) */}
      <div className="md:w-48 flex flex-col justify-end md:items-end text-right gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
        <p className="text-[11px] text-slate-500 leading-none">Prix pour 1 jour</p>
        <div>
          <p className="text-[22px] font-bold text-[#10B981] leading-none">{formatPrice(car.pricePerDay)} / jour</p>
          <p className="text-[11px] text-slate-500 mt-1">Taxes et frais compris</p>
        </div>
        <Link href={`/cars/${car.id}/book`} className="w-full">
          <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold h-10 rounded-md group/btn flex items-center justify-between px-4">
            Voir l'offre
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
