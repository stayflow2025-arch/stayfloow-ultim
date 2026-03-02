
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { 
  Search, 
  MoreVertical, Trash2, CheckCircle, XCircle, 
  ArrowLeft, Loader2, ExternalLink, MapPin, Tag, 
  Filter, Calendar, Building, Car, Compass, User, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ["stayflow2025@gmail.com", "kiosque.du.passage@gmail.com"];

export default function AdminCatalogPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { formatPrice } = useCurrency();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  // CHARGEMENT RÉEL ET AUTOMATIQUE DE TOUTES LES ANNONCES
  const listingsRef = useMemoFirebase(() => query(collection(db, 'listings'), orderBy('createdAt', 'desc')), [db]);
  const { data: listings, isLoading: listingsLoading } = useCollection(listingsRef);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isUserLoading, router]);

  const filteredListings = useMemo(() => {
    if (!listings) return [];
    return listings.filter(l => {
      const name = (l.details?.name || "").toLowerCase();
      const email = (l.partnerInfo?.email || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = name.includes(search) || email.includes(search);
      const matchesCat = filterCategory === "all" || l.category === filterCategory;
      const matchesStatus = filterStatus === "all" || l.status === filterStatus;
      
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [listings, searchTerm, filterCategory, filterStatus]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer définitivement cette annonce du catalogue maître ? Cette action est irréversible.")) {
      await deleteDoc(doc(db, 'listings', id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, 'listings', id), { status: newStatus });
  };

  if (listingsLoading || isUserLoading || isAuthorized === null) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-white/50 font-black uppercase tracking-widest text-[10px]">Synchronisation Catalogue Maître...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      <header className="bg-slate-800 text-white py-6 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Catalogue Maître</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôle global dynamique ({listings?.length || 0} annonces)</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-xl border border-slate-600">
            <CatButton active={filterCategory === 'all'} label="Tout" onClick={() => setFilterCategory('all')} icon={<Tag className="h-3 w-3" />} />
            <CatButton active={filterCategory === 'accommodation'} label="Hôtels" onClick={() => setFilterCategory('accommodation')} icon={<Building className="h-3 w-3" />} />
            <CatButton active={filterCategory === 'car_rental'} label="Voitures" onClick={() => setFilterCategory('car_rental')} icon={<Car className="h-3 w-3" />} />
            <CatButton active={filterCategory === 'circuit'} label="Circuits" onClick={() => setFilterCategory('circuit')} icon={<Compass className="h-3 w-3" />} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        {/* Barre de Recherche et Filtres */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Rechercher par nom d'établissement ou email partenaire..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold text-lg"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "h-14 px-6 rounded-2xl font-black uppercase text-[10px] transition-all",
                  filterStatus === status ? "bg-primary shadow-lg shadow-primary/20" : "bg-white border-none shadow-sm"
                )}
              >
                {status === 'all' ? 'Tous les états' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvées' : 'Rejetées'}
              </Button>
            ))}
          </div>
        </div>

        {/* Liste des Annonces */}
        <div className="grid grid-cols-1 gap-6">
          {filteredListings.length > 0 ? (
            filteredListings.map((l) => (
              <Card key={l.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all bg-white group border-l-8 border-transparent hover:border-primary">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="relative w-full md:w-64 h-48 shrink-0 bg-slate-100 overflow-hidden">
                    <Image 
                      src={l.photos?.[0] || "https://placehold.co/400x300?text=StayFloow+Listing"} 
                      alt="Listing" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={cn(
                        "font-black text-[9px] uppercase px-3 py-1 shadow-lg border-none",
                        l.status === 'approved' ? "bg-green-600" : l.status === 'pending' ? "bg-amber-500" : "bg-red-600"
                      )}>
                        {l.status === 'approved' ? 'ACTIF' : l.status === 'pending' ? 'EN ATTENTE' : 'REJETÉ'}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                       <Badge className="bg-black/50 backdrop-blur-md text-white font-black text-[8px] uppercase border-none">
                          {l.category === 'accommodation' ? 'Hébergement' : l.category === 'car_rental' ? 'Véhicule' : 'Circuit'}
                       </Badge>
                    </div>
                  </div>

                  <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2 space-y-2">
                      <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{l.details?.name || 'Annonce sans titre'}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                        <MapPin className="h-3 w-3 text-primary" /> {l.location?.address}
                      </div>
                      <div className="pt-4 flex items-center gap-4">
                         <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-600 truncate max-w-[120px]">{l.partnerInfo?.email}</span>
                         </div>
                         <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-600">{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : 'Date inconnue'}</span>
                         </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center border-l border-slate-50 pl-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tarif de base</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(l.price)}</p>
                      {l.isDiscountEnabled && (
                        <Badge className="w-fit mt-1 bg-secondary text-primary font-black text-[8px]">PROMO -15% ACTIVE</Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/validate?id=${l.id}`)} className="h-12 px-6 rounded-xl font-black text-[10px] uppercase border-slate-200 hover:bg-slate-50">
                        Auditer
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-100 outline-none">
                            <MoreVertical className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-none shadow-2xl bg-white">
                          <DropdownMenuItem onClick={() => router.push(`/admin/validate?id=${l.id}`)} className="font-bold py-4 cursor-pointer rounded-xl">
                            <ExternalLink className="h-4 w-4 mr-3 text-blue-500" /> Voir les détails publics
                          </DropdownMenuItem>
                          
                          <div className="h-px bg-slate-50 my-2" />
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'approved')} className="font-bold py-4 cursor-pointer rounded-xl text-green-600 hover:bg-green-50">
                            <CheckCircle className="h-4 w-4 mr-3" /> Approuver l'annonce
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'pending')} className="font-bold py-4 cursor-pointer rounded-xl text-amber-600 hover:bg-amber-50">
                            <Clock className="h-4 w-4 mr-3" /> Mettre en attente
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'rejected')} className="font-bold py-4 cursor-pointer rounded-xl text-slate-400 hover:bg-slate-50">
                            <XCircle className="h-4 w-4 mr-3" /> Rejeter / Refuser
                          </DropdownMenuItem>
                          
                          <div className="h-px bg-slate-50 my-2" />

                          <DropdownMenuItem onClick={() => handleDelete(l.id)} className="font-bold py-4 text-red-600 cursor-pointer rounded-xl hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-3" /> Supprimer définitivement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] shadow-sm border-4 border-dashed border-slate-100">
              <div className="bg-slate-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-12 w-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight">Aucune annonce trouvée</h3>
              <p className="text-slate-400 font-medium mt-2">Modifiez vos filtres ou attendez de nouvelles soumissions partenaires.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function CatButton({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon: any }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase transition-all", 
        active ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-slate-600"
      )}
    >
      {icon} {label}
    </button>
  );
}
