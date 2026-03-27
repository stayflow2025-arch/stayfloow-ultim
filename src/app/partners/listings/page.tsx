
"use client";

import React, { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  Building, Plus, Search, MoreVertical, Trash2, 
  Eye, Edit3, Loader2, ArrowLeft, MapPin, Tag,
  CheckCircle2, XCircle, Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function PartnerListingsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState("");

  const listingsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "listings"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: listings, isLoading } = useCollection(listingsRef);

  const filteredListings = listings?.filter(l => 
    l.details?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = async (id: string) => {
    if (window.confirm("Supprimer cette annonce définitivement ?")) {
      await deleteDoc(doc(db, "listings", id));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'inactive' : 'approved';
    await updateDoc(doc(db, "listings", id), { status: newStatus });
  };

  if (isUserLoading || isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-primary text-white py-8 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/partners/dashboard')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Mes Annonces</h1>
              <p className="text-white/60 font-medium">{filteredListings.length} offres actives sur la plateforme</p>
            </div>
          </div>
          <Button onClick={() => router.push('/partners/join')} className="bg-secondary hover:bg-secondary/90 text-primary font-black px-8 h-14 rounded-2xl shadow-xl">
            <Plus className="mr-2 h-5 w-5" /> Ajouter une offre
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Rechercher parmi vos annonces..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredListings.length > 0 ? (
            filteredListings.map((l) => (
              <Card key={l.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all group">
                <CardContent className="p-0 flex flex-col md:flex-row">
                  <div className="relative w-full md:w-72 h-52 bg-slate-100 overflow-hidden">
                    <Image src={l.photos?.[0] || "https://placehold.co/400x300"} alt="Listing" fill className="object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-3 left-3">
                      <Badge className={cn(
                        "font-black text-[9px] uppercase px-3 py-1 shadow-lg border-none",
                        l.status === 'approved' ? "bg-green-600" : l.status === 'pending' ? "bg-amber-500" : "bg-red-600"
                      )}>
                        {l.status === 'approved' ? 'ACTIF' : l.status === 'pending' ? 'EN ATTENTE' : 'DÉSACTIVÉ'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2 space-y-2">
                      <h3 className="text-xl font-black text-slate-900">{l.details?.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-tight">
                        <MapPin className="h-3 w-3 text-primary" /> {l.location?.address}
                      </div>
                      <div className="flex items-center gap-4 pt-4">
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold">{l.category}</Badge>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Créé le {l.createdAt?.toDate ? format(l.createdAt.toDate(), "dd/MM/yyyy") : '...'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center border-l border-slate-50 pl-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Prix de base</p>
                      <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(l.price)}</p>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" onClick={() => router.push(`/properties/${l.id}`)} className="h-12 w-12 rounded-xl p-0 border-slate-100 text-slate-400 hover:text-primary">
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button variant="outline" className="h-12 w-12 rounded-xl p-0 border-slate-100 text-slate-400 hover:text-blue-500">
                        <Edit3 className="h-5 w-5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-slate-100">
                            <MoreVertical className="h-6 w-6" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl bg-white">
                          <DropdownMenuItem onClick={() => handleToggleStatus(l.id, l.status)} className="font-bold py-3 cursor-pointer rounded-xl">
                            {l.status === 'approved' ? (
                              <><XCircle className="h-4 w-4 mr-3 text-amber-500" /> Désactiver</>
                            ) : (
                              <><CheckCircle2 className="h-4 w-4 mr-3 text-green-500" /> Activer</>
                            )}
                          </DropdownMenuItem>
                          <div className="h-px bg-slate-50 my-2" />
                          <DropdownMenuItem onClick={() => handleDelete(l.id)} className="font-bold py-3 text-red-600 cursor-pointer rounded-xl hover:bg-red-50">
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
              <Building className="h-16 w-16 text-slate-100 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-400">Vous n'avez pas encore d'annonces.</h3>
              <Button onClick={() => router.push('/partners/join')} className="mt-6 bg-primary font-black rounded-xl">Créer ma première offre</Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
