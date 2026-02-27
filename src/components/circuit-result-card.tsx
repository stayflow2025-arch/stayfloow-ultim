"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, MapPin, ChevronRight, Clock, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/context/currency-context";
import { Button } from "./ui/button";
import { useState } from 'react';

export function CircuitResultCard({ circuit }: { circuit: any }) {
  const { formatPrice } = useCurrency();
  const [isFavorite, setIsFavorited] = useState(false);

  const rating = circuit.rating || 8.5;
  const ratingText = rating >= 9 ? "Exceptionnel" : rating >= 8.5 ? "Superbe" : rating >= 8 ? "Très bien" : "Bien";
  const circuitName = circuit.details?.name || circuit.title || "Circuit StayFloow";
  const circuitDescription = circuit.details?.description || circuit.description || "";
  const circuitDuration = circuit.details?.duration || circuit.duration || "1 jour";
  const circuitLocation = circuit.location?.address || circuit.location || "Algérie / Égypte";
  const circuitPrice = circuit.price || circuit.pricePerPerson || 0;

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow group p-4 gap-4">
      {/* Photo */}
      <div className="relative w-full md:w-[240px] h-[180px] shrink-0 rounded-md overflow-hidden">
        <Image 
          src={circuit.photos?.[0] || circuit.images?.[0] || 'https://picsum.photos/seed/circuit/400/300'} 
          alt={circuitName} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">CERTIFIÉ</div>
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
            <Link href={`/circuits/${circuit.id}`}>
              <h3 className="text-[18px] font-bold text-[#10B981] hover:text-[#059669] hover:underline transition-all truncate leading-tight">
                {circuitName}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-[12px] mt-1 mb-2">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> {circuitLocation}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-[#10B981] font-bold underline cursor-pointer">Indiquer sur la carte</span>
            </div>
          </div>

          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-slate-900 leading-none mb-1">{ratingText}</p>
              <p className="text-[11px] text-slate-500 italic">{circuit.reviewsCount || 0} commentaires</p>
            </div>
            <div className="bg-[#10B981] text-white font-bold text-lg w-9 h-9 flex items-center justify-center rounded-sm rounded-bl-none">
              {rating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <p className="text-[#6B6B6B] text-[14px] leading-relaxed line-clamp-2 italic">
            "{circuitDescription}"
          </p>
          
          <div className="flex items-center gap-4 text-slate-500 text-[12px] font-bold">
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
              <Clock className="h-3.5 w-3.5 text-primary" /> {circuitDuration}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[#059669] text-[12px] font-bold">
            <Check className="h-4 w-4" /> Annulation gratuite
          </div>
        </div>
      </div>

      {/* Pricing (Right) */}
      <div className="md:w-48 flex flex-col justify-end md:items-end text-right gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
        <p className="text-[11px] text-slate-500 leading-none">À partir de</p>
        <div>
          <p className="text-[22px] font-bold text-[#10B981] leading-none">{formatPrice(circuitPrice)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Taxes et frais compris</p>
        </div>
        <Link href={`/circuits/${circuit.id}`} className="w-full">
          <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold h-10 rounded-md group/btn flex items-center justify-between px-4">
            Détails
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
