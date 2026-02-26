"use client";

import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  Search, 
  Wand2, 
  Lightbulb, 
  FileText, 
  Key, 
  Dot,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SeoOptimizerPage() {
  const [isPending, setIsPending] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [pageType, setPageType] = useState('homepage');
  const [countryFocus, setCountryFocus] = useState('Both');
  const [entityName, setEntityName] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      // Simulation d'un traitement IA pour l'optimisation SEO
      setTimeout(() => {
        setResult({
          title: "Séjour de Luxe | " + entityName + " | StayFloow.com",
          description: "Découvrez nos hébergements d'exception sur StayFloow.com. Réservez votre séjour inoubliable dès maintenant au meilleur prix.",
          keywords: ["location", "vacances", "luxe", entityName, "Afrique", "StayFloow"]
        });
        setIsPending(false);
      }, 1500);
    } catch (err) {
      setError("Une erreur est survenue lors de la génération des méta-données.");
      setIsPending(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Optimiseur SEO StayFloow<span className="text-secondary">.com</span></h1>
        <p className="text-muted-foreground font-medium">
          Générez des méta-données optimisées pour vos pages grâce à l'intelligence artificielle.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulaire de Configuration */}
        <Card className="border-slate-200 shadow-xl">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="flex items-center gap-2 text-primary">
              <Wand2 className="h-5 w-5" />
              Configuration SEO
            </CardTitle>
            <CardDescription>
              Remplissez les informations pour obtenir des suggestions de balises Title et Meta Description.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label htmlFor="entity" className="font-bold">Nom de l'établissement / Page</Label>
                <Input 
                  id="entity" 
                  placeholder="ex: Riad Dar Al-Andalus" 
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Type de page</Label>
                <Select value={pageType} onValueChange={setPageType}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">Page d'accueil</SelectItem>
                    <SelectItem value="property">Fiche propriété</SelectItem>
                    <SelectItem value="blog">Article de blog</SelectItem>
                    <SelectItem value="car">Location de voiture</SelectItem>
                    <SelectItem value="circuit">Circuit Touristique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-bold">Cible géographique</Label>
                <Select value={countryFocus} onValueChange={setCountryFocus}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DZ">Algérie</SelectItem>
                    <SelectItem value="MA">Maroc</SelectItem>
                    <SelectItem value="EG">Égypte</SelectItem>
                    <SelectItem value="EN">International (Anglais)</SelectItem>
                    <SelectItem value="Both">Multilingue (FR/AR/EN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t pt-6">
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyse IA en cours...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Générer les suggestions SEO
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Résultats et Aperçu */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive" className="animate-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result ? (
            <Card className="border-primary/20 bg-primary/5 shadow-2xl animate-in zoom-in-95 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-black">
                  <CheckCircle2 className="h-6 w-6" />
                  Suggestions SEO IA
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="p-5 bg-white border-2 border-slate-100 rounded-xl shadow-inner">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Dot className="text-primary h-6 w-6 -ml-2" /> Aperçu Google
                  </p>
                  <h3 className="text-[#1a0dab] text-xl hover:underline cursor-pointer font-medium mb-1 line-clamp-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-[#006621] mb-1 truncate">
                    https://stayfloow.com/{entityName.toLowerCase().replace(/\s+/g, '-')}
                  </p>
                  <p className="text-sm text-[#4d5156] line-clamp-2 leading-relaxed">
                    {result.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-slate-700 font-bold">
                    <Key className="h-4 w-4 text-primary" /> Mots-clés stratégiques
                  </Label>

                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw: string, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-white border-primary/20 text-primary font-bold px-3 py-1">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Alert className="bg-secondary/10 border-secondary/20">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs text-slate-600 font-medium">
                    Astuce : Intégrez ces mots-clés naturellement dans le premier paragraphe de votre description pour un meilleur référencement sur StayFloow.com.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-300">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                <Lightbulb className="h-16 w-16 opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-slate-400 mb-2">Prêt à optimiser ?</h3>
              <p className="max-w-xs mx-auto">Configurez les informations à gauche et lancez l'analyse pour voir vos recommandations SEO StayFloow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
