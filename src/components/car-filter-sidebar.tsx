"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { carFeatures, carTypes, fuelTypes } from "@/lib/data";
import { useCurrency } from "@/context/currency-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function CarFilterSidebar({ resultCount }: { resultCount: number }) {
  const { formatPrice, convertFromDZD, currency } = useCurrency();

  const maxPriceDZD = 20000;
  const maxPriceConverted = Math.ceil(convertFromDZD(maxPriceDZD)) || maxPriceDZD;

  const [priceRange, setPriceRange] = useState([
    convertFromDZD(2000) || 2000,
    convertFromDZD(15000) || 15000,
  ]);

  return (
    <Card className="sticky top-24 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-800">Filtres de recherche</CardTitle>
      </CardHeader>

      <CardContent className="p-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Accordion type="multiple" className="w-full">
          
          {/* Budget */}
          <AccordionItem value="budget" className="border-slate-100">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Budget (par jour)
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
              <Slider
                value={priceRange}
                max={maxPriceConverted}
                step={currency === "DZD" ? 500 : 5}
                onValueChange={setPriceRange}
                className="mt-4"
              />

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-black text-primary text-xs">{formatPrice(priceRange[0])}</span>
                <span className="font-black text-primary text-xs">{formatPrice(priceRange[1])}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Type de véhicule */}
          <AccordionItem value="type" className="border-slate-100">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Type de véhicule
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
              {carTypes.map((item) => (
                <div key={item} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`type-${item}`} className="h-5 w-5 rounded-md border-slate-300" />
                  <Label htmlFor={`type-${item}`} className="font-bold text-slate-600 text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Transmission */}
          <AccordionItem value="transmission" className="border-slate-100">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Boîte de vitesses
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
              {["Manuelle", "Automatique"].map((item) => (
                <div key={item} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`trans-${item}`} className="h-5 w-5 rounded-md border-slate-300" />
                  <Label htmlFor={`trans-${item}`} className="font-bold text-slate-600 text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Carburant */}
          <AccordionItem value="fuel" className="border-slate-100">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Type de carburant
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
              {fuelTypes.map((item) => (
                <div key={item} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`fuel-${item}`} className="h-5 w-5 rounded-md border-slate-300" />
                  <Label htmlFor={`fuel-${item}`} className="font-bold text-slate-600 text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

          {/* Équipements */}
          <AccordionItem value="features" className="border-none">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Équipements
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
              {carFeatures.map((item) => (
                <div key={item} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`feat-${item}`} className="h-5 w-5 rounded-md border-slate-300" />
                  <Label htmlFor={`feat-${item}`} className="font-bold text-slate-600 text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg">
            Voir les {resultCount || 0} véhicules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
