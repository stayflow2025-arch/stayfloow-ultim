"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { 
  CreditCard, ShieldCheck, Lock, Settings2, Save, 
  ArrowLeft, Loader2, Zap, RefreshCw, AlertCircle,
  Wallet, DollarSign, ArrowUpRight, CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { checkIsAdmin } from "@/lib/admin-config";
import { cn } from "@/lib/utils";

export default function AdminStripePage() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [isSaving, setIsSaving] = useState(false);

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  const configRef = useMemoFirebase(() => doc(db, "settings", "stripeConfig"), [db]);
  const { data: config, isLoading: configLoading } = useDoc(configRef);

  const [formData, setFormData] = useState({
    publishableKey: "",
    secretKey: "",
    webhookSecret: "",
    mode: "test",
    platformFee: 14,
    currency: "EUR",
    autoPayout: false
  });

  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isUserLoading, isAdmin, router]);

  useEffect(() => {
    if (config) {
      setFormData({
        publishableKey: config.publishableKey || "",
        secretKey: config.secretKey || "",
        webhookSecret: config.webhookSecret || "",
        mode: config.mode || "test",
        platformFee: config.platformFee || 14,
        currency: config.currency || "EUR",
        autoPayout: config.autoPayout || false
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
      toast({ title: "Configuration Stripe mise à jour", description: "Les paramètres de paiement ont été appliqués avec succès." });
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder les paramètres Stripe." });
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
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <CreditCard className="text-primary" /> Configuration Stripe
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestion des flux financiers StayFloow</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl shadow-xl">
            {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <><Save className="mr-2 h-4 w-4" /> Enregistrer</>}
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12 space-y-10">
        
        {/* Account Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatusCard title="Compte Stripe" status="Actif" icon={<CheckCircle2 className="text-green-500" />} />
          <StatusCard title="Mode Actuel" status={formData.mode === 'live' ? 'Production' : 'Test'} icon={<Zap className={formData.mode === 'live' ? "text-amber-500" : "text-blue-500"} />} />
          <StatusCard title="Webhooks" status="Connecté" icon={<RefreshCw className="text-primary" />} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* API KEYS */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Clés API (Environnement)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-bold">Mode de fonctionnement</p>
                  <p className="text-[10px] text-slate-400 font-medium">Basculez entre le mode Test et Production</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-[10px] font-black uppercase", formData.mode === 'test' ? "text-primary" : "text-slate-300")}>Test</span>
                  <Switch checked={formData.mode === 'live'} onCheckedChange={(v) => setFormData({...formData, mode: v ? 'live' : 'test'})} />
                  <span className={cn("text-[10px] font-black uppercase", formData.mode === 'live' ? "text-amber-500" : "text-slate-300")}>Live</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Clé Publique (Publishable Key)</Label>
                <Input value={formData.publishableKey} onChange={e => setFormData({...formData, publishableKey: e.target.value})} placeholder={formData.mode === 'live' ? "pk_live_..." : "pk_test_..."} className="h-12 bg-slate-50 font-mono text-xs" />
              </div>
              
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Clé Secrète (Secret Key)</Label>
                <Input type="password" value={formData.secretKey} onChange={e => setFormData({...formData, secretKey: e.target.value})} placeholder={formData.mode === 'live' ? "sk_live_..." : "sk_test_..."} className="h-12 bg-slate-50 font-mono text-xs" />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Secret Webhook (Signing Secret)</Label>
                <Input type="password" value={formData.webhookSecret} onChange={e => setFormData({...formData, webhookSecret: e.target.value})} placeholder="whsec_..." className="h-12 bg-slate-50 font-mono text-xs" />
              </div>
            </CardContent>
          </Card>

          {/* FEES & SETTINGS */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" /> Paramètres Financiers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Commission Plateforme (%)</Label>
                <div className="relative">
                  <Input type="number" value={formData.platformFee} onChange={e => setFormData({...formData, platformFee: parseFloat(e.target.value)})} className="h-12 bg-slate-50 pr-12 font-black" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</div>
                </div>
                <p className="text-[10px] text-slate-400 italic">Frais prélevés sur chaque transaction Stripe.</p>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-slate-700">Devise de règlement par défaut</Label>
                <Select value={formData.currency} onValueChange={v => setFormData({...formData, currency: v})}>
                  <SelectTrigger className="h-12 bg-slate-50 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€) - Recommandé</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="DZD">DZD (DA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-900">Virements Automatiques</p>
                  <p className="text-[10px] text-emerald-700 font-medium">Déclencher le virement aux partenaires dès validation</p>
                </div>
                <Switch checked={formData.autoPayout} onCheckedChange={(v) => setFormData({...formData, autoPayout: v})} />
              </div>
            </CardContent>
          </Card>

          {/* HELP CARD */}
          <Card className="md:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="bg-primary/20 p-6 rounded-3xl">
                <AlertCircle className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-black">Besoin d'aide pour configurer Stripe Connect ?</h3>
                <p className="text-white/60 font-medium leading-relaxed">
                  L'intégration Stripe de StayFloow utilise le modèle "Direct Charges". Vous devez configurer votre point de terminaison de webhook dans le tableau de bord Stripe vers l'URL fournie par l'extension Firebase.
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-white/20 text-white font-bold hover:bg-white/10" asChild>
                    <a href="https://dashboard.stripe.com" target="_blank">Ouvrir Stripe Dashboard</a>
                  </Button>
                  <Button variant="link" className="text-primary font-black">Consulter la documentation</Button>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

function StatusCard({ title, status, icon }: { title: string, status: string, icon: any }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl bg-white p-6 flex items-center gap-4">
      <div className="bg-slate-50 p-3 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-xl font-black text-slate-900">{status}</p>
      </div>
    </Card>
  );
}
