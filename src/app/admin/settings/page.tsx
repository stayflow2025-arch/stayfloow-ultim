"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  Settings, Globe, Shield, Mail, Wallet, 
  ArrowLeft, Loader2, Save, Sparkles, Sliders, ToggleRight, Type,
  Instagram, Facebook, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { checkIsAdmin } from "@/lib/admin-config";

export default function AdminSettingsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  const configRef = useMemoFirebase(() => doc(db, "settings", "siteConfig"), [db]);
  const { data: config, isLoading: configLoading } = useDoc(configRef);

  const [formData, setFormData] = useState({
    siteName: "StayFloow.com",
    platformFee: 15,
    autoValidate: false,
    maintenanceMode: false,
    supportEmail: "stayflow2025@gmail.com",
    currency: "DZD",
    heroTitle: "",
    heroSubtitle: "",
    instagramUrl: "https://instagram.com/stayfloow",
    facebookUrl: "https://facebook.com/stayfloow",
    tiktokUrl: "https://tiktok.com/@stayfloow"
  });

  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isUserLoading, isAdmin, router]);

  useEffect(() => {
    if (config) {
      setFormData({
        siteName: config.siteName || "StayFloow.com",
        platformFee: config.platformFee || 15,
        autoValidate: config.autoValidate || false,
        maintenanceMode: config.maintenanceMode || false,
        supportEmail: config.supportEmail || "stayflow2025@gmail.com",
        currency: config.currency || "DZD",
        heroTitle: config.heroTitle || "",
        heroSubtitle: config.heroSubtitle || "",
        instagramUrl: config.instagramUrl || "https://instagram.com/stayfloow",
        facebookUrl: config.facebookUrl || "https://facebook.com/stayfloow",
        tiktokUrl: config.tiktokUrl || "https://tiktok.com/@stayfloow"
      });
    }
  }, [config]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(configRef, {
        ...formData,
        updatedAt: serverTimestamp(),
        updatedBy: user?.email
      }, { merge: true });
      toast({ title: "Configuration mise à jour", description: "Les paramètres du site ont été appliqués." });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || configLoading || !user || !isAdmin) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-800 text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Configuration Plateforme</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pilotage global du moteur StayFloow</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-xl">
            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Sauvegarder</>}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* IDENTITÉ */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Identité du Site
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Nom de la plateforme</Label>
                <Input value={formData.siteName} onChange={e => setFormData({...formData, siteName: e.target.value})} className="h-12 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Email support officiel</Label>
                <Input value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} className="h-12 bg-slate-50" />
              </div>
            </CardContent>
          </Card>

          {/* RÉSEAUX SOCIAUX */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Share2 className="h-4 w-4 text-pink-500" /> Réseaux Sociaux
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500" /> Instagram</Label>
                <Input value={formData.instagramUrl} onChange={e => setFormData({...formData, instagramUrl: e.target.value})} placeholder="https://..." className="h-12 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-600" /> Facebook</Label>
                <Input value={formData.facebookUrl} onChange={e => setFormData({...formData, facebookUrl: e.target.value})} placeholder="https://..." className="h-12 bg-slate-50" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-slate-700 flex items-center gap-2">TikTok</Label>
                <Input value={formData.tiktokUrl} onChange={e => setFormData({...formData, tiktokUrl: e.target.value})} placeholder="https://..." className="h-12 bg-slate-50" />
              </div>
            </CardContent>
          </Card>

          {/* BUSINESS MODEL */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" /> Modèle Économique
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Frais de service plateforme (%)</Label>
                <div className="relative">
                  <Input type="number" value={formData.platformFee} onChange={e => setFormData({...formData, platformFee: parseInt(e.target.value)})} className="h-12 bg-slate-50 pr-12 font-black" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</div>
                </div>
                <p className="text-[10px] text-slate-400 italic">Appliqué sur chaque réservation confirmée.</p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label className="font-bold text-slate-700">Devise par défaut de la plateforme</Label>
                <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="DZD">DZD (DA) - Dinar Algérien</SelectItem>
                    <SelectItem value="USD">USD ($) - Dollar US</SelectItem>
                    <SelectItem value="GBP">GBP (£) - Livre Sterling</SelectItem>
                    <SelectItem value="CHF">CHF (₣) - Franc Suisse</SelectItem>
                    <SelectItem value="EGP">EGP (E£) - Livre Égyptienne</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-slate-400 italic">Cette devise sera utilisée comme référence principale pour les calculs internes.</p>
              </div>
            </CardContent>
          </Card>

          {/* CONTENU HOME - HERO SECTION */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b p-8">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" /> Contenu de la Page d'Accueil
              </CardTitle>
              <CardDescription className="font-bold">Personnalisez le texte principal affiché aux visiteurs (Section Hero).</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-3">
                <Label className="font-black text-slate-700">Titre Principal (Hero Title)</Label>
                <Input 
                  value={formData.heroTitle} 
                  onChange={e => setFormData({...formData, heroTitle: e.target.value})} 
                  placeholder="Laissez vide pour utiliser le texte par défaut..."
                  className="h-14 rounded-xl bg-slate-50 border-slate-100 font-bold text-lg" 
                />
              </div>
              <div className="space-y-3">
                <Label className="font-black text-slate-700">Sous-titre (Hero Subtitle)</Label>
                <Textarea 
                  value={formData.heroSubtitle} 
                  onChange={e => setFormData({...formData, heroSubtitle: e.target.value})} 
                  placeholder="Expliquez votre offre phare..."
                  className="min-h-[100px] rounded-xl bg-slate-50 border-slate-100 font-medium" 
                />
              </div>
            </CardContent>
          </Card>

          {/* WORKFLOW AUTOMATION */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-10">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                <Sliders className="h-6 w-6 text-primary" /> Automatisation & Sécurité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="space-y-1">
                    <p className="font-black">Validation Automatique</p>
                    <p className="text-xs text-white/40">Approuver les annonces sans vérification admin.</p>
                  </div>
                  <Switch checked={formData.autoValidate} onCheckedChange={v => setFormData({...formData, autoValidate: v})} />
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10">
                  <div className="space-y-1">
                    <p className="font-black text-amber-400">Mode Maintenance</p>
                    <p className="text-xs text-white/40">Rendre le site inaccessible aux clients.</p>
                  </div>
                  <Switch checked={formData.maintenanceMode} onCheckedChange={v => setFormData({...formData, maintenanceMode: v})} />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}