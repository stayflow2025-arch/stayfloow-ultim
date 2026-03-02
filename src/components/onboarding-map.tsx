
"use client";

import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Loader2, MapPin } from "lucide-react";

/**
 * @fileOverview Composant de carte interactive pour l'onboarding partenaire.
 * Utilise l'API Nominatim d'OpenStreetMap pour convertir du texte en coordonnées géographiques
 * et afficher l'emplacement exact sur une carte dynamique.
 */
export function OnboardingMap({ location }: { location?: string }) {
  // Protection SSR : éviter un rendu différent entre serveur et client
  const [isClient, setIsClient] = useState(false);
  const [coords, setCoords] = useState({ lat: 36.775, lon: 3.058 }); // Alger par défaut
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // On ne lance la recherche que si l'adresse fait au moins 3 caractères
    if (!location || location.length < 3) return;

    // Debounce de 800ms pour éviter de surcharger l'API pendant la frappe
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Utilisation de l'API Nominatim d'OpenStreetMap pour le géocodage (Recherche par texte -> Coordonnées)
        // Cette API est gratuite et autonome, permettant de découvrir de nouvelles villes automatiquement.
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`
        );
        const data = await response.json();
        
        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        // On ne bloque pas l'UI en cas d'erreur de réseau, on log simplement
        console.warn("Recherche de localisation StayFloow différée ou indisponible.");
      } finally {
        setIsLoading(false);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [location]);

  if (!isClient) {
    return (
      <Card className="w-full aspect-video rounded-xl bg-slate-100 animate-pulse mt-4" />
    );
  }

  const { lat, lon } = coords;
  // Bounding box pour le zoom : +/- 0.01 degré autour du point pour une vue de quartier
  const zoom = 0.01; 
  const bbox = `${lon - zoom},${lat - zoom},${lon + zoom},${lat + zoom}`;
  // Génération de l'URL de l'iframe avec un marqueur sur le point trouvé
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className="relative mt-4 group">
      <Card className="w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative transition-all group-hover:shadow-primary/10">
        <iframe
          key={`${lat}-${lon}`} // Recrée l'iframe lors du changement de coordonnées pour forcer le rafraîchissement
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapSrc}
          className={cn(
            "transition-opacity duration-700",
            isLoading ? "opacity-40" : "opacity-100"
          )}
        ></iframe>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
            <div className="bg-white p-4 rounded-full shadow-2xl animate-in zoom-in-95">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        )}

        {!location && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 gap-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <MapPin className="h-10 w-10 text-primary/20" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Prêt pour la localisation
              </p>
              <p className="text-xs text-slate-300 font-medium">Saisissez une ville ou une adresse ci-dessus</p>
            </div>
          </div>
        )}
      </Card>
      
      {location && (
        <div className="mt-4 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localisation dynamique active</span>
          </div>
          <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
