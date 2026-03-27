"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { circuitThemes } from "@/lib/data";
import { useCurrency } from "@/context/currency-context";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function CircuitFilterSidebar({ resultCount }: { resultCount: number }) {
  const { formatPrice, convertFromDZD, currency } = useCurrency();

  const maxPriceDZD = 300000;
  const maxPriceConverted =
    Math.ceil(convertFromDZD(maxPriceDZD)) || maxPriceDZD;

  const [priceRange, setPriceRange] = useState([
    convertFromDZD(20000) || 20000,
    convertFromDZD(150000) || 150000,
  ]);

  return (
    <Card className="sticky top-24 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="p-6 bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-800">Filtres Circuits</CardTitle>
      </CardHeader>

      <CardContent className="p-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <Accordion type="multiple" className="w-full">

          {/* Budget */}
          <AccordionItem value="budget" className="border-slate-100">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Budget (par personne)
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-6">
              <Slider
                value={priceRange}
                max={maxPriceConverted}
                step={currency === "DZD" ? 1000 : 10}
                onValueChange={setPriceRange}
                className="mt-4"
              />

              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-black text-primary text-xs">{formatPrice(priceRange[0])}</span>
                <span className="font-black text-primary text-xs">{formatPrice(priceRange[1])}</span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Thèmes */}
          <AccordionItem value="themes" className="border-none">
            <AccordionTrigger className="px-6 py-4 font-bold text-sm hover:no-underline hover:bg-slate-50">
              Thèmes du circuit
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6 pt-2 space-y-3">
              {circuitThemes.map((item) => (
                <div key={item} className="flex items-center space-x-3 group cursor-pointer">
                  <Checkbox id={`theme-${item}`} className="h-5 w-5 rounded-md border-slate-300" />
                  <Label htmlFor={`theme-${item}`} className="font-bold text-slate-600 text-sm group-hover:text-primary transition-colors cursor-pointer">
                    {item}
                  </Label>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>

        </Accordion>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg">
            Afficher les {resultCount || 0} circuits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
