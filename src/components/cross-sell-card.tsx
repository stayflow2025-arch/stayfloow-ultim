
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  Compass,
  BedDouble,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BookedItemType = "property" | "car" | "circuit";

export function CrossSellCard({
  location,
  bookedItemType,
}: {
  location: string;
  bookedItemType?: BookedItemType;
}) {
  const [circuitDates, setCircuitDates] = useState<DateRange | undefined>();
  const [participants, setParticipants] = useState(2);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);

  useEffect(() => {
    if (circuitDates?.from && circuitDates.to) {
      setIsDatePopoverOpen(false);
    }
  }, [circuitDates]);

  const suggestions = [
    {
      type: "property" as const,
      title: `Trouver un hébergement`,
      description: `Découvrez les meilleurs hôtels, appartements et villas à ${location} pour vous reposer après vos aventures.`,
      href: `/search?dest=${encodeURIComponent(location)}`,
      image: "https://picsum.photos/seed/cross-sell-property/800/600",
      imageHint: "hotel room interior",
      icon: BedDouble,
    },
    {
      type: "car" as const,
      title: "Louer une voiture",
      description: `Déplacez-vous en toute liberté et découvrez ${location} et ses alentours à votre propre rythme avec StayFloow.`,
      href: "/cars",
      image: "https://picsum.photos/seed/cross-sell-car/800/600",
      imageHint: "car driving scenic road",
      icon: Car,
    },
    {
      type: "circuit" as const,
      title: "Réserver un circuit ou une activité",
      description:
        "Laissez-vous guider par des experts locaux certifiés StayFloow pour une expérience immersive inoubliable.",
      href: "/circuits",
      image: "https://picsum.photos/seed/cross-sell-tour/800/600",
      imageHint: "group hiking landscape",
      icon: Compass,
    },
  ];

  const filteredSuggestions = suggestions.filter(
    (s) => s.type !== bookedItemType
  );

  const getCircuitLink = () => {
    const params = new URLSearchParams();
    params.set("dest", location);
    if (circuitDates?.from) params.set("from", circuitDates.from.toISOString());
    if (circuitDates?.to) params.set("to", circuitDates.to.toISOString());
    if (participants > 0) params.set("participants", String(participants));
    return `/circuits/results?${params.toString()}`;
  };

  return (
    <div className="space-y-10 mt-16 text-center border-t border-slate-100 pt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="space-y-3">
        <h2 className="font-headline text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Complétez Votre Séjour à {location}
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">
          Maintenant que votre réservation est confirmée, optimisez votre voyage avec nos offres exclusives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
        {filteredSuggestions.map((suggestion) => {
          const Icon = suggestion.icon;

          return (
            <Card
              key={suggestion.type}
              className="overflow-hidden group text-left border-none shadow-2xl rounded-[2.5rem] bg-white transition-all hover:shadow-primary/5"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={suggestion.image}
                  alt={suggestion.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  data-ai-hint={suggestion.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-8 flex items-center gap-4 text-white">
                   <div className="bg-primary p-3 rounded-2xl shadow-xl">
                      <Icon className="h-7 w-7 text-white" />
                   </div>
                   <h3 className="font-headline text-2xl font-black tracking-tight leading-tight">
                    {suggestion.title}
                  </h3>
                </div>
              </div>

              <CardContent className="p-8 md:p-10 space-y-8">
                <p className="text-slate-500 text-base leading-relaxed font-medium">
                  {suggestion.description}
                </p>

                {suggestion.type === "circuit" ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Dates */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dates souhaitées</Label>
                        <Popover
                          open={isDatePopoverOpen}
                          onOpenChange={setIsDatePopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-14 justify-start text-left font-bold border-slate-100 bg-slate-50 rounded-2xl transition-all hover:bg-white hover:border-primary",
                                !circuitDates && "text-slate-400"
                              )}
                            >
                              <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                              {circuitDates?.from ? (
                                circuitDates.to ? (
                                  <>
                                    {format(circuitDates.from, "dd MMM", {
                                      locale: fr,
                                    })}{" "}
                                    -{" "}
                                    {format(circuitDates.to, "dd MMM", {
                                      locale: fr,
                                    })}
                                  </>
                                ) : (
                                  format(circuitDates.from, "dd MMM", {
                                    locale: fr,
                                  })
                                )
                              ) : (
                                <span>Choisir dates</span>
                              )}
                            </Button>
                          </PopoverTrigger>

                          <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-2xl bg-white" align="start">
                            <Calendar
                              mode="range"
                              selected={circuitDates}
                              onSelect={setCircuitDates}
                              initialFocus
                              locale={fr}
                              disabled={{ before: new Date() }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Participants */}
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de voyageurs</Label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                          <Input
                            type="number"
                            value={participants}
                            onChange={(e) =>
                              setParticipants(Math.max(1, Number(e.target.value)))
                            }
                            min={1}
                            className="pl-12 h-14 border-slate-100 bg-slate-50 rounded-2xl font-black text-lg focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" asChild>
                      <Link href={getCircuitLink()} className="flex items-center justify-center gap-3">
                        Voir les disponibilités <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95" asChild>
                    <Link href={suggestion.href} className="flex items-center justify-center gap-3">
                      Explorer les offres <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
