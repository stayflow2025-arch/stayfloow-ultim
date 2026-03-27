"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { 
  Search, 
  MoreVertical, Trash2, CheckCircle, XCircle, 
  ArrowLeft, Loader2, ExternalLink, MapPin, Tag, 
  Building, Car, Compass, User, Calendar, Clock
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
import { properties as mockProperties, cars as mockCars, circuits as mockCircuits } from "@/lib/data";
import { checkIsAdmin } from "@/lib/admin-config";

export default function AdminCatalogPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { formatPrice } = useCurrency();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  
  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  // Requête sécurisée
  const listingsRef = useMemoFirebase(() => {
    if (!isAdmin || isUserLoading || !db) return null;
    return query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin, isUserLoading]);
  
  const { data: dbListings, isLoading: listingsLoading } = useCollection(listingsRef);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || !isAdmin) {
        router.replace("/");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isUserLoading, router, isAdmin]);

  const allListings = useMemo(() => {
    const fromDb = dbListings || [];
    
    const mocks = [
      ...mockProperties.map(p => ({
        id: p.id,
        category: 'accommodation',
        status: 'approved',
        details: { name: p.name, description: p.description },
        location: { address: p.location },
        partnerInfo: { email: 'demo@stayfloow.com', firstName: 'Demo', lastName: 'Partner' },
        price: p.price,
        photos: p.images,
        createdAt: { toDate: () => new Date() }
      })),
      ...mockCars.map(c => ({
        id: c.id,
        category: 'car_rental',
        status: 'approved',
        details: { name: `${c.brand} ${c.name}`, description: 'Véhicule de démonstration' },
        location: { address: 'Alger, Algérie' },
        partnerInfo: { email: 'cars@stayfloow.com', firstName: 'StayFloow', lastName: 'Fleet' },
        price: c.pricePerDay,
        photos: [c.image],
        createdAt: { toDate: () => new Date() }
      })),
      ...mockCircuits.map(circ => ({
        id: circ.id,
        category: 'circuit',
        status: 'approved',
        details: { name: circ.title, description: circ.description },
        location: { address: circ.location },
        partnerInfo: { email: 'guide@stayfloow.com', firstName: 'Expert', lastName: 'Guide' },
        price: circ.pricePerPerson,
        photos: circ.images,
        createdAt: { toDate: () => new Date() }
      }))
    ];

    return [...fromDb, ...mocks];
  }, [dbListings]);

  const filteredListings = useMemo(() => {
    return allListings.filter(l => {
      const name = (l.details?.name || "").toLowerCase();
      const email = (l.partnerInfo?.email || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = name.includes(search) || email.includes(search);
      const matchesCat = filterCategory === "all" || l.category === filterCategory;
      const matchesStatus = filterStatus === "all" || l.status === filterStatus;
      
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [allListings, searchTerm, filterCategory, filterStatus]);

  const handleDelete = async (id: string) => {
    if (id.startsWith('prop-') || id.startsWith('car-') || id.startsWith('circ-')) {
      alert("Impossible de supprimer une annonce de démonstration.");
      return;
    }
    if (window.confirm("Supprimer définitivement cette annonce ?")) {
      await deleteDoc(doc(db, 'listings', id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (id.startsWith('prop-') || id.startsWith('car-') || id.startsWith('circ-')) {
      alert("Modification de statut non autorisée sur les annonces démo.");
      return;
    }
    await updateDoc(doc(db, 'listings', id), { status: newStatus });
  };

  if (isUserLoading || isAuthorized === null) return (
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
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contrôle global ({filteredListings.length} annonces)</p>
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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Rechercher par nom ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {['all', 'pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  "h-14 px-6 rounded-2xl font-black uppercase text-[10px]",
                  filterStatus === status ? "bg-primary" : "bg-white border-none"
                )}
              >
                {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Actifs' : 'Rejetés'}
              </Button>
            ))}
          </div>
        </div>

        {listingsLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredListings.length > 0 ? (
              filteredListings.map((l) => (
                <Card key={l.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all group">
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
                    </div>

                    <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                      <div className="lg:col-span-2 space-y-2">
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{l.details?.name}</h3>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                          <MapPin className="h-3 w-3 text-primary" /> {l.location?.address}
                        </div>
                        <div className="pt-4 flex items-center gap-4">
                           <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                              <User className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-600">{l.partnerInfo?.email}</span>
                           </div>
                           <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-[10px] font-black text-slate-600">{l.createdAt?.toDate ? l.createdAt.toDate().toLocaleDateString() : 'Date inconnue'}</span>
                           </div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center border-l border-slate-50 pl-8">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix Affiché</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(l.price)}</p>
                      </div>

                      <div className="flex items-center justify-end gap-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full hover:bg-slate-100">
                              <MoreVertical className="h-6 w-6" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 border-none shadow-2xl bg-white">
                            <DropdownMenuItem onClick={() => router.push(`/admin/validate?id=${l.id}`)} className="font-bold py-4 cursor-pointer rounded-xl">
                              <ExternalLink className="h-4 w-4 mr-3 text-blue-500" /> Auditer l'annonce
                            </DropdownMenuItem>
                            
                            <div className="h-px bg-slate-50 my-2" />
                            
                            <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'approved')} className="font-bold py-4 cursor-pointer rounded-xl text-green-600">
                              <CheckCircle className="h-4 w-4 mr-3" /> Approuver
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'pending')} className="font-bold py-4 cursor-pointer rounded-xl text-amber-600">
                              <Clock className="h-4 w-4 mr-3" /> Mettre en attente
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleStatusChange(l.id, 'rejected')} className="font-bold py-4 cursor-pointer rounded-xl text-slate-400">
                              <XCircle className="h-4 w-4 mr-3" /> Rejeter
                            </DropdownMenuItem>
                            
                            <div className="h-px bg-slate-50 my-2" />

                            <DropdownMenuItem onClick={() => handleDelete(l.id)} className="font-bold py-4 text-red-600 cursor-pointer rounded-xl hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-3" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <Tag className="h-12 w-12 text-slate-200 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-slate-400 uppercase">Aucune annonce trouvée</h3>
              </div>
            )}
          </div>
        )}
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
        active ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-600"
      )}
    >
      {icon} {label}
    </button>
  );
}