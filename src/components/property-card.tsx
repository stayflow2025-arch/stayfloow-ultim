
"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Zap, Sparkles, AlertCircle, CalendarDays, MapPin, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

import type { Property } from "@/lib/data";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "./ui/badge";
import { useCurrency } from "@/context/currency-context";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { sendFavoriteReminderEmail } from "@/lib/mail";

type PropertyCardProps = {
  property: Property;
  isGenius?: boolean;
  viewMode?: "grid" | "list";
};

const getRatingColor = (rating: number) => {
  if (rating >= 8) return "bg-primary";
  if (rating >= 6) return "bg-amber-500";
  return "bg-slate-400";
};

export function PropertyCard({ property, isGenius = false, viewMode = "grid" }: PropertyCardProps) {
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const discountedPrice = property.price * 0.9;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      try {
        const favorites: string[] = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorited(favorites.includes(property.id));
      } catch {}
    }
  }, [property.id, isMounted]);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newState = !isFavorited;
    setIsFavorited(newState);

    try {
      const favorites: string[] = JSON.parse(localStorage.getItem("favorites") || "[]");

      if (newState) {
        localStorage.setItem("favorites", JSON.stringify([...new Set([...favorites, property.id])]));

        toast({
          title: "Ajouté aux favoris !",
          description: `${property.name} a été ajouté à votre liste.`,
        });

        await sendFavoriteReminderEmail({
          customerName: "Cher Voyageur",
          customerEmail: "stayflow2025@gmail.com",
          property,
        });
      } else {
        localStorage.setItem("favorites", JSON.stringify(favorites.filter((id) => id !== property.id)));

        toast({
          title: "Retiré des favoris",
          description: `${property.name} a été retiré de votre liste.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Could not access favorites in localStorage", error);
    }
  };

  /* ------------------------------------------------------------------
      LIST VIEW
  ------------------------------------------------------------------*/
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row group/card border-slate-200">
        <div className="relative w-full md:w-[350px] flex-shrink-0 h-64 md:h-auto group overflow-hidden">
          <Image
            src={property.images[0] || "https://picsum.photos/seed/stay/800/600"}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 350px"
          />

          <div className="absolute top-2 left-2 flex flex-col gap-2 z-10">
            {property.isBoosted && (
              <Badge className="bg-amber-400 text-amber-900 border-none shadow-lg">
                <Zap className="w-3 h-3 mr-1" /> Boosté
              </Badge>
            )}
          </div>

          {isMounted && (
            <Button
              onClick={handleFavoriteToggle}
              className="absolute top-2 right-2 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white transition z-10 shadow-lg border-none"
            >
              <Heart className={cn("h-5 w-5 transition-colors", isFavorited && "fill-red-500 text-red-500")} />
            </Button>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex-grow p-6 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-headline text-2xl font-black leading-tight tracking-tight">
                  <Link href={`/properties/${property.id}`} className="hover:text-primary transition-colors">
                    {property.name}
                  </Link>
                </h3>

                <div className="flex items-center gap-3 mt-2">
                  <div className="text-sm text-primary font-bold underline flex items-center gap-1 cursor-pointer">
                    <MapPin className="h-4 w-4" /> {property.location}
                  </div>

                  {property.stars && (
                    <div className="flex items-center gap-0.5">
                      {[...Array(property.stars)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-black text-sm text-slate-900">{property.rating >= 9 ? 'Exceptionnel' : 'Superbe'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{property.reviewsCount || 0} avis</p>
                </div>

                <div
                  className={cn(
                    "flex items-center justify-center h-10 w-10 text-white font-black rounded-xl text-sm shadow-lg",
                    getRatingColor(property.rating)
                  )}
                >
                  {property.rating.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {property.description}
              </p>

              <div className="flex flex-wrap gap-2">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="secondary" className="bg-slate-50 border-slate-100 text-slate-600 font-bold px-3 py-1">
                    {amenity}
                  </Badge>
                ))}
              </div>
              
              {property.isHighDemand && (
                <div className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 w-fit px-3 py-1 rounded-full border border-red-100">
                  <AlertCircle className="h-3.5 w-3.5" />
                  TRÈS DEMANDÉ SUR STAYFLOOW
                </div>
              )}
            </div>
          </div>

          <div className="p-6 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-slate-100 flex-shrink-0 w-full md:w-64 bg-slate-50/30">
            <div className="text-right w-full">
              {isGenius && (
                <p className="text-xl font-black text-red-600 flex items-center justify-end gap-2 mb-1">
                  <Sparkles className="h-4 w-4" />
                  {formatPrice(discountedPrice)}
                </p>
              )}

              <p className={cn("font-black text-3xl text-slate-900 tracking-tighter", isGenius && "text-base text-slate-400 line-through")}>
                {formatPrice(property.price)}
              </p>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">par nuit (TTC)</p>

              <Button asChild className="mt-6 w-full bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-xl shadow-xl shadow-primary/10">
                <Link href={`/properties/${property.id}`}>Voir l'offre <Zap className="ml-2 h-4 w-4 fill-current" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* ------------------------------------------------------------------
      GRID VIEW
  ------------------------------------------------------------------*/
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-slate-200 group/card rounded-3xl">
      <div className="relative group">
        <div className="relative h-56 w-full overflow-hidden">
          <Link href={`/properties/${property.id}`} className="block h-full w-full">
            <Image
              src={property.images[0] || "https://picsum.photos/seed/stay/800/600"}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-700 group-hover/card:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {property.isBoosted && (
            <Badge className="bg-amber-400 text-amber-900 shadow-xl border-none font-black px-3">
              <Zap className="w-3 h-3 mr-1 fill-current" /> Boosté
            </Badge>
          )}

          {property.isWeekendOffer && (
            <Badge className="bg-primary text-white shadow-xl border-none font-black px-3">
              <CalendarDays className="w-3 h-3 mr-1" /> Offre Weekend
            </Badge>
          )}
        </div>

        {isMounted && (
          <Button
            onClick={handleFavoriteToggle}
            className="absolute top-3 right-3 h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white transition z-10 shadow-xl border-none"
          >
            <Heart className={cn("h-5 w-5 transition-colors", isFavorited && "fill-red-500 text-red-500")} />
          </Button>
        )}
      </div>

      <CardContent className="p-6 flex-grow space-y-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-headline text-xl font-black text-slate-900 leading-tight tracking-tight group-hover/card:text-primary transition-colors">
            <Link href={`/properties/${property.id}`}>
              {property.name}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 flex-shrink-0 bg-primary/10 text-primary px-2 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-primary" />
            <span className="font-black text-sm">{property.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <MapPin className="h-3 w-3 mr-1 text-primary" /> {property.location}
        </div>

        {property.isHighDemand && (
          <div className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-md border border-red-100 w-fit">
            <AlertCircle className="h-3 w-3" />
            <span>TRÈS DEMANDÉ</span>
          </div>
        )}

        <div className="pt-2 flex flex-wrap gap-2">
          <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-2 py-0">{property.type}</Badge>
        </div>
      </CardContent>

      <CardContent className="p-6 pt-0 border-t border-slate-50 mt-auto">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Dès</p>
            <div className="flex items-baseline gap-1">
              <p className="font-black text-2xl text-slate-900 tracking-tighter">{formatPrice(property.price)}</p>
              <span className="text-[10px] font-bold text-slate-400">/ nuit</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="text-primary font-black gap-1 hover:bg-primary/5 p-0" asChild>
            <Link href={`/properties/${property.id}`}>Explorer <Zap className="h-3 w-3 fill-current" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
