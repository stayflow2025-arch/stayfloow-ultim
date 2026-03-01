
"use client";

import React, { useState, useMemo } from "react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  Building, Car, Compass, Search, Filter, 
  MoreVertical, Trash2, CheckCircle, XCircle, 
  ArrowLeft, Loader2, ExternalLink, MapPin, Tag, AlertCircle
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

export default function AdminCatalogPage() {
  const router = useRouter();
  const db = useFirestore();
  const { formatPrice } = useCurrency();
  
  const listingsRef = useMemoFirebase(() => collection(db, 'listings'), [db]);
  const { data: listings, isLoading } = useCollection(listingsRef);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

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
    if (window.confirm("Supprimer définitivement cette annonce ? Cette action est irréversible.")) {
      await deleteDoc(doc(db, 'listings', id));
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, 'listings', id), { status: newStatus });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-20">
      <header className="bg-slate-800 text-white py-6 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Catalogue Maître</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestion autonome des annonces StayFloow</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-xl border border-slate-600">
            <button onClick={() => setFilterCategory('all')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", filterCategory === 'all' ? "bg-primary text-white" : "text-slate-400")}>Toutes</button>
            <button onClick={() => setFilterCategory('accommodation')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", filterCategory === 'accommodation' ? "bg-primary text-white" : "text-slate-400")}>Hôtels</button>
            <button onClick={() => setFilterCategory('car_rental')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", filterCategory === 'car_rental' ? "bg-primary text-white" : "text-slate-400")}>Voitures</button>
            <button onClick={() => setFilterCategory('circuit')} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all", filterCategory === 'circuit' ? "bg-primary text-white" : "text-slate-400")}>Circuits</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10 space-y-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Rechercher par nom ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold"
            />
          </div>
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected'].map(status => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                className={cn(
                  "h-14 px-6 rounded-2xl font-black uppercase text-[10px]",
                  filterStatus === status ? "bg-primary" : "bg-white border-none shadow-sm"
                )}
              >
                {status === 'pending' ? 'En attente' : status === 'approved' ? 'Actives' : 'Rejetées'}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredListings.length > 0 ? (
            filteredListings.map((l) => (
              <Card key={l.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white">
                <CardContent className="p-0 flex flex-col md:flex-row items-center">
                  <div className="relative w-full md:w-48 h-32 shrink-0 bg-slate-100">
                    <Image 
                      src={l.photos?.[0] || "https://placehold.co/400x300?text=No+Image"} 
                      alt="Listing" 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={cn(
                        "font-black text-[8px] uppercase",
                        l.status === 'approved' ? "bg-green-600" : l.status === 'pending' ? "bg-amber-500" : "bg-red-600"
                      )}>
                        {l.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-black text-slate-900 truncate">{l.details?.name || 'Sans nom'}</h3>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-1 uppercase">
                        <MapPin className="h-3 w-3 text-primary" /> {l.location?.address}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partenaire</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{l.partnerInfo?.email}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-8">
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prix</p>
                        <p className="text-lg font-black text-primary">{formatPrice(l.price)}</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 border-none shadow-2xl bg-white">
                          <DropdownMenuItem onClick={() => router.push(`/admin/validate?id=${l.id}`)} className="font-bold py-3 cursor-pointer rounded-lg">
                            <ExternalLink className="h-4 w-4 mr-3 text-blue-500" /> Voir Détails
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(l.id, l.status === 'approved' ? 'pending' : 'approved')} className="font-bold py-3 cursor-pointer rounded-lg">
                            {l.status === 'approved' ? (
                              <><XCircle className="h-4 w-4 mr-3 text-amber-500" /> Désactiver</>
                            ) : (
                              <><CheckCircle className="h-4 w-4 mr-3 text-green-500" /> Approuver</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(l.id)} className="font-bold py-3 text-red-600 cursor-pointer rounded-lg hover:bg-red-50">
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
            <div className="py-20 text-center bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200">
              <Tag className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-400 uppercase">Aucune annonce trouvée</h3>
              <p className="text-slate-500 font-medium">Modifiez vos filtres ou attendez de nouvelles soumissions.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
