
'use client';

import React, { useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, MapPin, Phone, 
  Mail, Users, Image as ImageIcon, Loader2, ArrowLeft,
  Bed, Bath, Utensils, Sofa, Trees, Star, Gauge, Fuel, Languages, Globe, Zap, AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function AdminValidatePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const listingsRef = useMemoFirebase(() => query(collection(db, 'listings'), orderBy('createdAt', 'desc')), [db]);
  const { data: listings, isLoading: loading } = useCollection(listingsRef);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleApprove = (id: string) => {
    const docRef = doc(db, 'listings', id);
    updateDoc(docRef, { status: 'approved' })
      .then(() => {
        toast({ title: "Annonce approuvée" });
        if (selectedId === id) setSelectedId(null);
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
      });
  };

  const handleReject = (id: string) => {
    const docRef = doc(db, 'listings', id);
    updateDoc(docRef, { status: 'rejected' })
      .then(() => {
        toast({ variant: "destructive", title: "Annonce refusée" });
        if (selectedId === id) setSelectedId(null);
      })
      .catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update' }));
      });
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  const pending = listings?.filter(l => l.status === 'pending') || [];
  const selected = listings?.find(l => l.id === (selectedId || initialId));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto h-screen sticky top-0 shadow-xl z-10">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter">StayFloow Admin</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Audit des nouvelles soumissions</p>
        </div>
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">File d'attente ({pending.length})</h2>
          {pending.map(l => (
            <div key={l.id} onClick={() => setSelectedId(l.id)} className={cn("p-5 rounded-2xl border-2 transition-all cursor-pointer group", selectedId === l.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-slate-50 hover:border-slate-200 bg-white")}>
              <Badge variant="secondary" className="text-[9px] uppercase font-black mb-3">{l.category}</Badge>
              <h3 className="font-black text-slate-900 truncate mb-1">{l.details?.name || 'Sans titre'}</h3>
              <p className="text-[10px] text-slate-400 truncate font-bold uppercase flex items-center gap-1"><MapPin className="h-3 w-3" /> {l.location?.address}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 gap-6">
              <div>
                <Badge className="font-black text-[10px] mb-2">STATUT : {selected.status}</Badge>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">{selected.details?.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-4 text-slate-500 font-bold text-sm">
                  <MapPin className="h-4 w-4 text-primary" /> {selected.location?.address}
                  <div className="h-1 w-1 bg-slate-300 rounded-full" />
                  <span className="text-primary bg-primary/5 px-4 py-1.5 rounded-full text-lg">{selected.price.toLocaleString()} {selected.currency || '€'}</span>
                </div>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <Button variant="outline" onClick={() => handleReject(selected.id)} className="flex-1 border-red-200 text-red-600 h-14 px-8 font-black rounded-2xl transition-all uppercase text-[10px]">Refuser</Button>
                <Button onClick={() => handleApprove(selected.id)} className="flex-1 bg-primary text-white h-14 px-10 font-black rounded-2xl shadow-xl transition-all uppercase text-[10px]">Approuver</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-10">
                  <h4 className="font-black mb-8 text-slate-400 uppercase text-[10px] tracking-widest">Dossier Partenaire</h4>
                  <div className="space-y-6">
                    <p className="font-black text-slate-800">{selected.partnerInfo?.firstName} {selected.partnerInfo?.lastName}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-600"><Mail className="h-5 w-5" /> {selected.partnerInfo?.email}</div>
                    <div className="flex items-center gap-3 text-sm text-slate-600"><Phone className="h-5 w-5" /> {selected.partnerInfo?.phone}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-10 space-y-8">
                  <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Spécifications Techniques</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selected.category === 'accommodation' && (
                      <>
                        <SpecItem icon={<Bed/>} label="Chambres" value={selected.details?.roomsCount || 0} />
                        <SpecItem icon={<Bath/>} label="SDB" value={selected.details?.bathroomsCount || 0} />
                        <SpecItem icon={<Sofa/>} label="Salons" value={selected.details?.livingRoomsCount || 0} />
                        <SpecItem icon={<Trees/>} label="Jardins" value={selected.details?.gardensCount || 0} />
                        {selected.details?.singleRoomsCount > 0 && <SpecItem icon={<Bed/>} label="Simple" value={selected.details?.singleRoomsCount} />}
                        {selected.details?.doubleRoomsCount > 0 && <SpecItem icon={<Users/>} label="Double" value={selected.details?.doubleRoomsCount} />}
                        {selected.details?.parentalSuitesCount > 0 && <SpecItem icon={<Star/>} label="Suite King" value={selected.details?.parentalSuitesCount} />}
                      </>
                    )}
                  </div>
                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{selected.details?.description}"</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <h4 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-xs"><ImageIcon className="h-6 w-6 text-primary" /> Galerie Photos ({selected.photos?.length || 0})</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {selected.photos?.map((p: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white"><Image src={p} alt="Audit" fill className="object-cover" /></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">File d'attente vide.</div>
        )}
      </main>
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="text-primary mb-2">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
