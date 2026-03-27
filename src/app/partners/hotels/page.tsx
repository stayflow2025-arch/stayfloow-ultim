
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Building, Plus, Hotel, Bed, MapPin, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PartnerHotelsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Partenaire */}
      <header className="bg-primary text-white py-6 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-black tracking-tight">
              Gestion des Hébergements — StayFloow<span className="text-secondary">.com</span>
            </h1>
          </div>
          <Button className="bg-secondary hover:bg-secondary/90 text-primary font-black shadow-xl" asChild>
            <Link href="/partners/join">
              <Plus className="mr-2 h-5 w-5" /> Ajouter un établissement
            </Link>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Statistiques Rapides */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Établissements" value="3" icon={<Hotel className="text-primary" />} />
            <StatCard title="Chambres totales" value="24" icon={<Bed className="text-primary" />} />
            <StatCard title="Note moyenne" value="4.7/5" icon={<Star className="text-primary fill-primary" />} />
          </div>

          {/* Section Principale */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="border-b bg-slate-50/50">
                <CardTitle className="text-xl font-black text-slate-800">Vos propriétés</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                  <div className="bg-slate-100 p-6 rounded-full mb-6">
                    <Building className="h-12 w-12 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Gérez vos hôtels et riads</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mb-8">
                    Ici, vous pourrez modifier vos tarifs, mettre à jour vos photos et gérer vos disponibilités en temps réel sur StayFloow.com.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-white font-black px-8 h-12 rounded-xl" asChild>
                    <Link href="/partners/join">
                      Enregistrer un nouvel établissement
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Aide / Conseils */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg bg-primary text-white rounded-3xl overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <h3 className="text-xl font-black">Conseils pour booster vos ventes</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Les établissements avec plus de <strong>10 photos de haute qualité</strong> reçoivent en moyenne 40% de réservations en plus.
                </p>
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-secondary" />
                    <span>Vérifiez votre position GPS</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <ShieldCheck className="h-4 w-4 text-secondary" />
                    <span>Activez le paiement en ligne</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-slate-200 bg-transparent rounded-3xl">
              <CardContent className="p-8 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Support Partenaire</p>
                <p className="text-slate-600 mb-6 font-medium">Une question sur la configuration ?</p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 font-black">
                    Aide & Contact
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: any }) {
  return (
    <Card className="border-none shadow-lg rounded-2xl bg-white p-6 flex items-center gap-4">
      <div className="bg-slate-50 p-4 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </Card>
  );
}
