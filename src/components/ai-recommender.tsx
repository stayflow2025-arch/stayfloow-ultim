"use client";

import React, { useState, useTransition, useMemo } from "react";
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
import { Loader2, Sparkles, Send, BrainCircuit } from "lucide-react";
import { useCollection } from "@/firebase";
import { collection, query, where, limit } from "firebase/firestore";
import { getFirestore } from "@/firebase";

export function AiRecommender() {
  const [isPending, startTransition] = useTransition();
  const [recommendationToolEnabled, setRecommendationToolEnabled] = useState(true);
  const [userPreferences, setUserPreferences] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // Récupération du contexte réel du site pour l'IA
  const db = getFirestore();
  const listingsRef = collection(db, 'listings');
  const q = query(listingsRef, where('status', '==', 'approved'), limit(10));
  const { data: listings } = useCollection(q);

  const siteContext = useMemo(() => {
    if (!listings) return "Aucune donnée disponible pour le moment.";
    return listings.map(l => 
      `- ${l.details?.name} (${l.category}): ${l.details?.description}. Composition: ${l.details?.roomsCount} chambres, ${l.details?.bathroomsCount} SDB. Prix: ${l.price} DZD. Lieu: ${l.location?.address}`
    ).join('\n');
  }, [listings]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userPreferences.trim()) return;

    startTransition(async () => {
      try {
        const response = await tailorRecommendationsViaUI({
          userPreferences,
          recommendationToolEnabled,
          pastBookings: "Historique confidentiel StayFloow.",
          travelerProfiles: "Utilisateur actif sur la plateforme.",
          siteContext: siteContext,
        });

        if (!response || !response.response) {
          setResult("Désolé, nous n'avons pas pu générer de recommandations pour le moment.");
          return;
        }

        setResult(response.response);
      } catch (error) {
        console.error("AI Error:", error);
        setResult("Une erreur est survenue lors de la communication avec l'assistant StayFloow.");
      }
    });
  };

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white border-t-4 border-primary">
      <CardHeader className="bg-slate-900 text-white p-10 text-center relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="mx-auto bg-primary/20 p-4 rounded-3xl w-fit mb-4">
            <BrainCircuit className="h-10 w-10 text-secondary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight">
            Besoin d'aide pour choisir ?
          </CardTitle>
          <CardDescription className="text-white/60 font-medium max-w-lg mx-auto text-lg">
            Notre IA analyse nos meilleures offres en temps réel pour vous proposer le séjour idéal.
          </CardDescription>
        </div>
        {/* Décoration */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </CardHeader>

      <CardContent className="p-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="preferences" className="font-black text-slate-700 uppercase text-xs tracking-widest ml-2">
              Décrivez vos envies (ex: "Une villa pour 6 avec piscine à Alger")
            </Label>
            <Textarea
              id="preferences"
              placeholder="Je cherche un circuit dans le désert avec guide parlant français et un hébergement typique..."
              value={userPreferences}
              onChange={(e) => setUserPreferences(e.target.value)}
              className="min-h-[150px] rounded-3xl border-slate-200 focus:border-primary transition-all text-lg p-6 shadow-inner bg-slate-50/50"
            />
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="space-y-1">
              <Label htmlFor="ai-switch" className="font-bold text-slate-900">Analyse du catalogue en direct</Label>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-tighter">Compare les équipements et la composition des logements</p>
            </div>
            <Switch
              id="ai-switch"
              checked={recommendationToolEnabled}
              onCheckedChange={setRecommendationToolEnabled}
            />
          </div>

          <Button
            type="submit"
            disabled={isPending || !userPreferences.trim()}
            className="w-full h-20 bg-primary hover:bg-primary/90 text-white font-black text-2xl shadow-2xl shadow-primary/20 rounded-3xl transition-all active:scale-95"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-3 h-8 w-8 animate-spin" />
                Consultation des offres...
              </>
            ) : (
              <>
                Lancer l'Expert StayFloow <Send className="ml-3 h-6 w-6" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {result && (
        <CardFooter className="p-10 pt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-full p-8 bg-primary/5 border-2 border-primary/10 rounded-[2rem] space-y-6 relative">
            <div className="flex items-center gap-3 text-primary">
              <Sparkles className="h-6 w-6" />
              <h4 className="font-black text-xl">Recommandations de l'Expert</h4>
            </div>
            <div className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium text-lg border-l-4 border-primary/20 pl-6 py-2">
              {result}
            </div>
            <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                Source : Catalogue StayFloow Live
              </p>
              <Badge className="bg-secondary text-primary font-black">STAYFLOOW INTELLIGENCE</Badge>
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
