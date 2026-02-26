"use client";

import React, { useState, useTransition } from "react";
import { tailorRecommendationsViaUI } from "@/ai/flows/user-recommendation-flow";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Sparkles, Send } from "lucide-react";

export function AiRecommender() {
  const [isPending, startTransition] = useTransition();
  const [recommendationToolEnabled, setRecommendationToolEnabled] = useState(true);
  const [userPreferences, setUserPreferences] = useState(
    "Un endroit calme avec une belle vue, proche des restaurants et facile d'accès."
  );
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    startTransition(async () => {
      try {
        const response = await tailorRecommendationsViaUI({
          userPreferences,
          recommendationToolEnabled,
          pastBookings: "A séjourné dans un riad traditionnel à Fès l'année dernière.",
          travelerProfiles: "Voyageur en couple, amateur de culture et de gastronomie locale.",
        });

        if (!response || !response.accommodations) {
          setResult("Désolé, nous n'avons pas pu générer de recommandations pour le moment.");
          return;
        }

        setResult(response.accommodations);
      } catch (error) {
        console.error("AI Error:", error);
        setResult("Une erreur est survenue lors de la communication avec l'assistant StayFloow.");
      }
    });
  };

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 text-white p-8 text-center relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="mx-auto bg-primary/20 p-3 rounded-2xl w-fit mb-4">
            <Sparkles className="h-8 w-8 text-secondary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tight">
            Assistant Voyage IA
          </CardTitle>
          <CardDescription className="text-white/60 font-medium max-w-md mx-auto">
            Décrivez votre séjour idéal et laissez notre intelligence artificielle concocter une sélection sur-mesure pour vous.
          </CardDescription>
        </div>
        {/* Décoration */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="preferences" className="font-black text-slate-700 uppercase text-xs tracking-widest">
              Quelles sont vos envies ?
            </Label>
            <Textarea
              id="preferences"
              placeholder="Ex: Je cherche une villa avec piscine privée à Ghardaïa pour un séjour en famille..."
              value={userPreferences}
              onChange={(e) => setUserPreferences(e.target.value)}
              className="min-h-[120px] rounded-2xl border-slate-200 focus:border-primary transition-all text-lg p-5"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="space-y-0.5">
              <Label htmlFor="ai-switch" className="font-bold text-slate-900">Activer l'analyse avancée</Label>
              <p className="text-xs text-slate-500">Utilise votre historique pour des suggestions plus précises.</p>
            </div>
            <Switch
              id="ai-switch"
              checked={recommendationToolEnabled}
              onCheckedChange={setRecommendationToolEnabled}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Analyse algorithmique...
              </>
            ) : (
              <>
                Découvrir mes recommandations <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {result && (
        <CardFooter className="p-8 pt-0 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full p-6 bg-primary/5 border-2 border-primary/10 rounded-3xl space-y-4">
            <h4 className="font-black text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Nos Suggestions StayFloow
            </h4>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium italic">
              {result}
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase text-center pt-4 border-t border-primary/10">
              Généré en temps réel par le moteur IA de StayFloow.com
            </p>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
