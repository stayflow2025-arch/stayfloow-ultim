"use client";

import React from "react";
import Image from "next/image";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Star, Users, Fuel, Gauge, Zap } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type Car = {
  id: string;
  name: string;
  brand: string;
  image: string;
  pricePerDay: number;
  rating: number;
  transmission: string;
  fuel: string;
  seats: number;
  category: string;
  isBoosted?: boolean;
};

export function CarCard({
  car,
  viewMode = "grid",
}: {
  car: Car;
  viewMode?: "grid" | "list";
}) {
  const { formatPrice } = useCurrency();

  if (!car) return null;

  const displayPrice = formatPrice(car.pricePerDay);

  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden border-slate-200 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col md:flex-row group/card rounded-3xl">
        <div className="relative w-full md:w-72 flex-shrink-0 h-52 md:h-auto overflow-hidden">
          <Image
            src={car.image}
            alt={`${car.brand} ${car.name}`}
            fill
            className="object-cover transition-transform duration-700 group-hover/card:scale-110"
          />
          {car.isBoosted && (
            <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" /> BOOSTÉ
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{car.category}</div>
              <CardTitle className="text-2xl font-black text-slate-900 group-hover/card:text-primary transition-colors">
                {car.brand} {car.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 rounded-lg">
              <Star className="h-3.5 w-3.5 fill-primary" />
              <span className="font-black text-sm">{car.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Users className="h-4 w-4 text-primary" /> {car.seats} Places
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Gauge className="h-4 w-4 text-primary" /> {car.transmission}
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Fuel className="h-4 w-4 text-primary" /> {car.fuel}
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix par jour</p>
              <p className="font-black text-3xl text-slate-900 tracking-tighter">{displayPrice}</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20" asChild>
              <Link href="/cars/book">Louer maintenant</Link>
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full border-slate-200 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group/card rounded-3xl">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={car.image}
          alt={`${car.brand} ${car.name}`}
          fill
          className="object-cover transition-transform duration-700 group-hover/card:scale-110"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="bg-primary text-white text-[10px] font-black px-2 py-1 rounded shadow-lg">{car.category}</div>
          {car.isBoosted && (
            <div className="bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-1 rounded shadow-lg flex items-center gap-1">
              <Zap className="h-3 w-3 fill-current" /> BOOSTÉ
            </div>
          )}
        </div>
      </div>

      <CardContent className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <CardTitle className="text-xl font-black text-slate-900 group-hover/card:text-primary transition-colors leading-tight">
            {car.brand} {car.name}
          </CardTitle>
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg flex-shrink-0">
            <Star className="h-3.5 w-3.5 fill-primary" />
            <span className="font-black text-sm">{car.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
            <Users className="h-3.5 w-3.5 text-primary" /> {car.seats} Places
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
            <Fuel className="h-3.5 w-3.5 text-primary" /> {car.fuel}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-end">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dès</p>
            <p className="font-black text-2xl text-slate-900 tracking-tighter">{displayPrice}</p>
          </div>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-black h-10 rounded-xl" asChild>
            <Link href="/cars/book">Louer</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
