
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, MapPin, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Property } from "@/lib/data";
import { Badge } from "./ui/badge";
import { useCurrency } from "@/context/currency-context";
import { Button } from "./ui/button";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

interface PropertyCardProps {
  property: Property;
  viewMode?: "grid" | "list";
  priority?: boolean;
}

export function PropertyCard({ property, viewMode = "list", priority = false }: PropertyCardProps) {
  const { formatPrice } = useCurrency();
  const [isFavorite, setIsFavorited] = useState(false);
  const searchParams = useSearchParams();

  // On récupère les paramètres de recherche actuels pour les transmettre au lien de détail
  const currentParams = searchParams.toString();
  const detailUrl = `/properties/${property.id}${currentParams ? `?${currentParams}` : ""}`;

  const ratingText = property.rating >= 9 ? "Fabuleux" : property.rating >= 8.5 ? "Exceptionnel" : property.rating >= 8 ? "Très bien" : "Bien";

  if (viewMode === "grid") {
    return (
      <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow group flex flex-col page-fade-in">
        <div className="relative aspect-[4/3] w-full">
          <Image 
            src={property.images[0] || 'https://picsum.photos/seed/stay/400/300'} 
            alt={property.name} 
            fill 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <button 
            onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorite); }}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm z-10 transition-transform active:scale-90"
          >
            <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-[#10B981]")} />
          </button>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start gap-2 mb-1">
            <h3 className="font-bold text-slate-900 group-hover:text-[#059669] transition-colors leading-tight line-clamp-2">
              {property.name}
            </h3>
            <div className="flex flex-col items-end shrink-0">
              <div className="bg-[#10B981] text-white font-black text-xs px-1.5 py-1 rounded-sm shadow-sm">
                {property.rating.toFixed(1)}
              </div>
            </div>
          </div>
          <p className="text-[12px] text-slate-500 flex items-center gap-1 mb-3 font-medium">
            <MapPin className="h-3 w-3 text-primary" /> {property.location}
          </p>
          <div className="mt-auto pt-3 border-t flex justify-between items-end">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">À partir de</p>
              <p className="text-xl font-black text-[#10B981] tracking-tighter">{formatPrice(property.price)}</p>
            </div>
            <Link href={detailUrl}>
              <Button size="sm" className="bg-[#10B981] hover:bg-[#059669] h-8 rounded-md px-4 text-[10px] font-black uppercase">Détails</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow group p-4 gap-4 page-fade-in">
      {/* Photo (Optimisée pour le listing) */}
      <div className="relative w-full md:w-[240px] h-[180px] shrink-0 rounded-md overflow-hidden bg-slate-100">
        <Image 
          src={property.images[0] || 'https://picsum.photos/seed/stay/400/300'} 
          alt={property.name} 
          fill 
          sizes="(max-width: 768px) 100vw, 240px"
          priority={priority}
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <button 
          onClick={(e) => { e.preventDefault(); setIsFavorited(!isFavorite); }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm z-10 transition-transform active:scale-90"
        >
          <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-slate-600 hover:text-[#10B981]")} />
        </button>
      </div>

      {/* Details (Middle) */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link href={detailUrl}>
                <h3 className="text-[18px] font-bold text-[#10B981] hover:text-[#059669] hover:underline transition-all truncate leading-tight">
                  {property.name}
                </h3>
              </Link>
              {property.stars && (
                <div className="flex">
                  {[...Array(property.stars)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-[#FEBA02] text-[#FEBA02]" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-[12px] mb-2 font-medium">
              <span className="text-[#10B981] font-bold underline cursor-pointer hover:text-emerald-700 transition-colors">Indiquer sur la carte</span>
              <span className="text-slate-500">{property.location}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500">Dest. Populaire</span>
            </div>
          </div>

          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-black text-slate-900 leading-none mb-1">{ratingText}</p>
              <p className="text-[11px] text-slate-500 italic">Excellent accueil</p>
            </div>
            <div className="bg-[#10B981] text-white font-black text-lg w-9 h-9 flex items-center justify-center rounded-sm rounded-bl-none shadow-sm">
              {property.rating.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-2 space-y-2">
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black text-[10px] py-0.5 px-2 uppercase">
            Offre StayFloow exclusive
          </Badge>
          
          <div className="border-l-4 border-emerald-100 pl-3 py-1">
            <p className="font-bold text-[13px] text-slate-800">Chambre confort</p>
            <p className="text-[12px] text-slate-500 font-medium">Petit-déjeuner local inclus</p>
          </div>

          <p className="text-[#059669] text-[12px] font-black flex items-center gap-1.5 uppercase tracking-tighter">
            <ChevronRight className="h-3 w-3" /> Aucun prépaiement — Payez sur place
          </p>
        </div>
      </div>

      {/* Pricing (Right) */}
      <div className="md:w-48 flex flex-col justify-end md:items-end text-right gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-none">Meilleur prix</p>
        <div>
          <p className="text-[24px] font-black text-[#10B981] leading-none tracking-tighter">{formatPrice(property.price)}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-bold">Taxes et frais compris</p>
        </div>
        <Link href={detailUrl} className="w-full">
          <Button className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-black h-10 rounded-md group/btn flex items-center justify-between px-4 transition-all active:scale-95 shadow-md shadow-emerald-100">
            Dispo
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
