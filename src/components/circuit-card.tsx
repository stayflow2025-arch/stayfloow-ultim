"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Star, Clock, Zap } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Circuit = {
  id: string;
  title: string;
  location: string;
  images: string[];
  duration: string;
  pricePerPerson: number;
  rating: number;
};

export function CircuitCard({
  circuit,
  viewMode = "grid",
}: {
  circuit: Circuit;
  viewMode?: "grid" | "list";
}) {
  const { formatPrice } = useCurrency();

  if (!circuit) return null;

  const displayPrice = formatPrice(circuit.pricePerPerson);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row group/card rounded-3xl bg-white">
        <div className="relative w-full md:w-80 flex-shrink-0 h-64 md:h-auto overflow-hidden">
          <Image
            src={circuit.images[0]}
            alt={circuit.title}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">CIRCUIT CERTIFIÉ</span>
          </div>
        </div>

        <div className="flex flex-col flex-grow p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <MapPin className="h-4 w-4" /> {circuit.location}
              </div>
              <CardTitle className="text-2xl font-black text-slate-900 group-hover/card:text-primary transition-colors">
                {circuit.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-lg">
              <Star className="h-3.5 w-3.5 fill-primary" />
              <span className="font-black text-sm">{circuit.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="h-4 w-4 text-primary" /> {circuit.duration}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">À partir de</p>
              <p className="font-black text-3xl text-slate-900 tracking-tighter">{displayPrice}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20" asChild>
              <Link href={`/circuits/book?id=${circuit.id}`}>Réserver maintenant</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full border-slate-200 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group/card rounded-3xl bg-white">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={circuit.images[0]}
          alt={circuit.title}
          fill
          className="object-cover transition-transform duration-700 group-hover/card:scale-110"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">CERTIFIÉ</span>
        </div>
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {circuit.location}
            </p>
            <CardTitle className="text-xl font-black text-slate-900 group-hover/card:text-primary transition-colors leading-tight">
              {circuit.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-primary" />
            <span className="font-black text-sm">{circuit.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
            <Clock className="h-3.5 w-3.5 text-primary" /> {circuit.duration}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dès</p>
            <p className="font-black text-2xl text-slate-900 tracking-tighter">{displayPrice}</p>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-black h-10 rounded-xl" asChild>
            <Link href={`/circuits/book?id=${circuit.id}`}>Détails <Zap className="h-3 w-3 ml-1 fill-current" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
