
'use client';

import React, { useState, useEffect } from 'react';
import { useCollection, getFirestore, useUser } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, MapPin, Phone, 
  Mail, Users, Image as ImageIcon, Loader2, ArrowLeft 
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminValidatePage() {
  const { user, loading: authLoading } = useUser();
  const db = getFirestore();
  const router = useRouter();
  const listingsRef = collection(db, 'listings');
  const { data: listings, loading } = useCollection(listingsRef);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'approved' });
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'rejected' });
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  const pending = listings?.filter(l => l.status === 'pending') || [];
  const selected = listings?.find(l => l.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto h-screen sticky top-0">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black">StayFloow Admin</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs opacity-70 uppercase tracking-widest font-black">Validation des annonces</p>
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
                <span className="text-[10px] text-slate-400 font-bold uppercase">Nouveau</span>
              </div>
              <h3 className="font-bold text-slate-900 truncate">{l.details?.name || 'Sans nom'}</h3>
              <p className="text-xs text-slate-500 truncate font-medium">{l.location?.address}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail View */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div>
                <h2 className="text-3xl font-black text-slate-900">{selected.details?.name}</h2>
                <div className="flex items-center gap-4 mt-2 text-slate-500">
                  <div className="flex items-center gap-1 font-bold"><MapPin className="h-4 w-4 text-primary" /> {selected.location?.address}</div>
                  <div className="flex items-center gap-1 font-black text-primary bg-primary/5 px-3 py-1 rounded-full">{selected.price} DA</div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => handleReject(selected.id)} className="border-destructive text-destructive hover:bg-destructive/10 h-12 px-6 font-black rounded-xl">
                  <XCircle className="mr-2 h-4 w-4" /> Rejeter
                </Button>
                <Button onClick={() => handleApprove(selected.id)} className="bg-green-600 hover:bg-green-700 text-white font-black h-12 px-8 rounded-xl shadow-xl shadow-green-600/20">
                  <CheckCircle className="mr-2 h-4 w-4" /> Approuver l'annonce
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h4 className="font-black mb-6 text-slate-400 uppercase text-[10px] tracking-widest">Coordonnées Partenaire</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3"><Users className="h-5 w-5 text-primary" /> <span className="font-black text-slate-800">{selected.partnerInfo?.firstName} {selected.partnerInfo?.lastName}</span></div>
                    <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-slate-400" /> <span className="text-sm font-bold">{selected.partnerInfo?.email}</span></div>
                    <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-slate-400" /> <span className="text-sm font-black">{selected.partnerInfo?.phone}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <h4 className="font-black mb-6 text-slate-400 uppercase text-[10px] tracking-widest">Détails & Équipements</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected.details?.amenities?.map((a: string) => (
                      <Badge key={a} variant="secondary" className="bg-slate-100 font-bold px-3 py-1">{a}</Badge>
                    ))}
                  </div>
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-l-4 border-primary">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      "{selected.details?.description}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h4 className="font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest text-xs"><ImageIcon className="h-5 w-5 text-primary" /> Galerie Photos ({selected.photos?.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selected.photos?.map((p: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-2xl overflow-hidden shadow-lg group border-2 border-white">
                    <Image src={p} alt="Listing Photo" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    {i === 0 && <Badge className="absolute bottom-2 left-2 bg-primary font-black text-[8px]">PHOTO PRINCIPALE</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <Clock className="h-20 w-20 mb-4 opacity-20" />
            <h3 className="text-2xl font-black">Sélectionnez une annonce</h3>
            <p className="font-medium">Choisissez un partenaire dans la liste de gauche pour valider ses informations.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
