
"use client";

import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  LogOut, 
  Settings, 
  Shield, 
  Clock, 
  ArrowLeft,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  MessageSquare,
  TrendingUp,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { collection, query, where, limit } from "firebase/firestore";
import { useCurrency } from "@/context/currency-context";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();

  // 1. Charger les réservations du client - Sans OrderBy pour éviter les erreurs d'index composite
  const bookingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "bookings"),
      where("userId", "==", user.uid),
      limit(10)
    );
  }, [db, user]);
  const { data: rawBookings, isLoading: bookingsLoading } = useCollection(bookingsRef);

  // Tri manuel côté client pour la stabilité
  const bookings = useMemo(() => {
    if (!rawBookings) return [];
    return [...rawBookings].sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    ).slice(0, 5);
  }, [rawBookings]);

  // 2. Charger les conversations
  const convsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      limit(3)
    );
  }, [db, user]);
  const { data: convs } = useCollection(convsRef);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const stats = useMemo(() => {
    if (!rawBookings) return { upcoming: 0, totalSpent: 0 };
    const now = new Date();
    return {
      upcoming: rawBookings.filter(b => new Date(b.startDate) > now).length,
      totalSpent: rawBookings.filter(b => b.status === 'approved').reduce((acc, curr) => acc + (curr.totalPrice || 0), 0)
    };
  }, [rawBookings]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Déconnexion réussie" });
      router.push("/");
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  if (loading || bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-primary text-white py-6 px-8 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-black tracking-tight uppercase">Tableau de Bord Client</h1>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-primary font-black rounded-xl" asChild>
                <Link href="/profile/bookings">Mes Voyages</Link>
             </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Profil Rapide */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-white">
              <div className="h-24 bg-gradient-to-r from-primary to-secondary" />
              <CardContent className="pt-0 text-center -mt-12">
                <div className="inline-block p-1 bg-white rounded-full mb-4 shadow-lg">
                  <div className="bg-slate-100 h-24 w-24 rounded-full flex items-center justify-center">
                    <User className="h-12 w-12 text-slate-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-900 truncate">
                  {user.displayName || "Voyageur"}
                </h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{user.email}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-xl font-black text-primary">{stats.upcoming}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">À venir</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <p className="text-xl font-black text-slate-900">{formatPrice(stats.totalSpent)}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Dépensé</p>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full border-red-100 text-red-500 hover:bg-red-50 font-black h-12 rounded-xl"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-[2rem] bg-slate-900 text-white p-8 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" /> Parrainez un ami
                </h3>
                <p className="text-white/60 text-xs font-medium leading-relaxed">
                  Offrez 10% à vos proches et recevez 5000 DZD en crédit voyage StayFloow.
                </p>
                <Button className="w-full bg-primary hover:bg-white hover:text-primary font-black h-12 rounded-xl transition-all">
                  Inviter mes amis
                </Button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </Card>
          </div>

          {/* Flux Principal Dynamique */}
          <div className="lg:col-span-2 space-y-8">
            {/* RÉSERVATIONS RÉCENTES */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Dernières Réservations
                </h3>
                <Link href="/profile/bookings" className="text-xs font-black text-primary hover:underline uppercase">Voir tout</Link>
              </div>

              <div className="space-y-4">
                {bookings && bookings.length > 0 ? (
                  bookings.map((b: any) => (
                    <Card key={b.id} className="border-none shadow-sm rounded-3xl bg-white hover:shadow-lg transition-all group overflow-hidden">
                      <CardContent className="p-0 flex items-center">
                        <div className="relative h-24 w-24 shrink-0 bg-slate-100">
                          <Image src={b.itemImage || "https://placehold.co/100x100"} alt="Stay" fill className="object-cover" />
                        </div>
                        <div className="flex-1 p-6 flex items-center justify-between">
                          <div>
                            <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{b.itemName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(b.startDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">{formatPrice(b.totalPrice)}</p>
                            <Badge className="bg-primary/10 text-primary text-[8px] font-black uppercase border-none">{b.status}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="py-12 text-center bg-white rounded-3xl border-4 border-dashed border-slate-100">
                    <p className="text-slate-400 font-bold">Aucun voyage pour le moment.</p>
                    <Button variant="link" className="text-primary font-black" asChild><Link href="/">Explorer les offres</Link></Button>
                  </div>
                )}
              </div>
            </div>

            {/* MESSAGES RÉCENTS */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" /> Discussions en cours
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {convs && convs.length > 0 ? (
                  convs.map((c: any) => (
                    <Card key={c.id} className="border-none shadow-sm rounded-3xl bg-white p-6 cursor-pointer hover:bg-primary/5 transition-all" onClick={() => router.push(`/profile/messages?id=${c.id}`)}>
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-2xl text-slate-400"><User className="h-5 w-5" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-900 truncate">Hôte StayFloow</p>
                          <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-200" />
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="md:col-span-2 border-none shadow-sm rounded-3xl bg-white p-8 text-center text-slate-400 font-bold">
                    Aucun message.
                  </Card>
                )}
              </div>
            </div>

            {/* PROFIL / SÉCURITÉ RAPIDE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
                <Settings className="h-8 w-8 text-primary mb-4" />
                <h4 className="font-black text-slate-900 mb-2">Paramètres du compte</h4>
                <p className="text-xs text-slate-500 mb-6">Gérez vos informations de contact et vos préférences de paiement.</p>
                <Button variant="outline" className="w-full rounded-xl font-black h-12">Gérer</Button>
              </Card>
              <Card className="border-none shadow-sm rounded-3xl bg-white p-8">
                <Shield className="h-8 w-8 text-secondary mb-4" />
                <h4 className="font-black text-slate-900 mb-2">Sécurité</h4>
                <p className="text-xs text-slate-500 mb-6">Mettez à jour votre mot de passe et activez la double authentification.</p>
                <Button variant="outline" className="w-full rounded-xl font-black h-12">Sécuriser</Button>
              </Card>
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-white border-t py-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        © 2025 StayFloow.com — Votre Portail Client Sécurisé
      </footer>
    </div>
  );
}
