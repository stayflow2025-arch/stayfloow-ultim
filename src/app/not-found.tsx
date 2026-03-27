
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MountainSnow, Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
        {/* Logo / Icon */}
        <div className="mx-auto bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 rotate-12">
          <MountainSnow className="h-12 w-12 text-primary" />
        </div>

        {/* Error Code */}
        <h1 className="text-9xl font-black text-slate-200 tracking-tighter relative">
          404
          <span className="absolute inset-0 flex items-center justify-center text-primary text-4xl font-black tracking-tight">
            OUPS !
          </span>
        </h1>

        {/* Message */}
        <div className="space-y-4 max-w-md mx-auto">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Page Introuvable
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed">
            Désolé, la destination que vous recherchez semble avoir disparu de notre radar. Peut-être un mirage dans le Sahara ?
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            variant="outline" 
            className="h-14 px-8 border-primary text-primary font-black rounded-xl hover:bg-primary/5 transition-all w-full sm:w-auto"
            onClick={() => typeof window !== 'undefined' && window.history.back()}
          >
            <ArrowLeft className="mr-2 h-5 w-5" /> Retour en arrière
          </Button>
          
          <Button 
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-xl shadow-primary/20 transition-all w-full sm:w-auto"
            asChild
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5" /> Accueil StayFloow
            </Link>
          </Button>
        </div>

        {/* Quick Search Tip */}
        <div className="pt-12">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Search className="h-3 w-3" /> Conseil : Utilisez la barre de recherche pour trouver votre hôtel
          </p>
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="fixed -bottom-20 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl -z-10" />
      <div className="fixed -top-20 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
    </div>
  );
}
