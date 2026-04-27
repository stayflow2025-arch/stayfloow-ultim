"use client";

import React, { useEffect, useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2, MapPin, ExternalLink } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MapItem {
  id: string;
  name?: string;
  title?: string;
  location: string;
  price?: number;
  pricePerPerson?: number;
  photos?: string[];
  category?: string;
}

/**
 * @fileOverview Composant de carte dynamique utilisant Leaflet (chargé via CDN).
 * Permet d'afficher plusieurs marqueurs interactifs et sélectionnables.
 */
export function DynamicMap({ items = [] }: { items: MapItem[] }) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [isLoaded, setIsLoaded] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedItem, setSelectedItem] = useState<MapItem | null>(null);

  useEffect(() => {
    // 1. Charger Leaflet via CDN
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      setIsLoaded(true);
    };

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !items.length) return;

    const L = (window as any).L;
    if (!L) return;

    // Initialiser la carte centrée sur l'Algérie/Égypte par défaut
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([28.0339, 1.6596], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    } else {
      // Nettoyer les anciens marqueurs si nécessaire
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) mapInstanceRef.current.removeLayer(layer);
      });
    }

    const markers: any[] = [];
    const geocodeItems = async () => {
      for (const item of items) {
        try {
          const locationStr = item.location;
          // Utilisation de Nominatim pour géocoder chaque item (limité pour démo)
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationStr)}&limit=1`);
          const data = await resp.json();
          
          if (data && data[0]) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            
            const marker = L.marker([lat, lon]).addTo(mapInstanceRef.current);
            
            marker.on('click', () => {
              setSelectedItem(item);
              mapInstanceRef.current.setView([lat, lon], 12);
            });
            
            markers.push([lat, lon]);
          }
        } catch (e) {
          console.warn("Geocoding failed for:", item.location);
        }
      }

      if (markers.length > 0) {
        mapInstanceRef.current.fitBounds(L.latLngBounds(markers), { padding: [50, 50] });
      }
    };

    geocodeItems();

  }, [isLoaded, items]);

  return (
    <Card className="w-full h-full relative overflow-hidden rounded-[2rem] border-none shadow-2xl bg-slate-50 flex flex-col">
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initialisation de la carte dynamique...</p>
        </div>
      )}
      
      <div ref={mapContainerRef} className="flex-1 w-full h-full z-10" />

      {/* Panel de sélection dynamique */}
      {selectedItem && (
        <div className="absolute bottom-6 left-6 right-6 z-20 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-white flex items-center gap-4">
            <div className="relative h-20 w-24 rounded-2xl overflow-hidden shrink-0 shadow-lg">
              <Image 
                src={selectedItem.photos?.[0] || "https://placehold.co/400x300?text=StayFloow"} 
                alt="Selected" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-black text-slate-900 truncate">{selectedItem.name || selectedItem.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{selectedItem.location}</p>
              <p className="text-primary font-black mt-1">
                {formatPrice(selectedItem.price || selectedItem.pricePerPerson || 0)}
              </p>
            </div>
            <div className="flex flex-col gap-2">
               <Button 
                size="sm" 
                className="rounded-xl font-black text-[10px] uppercase bg-primary"
                onClick={() => {
                   const path = selectedItem.category === 'circuit' ? `/circuits/${selectedItem.id}` : `/properties/${selectedItem.id}`;
                   router.push(path);
                }}
               >
                 <ExternalLink className="h-3 w-3 mr-1" /> Détails
               </Button>
               <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-xl font-black text-[10px] uppercase text-slate-400"
                onClick={() => setSelectedItem(null)}
               >
                 Fermer
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* Badge indicateur */}
      {!selectedItem && (
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl border border-white flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Carte Temps Réel Active</span>
          </div>
        </div>
      )}
    </Card>
  );
}
