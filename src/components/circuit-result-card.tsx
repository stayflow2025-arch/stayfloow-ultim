"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, MapPin, ChevronRight, Clock, Users, Compass, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { Button } from "./ui/button";
import { useState } from "react";

export interface CircuitListing {
  id: string;
  name: string;
  location: string;
  guide: string;
  guideRating: number;
  reviewsCount: number;
  duration: string;
  description: string;
  images: string[];
  options: string[];
  pricePerPerson: number;
  isPopular?: boolean;
}

interface CircuitResultCardProps {
  circuit: CircuitListing;
}

export function CircuitResultCard({ circuit }: CircuitResultCardProps) {
  const { formatPrice } = useCurrency();
  const [isFavorite, setIsFavorited] = useState(false);

  const ratingText = circuit.guideRating >= 9 ? "Exceptionnel" : circuit.guideRating >= 8.5 ? "Superbe" : circuit.guideRating >= 8 ? "Très bien" : "Bien";

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow group p-4 gap-4">
      {/* Photo */}
      <div className="relative w-full md:w-[240px] h-[180px] shrink-0 rounded-md overflow-hidden">
        <Image 
          src={circuit.images[0] || 'https://picsum.photos/seed/circuit/400/300'} 
          alt={circuit.name} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button 
          onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorite); }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm z-10"
        >
          <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-[#10B981]")} />
        </button>
        {circuit.isPopular && (
          <div className="absolute bottom-2 left-2 bg-secondary text-primary font-black text-[10px] px-2 py-1 rounded shadow-lg uppercase">
            Coup de cœur
          </div>
        )}
      </div>

      {/* Details (Middle) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={`/circuits/${circuit.id}`}>
                <h3 className="text-[18px] font-bold text-[#10B981] hover:text-[#059669] hover:underline transition-all truncate leading-tight">
                  {circuit.name}
                </h3>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-[12px] mb-2">
              <span className="text-slate-900 font-bold">Guide : {circuit.guide}</span>
              <span className="text-slate-400">•</span>
              <span className="text-[#10B981] font-bold underline cursor-pointer">Voir itinéraire</span>
              <span className="text-slate-500">{circuit.location}</span>
            </div>
          </div>

          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-900 leading-none mb-1">{ratingText}</p>
              <p className="text-[11px] text-slate-500 italic">{circuit.reviewsCount} avis clients</p>
            </div>
            <div className="bg-[#10B981] text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-sm rounded-bl-none">
              {circuit.guideRating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-3">
          <p className="text-[#6B6B6B] text-[14px] leading-relaxed line-clamp-2 italic">
            "{circuit.description}"
            <Link href={`/circuits/${circuit.id}`} className="text-[#10B981] hover:underline ml-1 font-medium">En savoir plus</Link>
          </p>
          
          <div className="flex flex-wrap gap-y-2 gap-x-4">
            <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-bold">
              <Clock className="h-3.5 w-3.5" /> {circuit.duration}
            </div>
            {circuit.options.slice(0, 4).map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5 text-slate-500 text-[12px]">
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                {opt}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[#059669] text-[12px] font-bold">
            <ShieldCheck className="h-4 w-4" /> Assurance incluse • Annulation gratuite
          </div>
        </div>
      </div>

      {/* Pricing (Right) */}
      <div className="md:w-48 flex flex-col justify-end md:items-end text-right gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
        <p className="text-[11px] text-slate-500 leading-none">Prix par personne</p>
        <div>
          <p className="text-[22px] font-bold text-[#10B981] leading-none">{formatPrice(circuit.pricePerPerson)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Tout compris</p>
        </div>
        <Link href={`/circuits/book?id=${circuit.id}`} className="w-full">
          <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold h-10 rounded-md group/btn flex items-center justify-between px-4">
            Réserver
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
