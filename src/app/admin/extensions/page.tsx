"use client";

import React, { useMemo, useEffect, useState } from "react";
import { useFirestore, useUser } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { 
  Puzzle, ArrowLeft, Loader2, Download, CheckCircle2, 
  Settings2, Plus, Zap, ShieldCheck, Mail, Wallet, BrainCircuit,
  Save, X, Globe, Smartphone, Bell, CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "@/lib/admin-config";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const EXTENSIONS = [
  {
    id: "stripe-payments",
    name: "Stripe Connect",
    description: "Système de paiement sécurisé pour les frais de service (14%) et règlements partenaires.",
    icon: <CreditCard className="h-6 w-6 text-blue-500" />,
    status: "installed",
    category: "Paiements"
  },
  {
    id: "trigger-email",
    name: "Trigger Email",
    description: "Envoi automatique des confirmations de réservation et emails de bienvenue via SMTP Gmail.",
    icon: <Mail className="h-6 w-6 text-amber-500" />,
    status: "installed",
    category: "Communication"
  },
  {
    id: "genkit-ai",
    name: "Genkit AI Expert",
    description: "Intelligence artificielle pour l'assistance client, les recommandations et l'optimisation des prix.",
    icon: <BrainCircuit className="h-6 w-6 text-primary" />,
    status: "installed",
    category: "Intelligence"
  },
  {
    id: "google-maps",
    name: "Maps Autocomplete",
    description: "Intégration OpenStreetMap pour la recherche de destination et localisation précise des biens.",
    icon: <Zap className="h-6 w-6 text-emerald-500" />,
    status: "installed",
    category: "Navigation"
  },
  {
    id: "whatsapp-direct",
    name: "WhatsApp API",
    description: "Permet aux clients de contacter directement les partenaires via WhatsApp Business.",
    icon: <Plus className="h-6 w-6 text-green-500" />,
    status: "available",
    category: "Social"
  },
  {
    id: "multi-currency",
    name: "Convertisseur de Devises",
    description: "Mise à jour en temps réel des taux de change (DZD, EUR, USD, EGP).",
    icon: <Wallet className="h-6 w-6 text-slate-400" />,
    status: "installed",
    category: "Outils"
  }
];

export default function AdminExtensionsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [installing, setInstalling] = useState<string | null>(null);
  const [selectedExt, setSelectedExt] = useState<any | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isUserLoading, isAdmin, router]);

  const handleInstall = (id: string) => {
    setInstalling(id);
    setTimeout(() => {
      setInstalling(null);
      toast({
        title: "Extension installée",
        description: "Le module est désormais actif sur votre plateforme StayFloow."
      });
    }, 1500);
  };

  const openConfig = (ext: any) => {
    if (ext.id === 'stripe-payments') {
      router.push('/admin/stripe');
      return;
    }
    setSelectedExt(ext);
    setIsConfigOpen(true);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    // Simuler sauvegarde Firestore
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsConfigOpen(false);
    toast({
      title: "Configuration enregistrée",
      description: `Les paramètres de ${selectedExt.name} ont été mis à jour.`
    });
  };

  if (isUserLoading || !user || !isAdmin) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-slate-800 text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">StayFloow App Marketplace</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gérer les extensions et services tiers</p>
            </div>
          </div>
          <Button variant="outline" className="text-white border-white/20 font-black h-12 px-6 rounded-xl hover:bg-white/10">
            <Download className="mr-2 h-4 w-4" /> Mettre à jour tout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">
        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-dashed border-primary/20 flex flex-col md:flex-row items-center gap-8">
          <div className="bg-primary p-6 rounded-[2rem] shadow-xl text-white">
            <Puzzle className="h-12 w-12" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-slate-900">Étendez les capacités de StayFloow</h2>
            <p className="text-slate-500 font-medium max-w-2xl">Téléchargez et installez des applications directement sur votre plateforme pour améliorer l'expérience utilisateur.</p>
          </div>
          <Button className="bg-slate-900 text-white font-black h-14 px-8 rounded-2xl shadow-xl hover:bg-slate-800">
            Scanner les mises à jour
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {EXTENSIONS.map((ext) => (
            <Card key={ext.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all group">
              <CardHeader className="bg-slate-50/50 p-8 border-b pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    {ext.icon}
                  </div>
                  <Badge className={cn(
                    "font-black text-[9px] uppercase",
                    ext.status === 'installed' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  )}>
                    {ext.status === 'installed' ? 'Installé' : 'Disponible'}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-black text-slate-900">{ext.name}</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest">{ext.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col justify-between h-[200px]">
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{ext.description}</p>
                <div className="pt-6 flex gap-3">
                  {ext.status === 'installed' ? (
                    <Button 
                      onClick={() => openConfig(ext)}
                      variant="outline" 
                      className="flex-1 rounded-xl font-black text-xs border-slate-100 bg-slate-50"
                    >
                      <Settings2 className="mr-2 h-4 w-4" /> Configurer
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleInstall(ext.id)}
                      disabled={installing === ext.id}
                      className="flex-1 bg-primary text-white font-black rounded-xl"
                    >
                      {installing === ext.id ? <Loader2 className="animate-spin" /> : <><Plus className="mr-2 h-4 w-4" /> Installer</>}
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300">
                    <ShieldCheck className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* MODAL DE CONFIGURATION DYNAMIQUE */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                {selectedExt?.icon}
              </div>
              <Badge className="bg-primary text-white font-black text-[10px]">VERSION 2.4.0</Badge>
            </div>
            <DialogTitle className="text-2xl font-black">{selectedExt?.name}</DialogTitle>
            <DialogDescription className="text-white/60 font-medium">Paramètres avancés du module {selectedExt?.category}.</DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            {selectedExt?.id === 'trigger-email' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Hôte SMTP (Gmail recommandé)</Label>
                  <Input placeholder="smtp.gmail.com" defaultValue="smtp.gmail.com" className="h-12 bg-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Port</Label>
                    <Input defaultValue="465" className="h-12 bg-slate-50" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold">Sécurité</Label>
                    <Input defaultValue="SSL" className="h-12 bg-slate-50" />
                  </div>
                </div>
              </div>
            )}

            {selectedExt?.id === 'genkit-ai' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold">Modèle de langage (LLM)</Label>
                  <Input defaultValue="gemini-2.5-flash" className="h-12 bg-slate-50" />
                </div>
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-900">Support Client Actif</p>
                    <p className="text-[10px] text-emerald-700">Réponses auto via Genkit</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex gap-3">
              <Button variant="ghost" onClick={() => setIsConfigOpen(false)} className="flex-1 font-bold text-slate-400">Annuler</Button>
              <Button onClick={saveConfig} disabled={isSaving} className="flex-1 bg-primary text-white font-black h-12 rounded-xl">
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Sauvegarder</>}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
