
"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

export function PropertiesMap({ properties }: { properties: any[] }) {
  return (
    <div className="relative h-full w-full bg-slate-200 rounded-3xl overflow-hidden shadow-inner border border-slate-100 group">
      <Image 
        src="https://picsum.photos/seed/map-preview/1200/800" 
        alt="Map Preview" 
        fill 
        className="object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000" 
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 pointer-events-none" />
      
      {/* Simulation de marqueurs */}
      {properties.slice(0, 5).map((p, i) => (
        <div 
          key={p.id} 
          className="absolute z-10 flex flex-col items-center group/pin cursor-pointer"
          style={{ 
            top: `${20 + i * 15}%`, 
            left: `${30 + i * 10}%` 
          }}
        >
          <div className="bg-white px-2 py-1 rounded-lg shadow-xl font-black text-[10px] border-2 border-primary mb-1 scale-0 group-hover/pin:scale-100 transition-transform origin-bottom">
            {p.price.toLocaleString()} DZD
          </div>
          <MapPin className="h-8 w-8 text-primary fill-white drop-shadow-2xl animate-bounce" />
        </div>
      ))}

      <div className="absolute top-6 left-6 z-20">
        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 border border-slate-100">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Carte Interactive Activée</span>
        </div>
      </div>
    </div>
  );
}
