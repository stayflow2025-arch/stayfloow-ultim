"use client";

import React, { useState, useTransition } from "react";
import type { Property } from "@/lib/data";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import {
  getPriceRecommendation,
  type PriceRecommendationOutput,
} from "@/ai/flows/price-recommendation-flow";

/* ------------------------------------------------------------------
   COMPOSANT PRINCIPAL
-------------------------------------------------------------------*/

export function PriceRecommender({ property }: { property: Property }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<PriceRecommendationOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecommendation = () => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await getPriceRecommendation({
          name: property.name,
          location: property.location,
          price: property.price,
          rating: property.rating,
          demandScore: Math.floor(Math.random() * 30) + 65, // Simulate market score
        });

        if (!response) {
          setError("Impossible d'obtenir une recommandation de prix.");
          return;
        }

        setResult(response);
      } catch (e) {
        console.error("DEBUG: Error during price recommendation:", e);
        setError("Une erreur est survenue lors de l'analyse.");
      }
    });
  };

  return (
    <Card className="bg-secondary/10 border-primary/20 shadow-xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-white border-b p-8">
        <CardTitle className="font-black text-2xl flex items-center gap-2 text-primary tracking-tight">
          <TrendingUp className="h-6 w-6" />
          Optimiseur de Revenus IA
        </CardTitle>
        <CardDescription className="font-medium text-slate-500">
          Analyse algorithmique du marché pour l'établissement "{property.name}".
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erreur d'analyse</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary/10 relative overflow-hidden">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Prix Recommandé StayFloow</p>
              <p className="text-5xl font-black text-primary tracking-tighter relative z-10">
                {result.recommendedPrice.toLocaleString('fr-DZ')} <span className="text-xl">DZD</span>
              </p>
              <div className="mt-4 relative z-10">
                <Badge variant="secondary" className="bg-primary text-white font-black px-3 py-1">
                  Indice de Confiance : {result.confidence}%
                </Badge>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <div className="h-1 w-4 bg-primary rounded-full" /> Justification IA
                </h4>
                <ul className="space-y-3">
                  {result.reasoning.map((r, i) => (
                    <li key={i} className="text-sm font-medium text-slate-600 flex items-start gap-2 leading-relaxed">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <div className="h-1 w-4 bg-secondary rounded-full" /> Signaux du Marché
                </h4>
                <ul className="space-y-3">
                  {result.marketFactors.map((f, i) => (
                    <li key={i} className="text-sm font-bold text-slate-700 flex items-start gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="h-1.5 w-1.5 bg-secondary rounded-full mt-1.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-white p-4 rounded-2xl w-fit mx-auto shadow-sm mb-4">
              <TrendingUp className="h-10 w-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold max-w-xs mx-auto text-sm">
              Prêt à optimiser vos tarifs ? Cliquez sur le bouton pour lancer l'analyse StayFloow Intelligence.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-100 p-8">
        <Button 
          onClick={handleRecommendation} 
          disabled={isPending}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyse des algorithmes en cours...
            </>
          ) : (
            "Obtenir une recommandation tarifaire"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
