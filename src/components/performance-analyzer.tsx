"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lightbulb, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------
   TYPE LOCAL — Structure des résultats de l'IA
-------------------------------------------------------------------*/
export type SitePerformanceOutput = {
  performanceSummary: string;
  keyObservations: string[];
  actionableRecommendations: {
    recommendation: string;
    priority: "Haute" | "Moyenne" | "Basse";
  }[];
};

/* ------------------------------------------------------------------
   MOCK IA FALLBACK — Simulation d'analyse IA pour StayFloow.com
-------------------------------------------------------------------*/
async function analyzeSitePerformance(): Promise<SitePerformanceOutput> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        performanceSummary:
          "Votre site StayFloow fonctionne correctement, mais plusieurs optimisations ciblées sur l'Afrique du Nord peuvent booster votre conversion.",
        keyObservations: [
          "Temps de chargement légèrement élevé sur les réseaux 3G/4G mobiles.",
          "Forte demande pour les riads à Fès non couverte par l'offre actuelle.",
          "Besoin croissant de filtres pour les paiements locaux (CCP/Baridimob).",
        ],
        actionableRecommendations: [
          {
            recommendation:
              "Optimiser les images de la page d'accueil pour réduire le poids de 40% sur mobile.",
            priority: "Haute",
          },
          {
            recommendation:
              "Ajouter un badge 'Réservation instantanée' pour rassurer les clients pressés.",
            priority: "Moyenne",
          },
          {
            recommendation:
              "Lancer une campagne partenaire à Timimoun pour la saison hivernale.",
            priority: "Basse",
          },
        ],
      });
    }, 1500)
  );
}

/* ------------------------------------------------------------------
   COMPOSANT PRINCIPAL
-------------------------------------------------------------------*/
export function PerformanceAnalyzer() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<SitePerformanceOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = () => {
    setError(null);
    setResult(null);

    startTransition(async () => {
      try {
        const response = await analyzeSitePerformance();
        if (!response) {
          setError("Impossible d'obtenir les résultats de l'analyse.");
          return;
        }
        setResult(response);
      } catch (e) {
        setError("Une erreur est survenue lors de l'analyse des données.");
      }
    });
  };

  const getPriorityBadgeClass = (priority: "Haute" | "Moyenne" | "Basse") => {
    switch (priority) {
      case "Haute":
        return "bg-red-600 text-white hover:bg-red-700";
      case "Moyenne":
        return "bg-amber-500 text-white hover:bg-amber-600";
      case "Basse":
        return "bg-emerald-600 text-white hover:bg-emerald-700";
      default:
        return "bg-slate-300 text-black";
    }
  };

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-primary text-white p-8">
        <div className="flex items-center gap-4">
          <div className="bg-secondary/20 p-3 rounded-2xl">
            <Lightbulb className="h-8 w-8 text-secondary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black uppercase tracking-tight">
              Analyse Performance IA
            </CardTitle>
            <CardDescription className="text-white/70 font-medium">
              Intelligence artificielle StayFloow au service de votre croissance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {error && (
          <Alert variant="destructive" className="mb-6 animate-in slide-in-from-top-2">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur d'analyse</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result ? (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-4">
              <TrendingUp className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h4 className="font-black text-slate-900 mb-1">Résumé Stratégique</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {result.performanceSummary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Observations Clés</h4>
                <ul className="space-y-3">
                  {result.keyObservations.map((obs, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-1.5 shrink-0" />
                      {obs}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Actions Prioritaires</h4>
                <div className="space-y-3">
                  {result.actionableRecommendations.map((rec, i) => (
                    <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start justify-between gap-4 group hover:border-primary/20 transition-all">
                      <p className="text-xs font-bold text-slate-600 leading-snug">{rec.recommendation}</p>
                      <Badge className={cn("text-[9px] font-black uppercase tracking-tighter px-2", getPriorityBadgeClass(rec.priority))}>
                        {rec.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 space-y-6">
            <div className="bg-slate-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
              <Lightbulb className="h-12 w-12 text-slate-200" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-400">Prêt pour l'analyse ?</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">Lancez l'IA pour obtenir des recommandations personnalisées sur vos ventes StayFloow.</p>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-slate-50 border-t border-slate-100 p-8">
        <Button 
          onClick={handleAnalysis} 
          disabled={isPending}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Calcul des algorithmes...
            </>
          ) : (
            "Lancer l'Analyse IA du Site"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
