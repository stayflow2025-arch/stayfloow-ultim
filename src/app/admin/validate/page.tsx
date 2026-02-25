
'use client';

import React, { useState } from 'react';
import { useCollection, getFirestore } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, MapPin, Phone, 
  Mail, ExternalLink, Image as ImageIcon, Loader2 
} from 'lucide-react';
import Image from 'next/image';

export default function AdminValidatePage() {
  const db = getFirestore();
  const listingsRef = collection(db, 'listings');
  const { data: listings, loading } = useCollection(listingsRef);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'rejected' });
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  const pending = listings?.filter(l => l.status === 'pending') || [];
  const selected = listings?.find(l => l.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <h1 className="text-xl font-black">StayFloow Admin</h1>
          <p className="text-xs opacity-70">Validation des annonces partenaires</p>
        </div>
        <div className="p-4 space-y-3">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">En attente ({pending.length})</h2>
          {pending.length === 0 && <p className="text-center py-10 text-slate-400 text-sm">Aucune demande en attente.</p>}
          {pending.map(l => (
            <div 
              key={l.id} 
              onClick={() => setSelectedId(l.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all cursor-pointer",
                selectedId === l.id ? "border-primary bg-primary/5" : "border-slate-50 hover:border-slate-200"
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="text-[10px] uppercase font-black">{l.category}</Badge>
                <span className="text-[10px] text-slate-400">{new Date(l.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-slate-900 truncate">{l.details?.name}</h3>
              <p className="text-xs text-slate-500 truncate">{l.location?.address}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail View */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black text-slate-900">{selected.details?.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-slate-500">
                  <div className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {selected.location?.address}</div>
                  <div className="flex items-center gap-1 font-bold text-primary">{selected.price} DZD</div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => handleReject(selected.id)} className="border-destructive text-destructive hover:bg-destructive/10">
                  <XCircle className="mr-2 h-4 w-4" /> Rejeter
                </Button>
                <Button onClick={() => handleApprove(selected.id)} className="bg-green-600 hover:bg-green-700 text-white font-black">
                  <CheckCircle className="mr-2 h-4 w-4" /> Approuver l'annonce
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-bold mb-4 text-slate-400 uppercase text-xs">Partenaire</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3"><Users className="h-4 w-4 text-slate-400" /> <span className="font-bold">{selected.partnerInfo?.firstName} {selected.partnerInfo?.lastName}</span></div>
                    <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /> <span className="text-sm">{selected.partnerInfo?.email}</span></div>
                    <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /> <span className="text-sm font-bold">{selected.partnerInfo?.phone}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardContent className="p-6">
                  <h4 className="font-bold mb-4 text-slate-400 uppercase text-xs">Détails & Équipements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.details?.amenities?.map((a: string) => (
                      <Badge key={a} variant="secondary" className="bg-slate-100">{a}</Badge>
                    ))}
                  </div>
                  <p className="mt-6 text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-100 pl-4">
                    {selected.details?.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Photos ({selected.photos?.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selected.photos?.map((p: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden shadow-lg group">
                    <Image src={p} alt="Listing Photo" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    {i === 0 && <Badge className="absolute bottom-2 left-2 bg-primary">PHOTO PRINCIPALE</Badge>}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-0 h-80 rounded-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-200 flex items-center justify-center">
                  <Image src="https://picsum.photos/seed/admin-map/800/400" alt="Map" fill className="object-cover opacity-50" />
                  <div className="z-10 bg-white p-4 rounded-xl shadow-2xl flex flex-col items-center">
                    <MapPin className="h-8 w-8 text-primary animate-bounce mb-2" />
                    <span className="font-black">Coordonnées GPS validées</span>
                    <span className="text-xs text-slate-400">{selected.location?.lat}, {selected.location?.lng}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <Clock className="h-20 w-20 mb-4 opacity-20" />
            <h3 className="text-2xl font-black">Sélectionnez une annonce</h3>
            <p>Choisissez un partenaire dans la liste de gauche pour valider ses informations.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
