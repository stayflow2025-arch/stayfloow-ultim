
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, XCircle, Clock, MapPin, Phone, 
  Mail, Users, Image as ImageIcon, Loader2, ArrowLeft,
  Bed, Bath, Utensils, Sofa, Trees, Star, Gauge, Fuel, Calendar as CalendarIcon, Languages
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminValidatePage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id');

  const listingsRef = useMemoFirebase(() => collection(db, 'listings'), [db]);
  const { data: listings, isLoading: loading } = useCollection(listingsRef);
  const [selectedId, setSelectedId] = useState<string | null>(initialId);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login");
    }
  }, [user, authLoading, router]);

  const handleApprove = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'approved' });
    if (selectedId === id) setSelectedId(null);
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, 'listings', id), { status: 'rejected' });
    if (selectedId === id) setSelectedId(null);
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;

  const pending = listings?.filter(l => l.status === 'pending') || [];
  const selected = listings?.find(l => l.id === selectedId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar List */}
      <aside className="w-full md:w-96 bg-white border-r border-slate-200 overflow-y-auto h-screen sticky top-0 shadow-xl z-10">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-black">StayFloow Admin</h1>
            <Button variant="ghost" size="sm" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] opacity-70 uppercase tracking-widest font-black">Validation des nouvelles annonces</p>
        </div>
        <div className="p-4 space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 mb-4">À valider ({pending.length})</h2>
          {pending.length === 0 && (
            <div className="text-center py-20">
              <CheckCircle className="h-12 w-12 text-green-100 mx-auto mb-4" />
              <p className="text-slate-400 text-sm font-bold">Tout est à jour !</p>
            </div>
          )}
          {pending.map(l => (
            <div 
              key={l.id} 
              onClick={() => setSelectedId(l.id)}
              className={cn(
                "p-5 rounded-2xl border-2 transition-all cursor-pointer group",
                selectedId === l.id ? "border-primary bg-primary/5 shadow-lg scale-[1.02]" : "border-slate-50 hover:border-slate-200 bg-white"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <Badge variant="secondary" className="text-[9px] uppercase font-black bg-slate-100 text-slate-600">
                  {l.category === 'accommodation' ? 'Hébergement' : l.category === 'car_rental' ? 'Véhicule' : 'Circuit'}
                </Badge>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              </div>
              <h3 className="font-black text-slate-900 truncate mb-1 group-hover:text-primary transition-colors">{l.details?.name || 'Sans nom'}</h3>
              <p className="text-[10px] text-slate-400 truncate font-bold uppercase tracking-tight flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {l.location?.address}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* Detail View */}
      <main className="flex-1 p-8 overflow-y-auto">
        {selected ? (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Sticky Detail */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className="bg-primary/10 text-primary font-black text-[10px] uppercase">Nouvelle Soumission</Badge>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {selected.id}</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selected.details?.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-slate-500">
                  <div className="flex items-center gap-1.5 font-bold text-sm"><MapPin className="h-4 w-4 text-primary" /> {selected.location?.address}</div>
                  <div className="h-1 w-1 bg-slate-300 rounded-full" />
                  <div className="flex items-center gap-1.5 font-black text-primary bg-primary/5 px-4 py-1.5 rounded-full text-lg">{selected.price.toLocaleString()} DA</div>
                </div>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <Button variant="outline" onClick={() => handleReject(selected.id)} className="flex-1 lg:flex-none border-red-200 text-red-600 hover:bg-red-50 h-14 px-8 font-black rounded-2xl transition-all">
                  <XCircle className="mr-2 h-5 w-5" /> Rejeter
                </Button>
                <Button onClick={() => handleApprove(selected.id)} className="flex-1 lg:flex-none bg-primary hover:bg-primary/90 text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <CheckCircle className="mr-2 h-5 w-5" /> Approuver l'annonce
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Infos Partenaire */}
              <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-10">
                  <h4 className="font-black mb-8 text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full" /> Coordonnées Partenaire
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="bg-primary/10 p-3 rounded-xl text-primary"><Users className="h-6 w-6" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase">Propriétaire</p>
                        <p className="font-black text-slate-800">{selected.partnerInfo?.firstName} {selected.partnerInfo?.lastName}</p>
                      </div>
                    </div>
                    <div className="space-y-4 px-2">
                      <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-slate-400" /> <span className="text-sm font-bold text-slate-600">{selected.partnerInfo?.email}</span></div>
                      <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-slate-400" /> <span className="text-sm font-black text-slate-900">{selected.partnerInfo?.phone}</span></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Composition & Détails */}
              <Card className="lg:col-span-2 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
                <CardContent className="p-10 space-y-8">
                  <h4 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <div className="h-1 w-4 bg-secondary rounded-full" /> Spécifications & Composition
                  </h4>
                  
                  {/* Grille de composition dynamique */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selected.category === 'accommodation' && (
                      <>
                        <SpecItem icon={<Bed/>} label="Chambres" value={selected.details?.roomsCount || 0} />
                        <SpecItem icon={<Bath/>} label="Salles de bain" value={selected.details?.bathroomsCount || 0} />
                        <SpecItem icon={<Sofa/>} label="Salons" value={selected.details?.livingRoomsCount || 0} />
                        <SpecItem icon={<Trees/>} label="Jardins" value={selected.details?.gardensCount || 0} />
                      </>
                    )}
                    {selected.category === 'car_rental' && (
                      <>
                        <SpecItem icon={<Users/>} label="Places" value={selected.details?.seats || 5} />
                        <SpecItem icon={<Gauge/>} label="Boîte" value={selected.details?.transmission || 'M'} />
                        <SpecItem icon={<Fuel/>} label="Énergie" value={selected.details?.fuel || 'D'} />
                        <SpecItem icon={<Star/>} label="Année" value={selected.details?.year || '2023'} />
                      </>
                    )}
                    {selected.category === 'circuit' && (
                      <>
                        <SpecItem icon={<Clock/>} label="Durée" value={selected.details?.duration || '1j'} />
                        <SpecItem icon={<Users/>} label="Max Groupe" value={selected.details?.maxGroupSize || 10} />
                        <SpecItem icon={<Languages/>} label="Langues" value={selected.details?.languages?.length || 2} />
                        <SpecItem icon={<Star/>} label="Difficulté" value="Modéré" />
                      </>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Équipements déclarés</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.details?.amenities?.map((a: string) => (
                        <Badge key={a} variant="secondary" className="bg-primary/5 text-primary border-primary/10 font-bold px-4 py-1.5 rounded-full text-[11px]">{a}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-3xl border-l-4 border-primary">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest italic">Description commerciale</p>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                      "{selected.details?.description}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Galerie Photos */}
            <div className="space-y-6">
              <h4 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-widest text-xs">
                <ImageIcon className="h-6 w-6 text-primary" /> Galerie Photos ({selected.photos?.length || 0})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {selected.photos?.map((p: string, i: number) => (
                  <div key={i} className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl group border-4 border-white cursor-zoom-in hover:scale-[1.05] transition-transform duration-500">
                    <Image src={p} alt="Listing Photo" fill className="object-cover" />
                    {i === 0 && <Badge className="absolute bottom-3 left-3 bg-primary font-black text-[8px] px-2 py-1 shadow-lg">IMAGE MAÎTRESSE</Badge>}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <Button variant="ghost" size="icon" className="text-white"><ImageIcon/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <div className="bg-white p-12 rounded-[3rem] shadow-sm flex flex-col items-center gap-6">
              <Clock className="h-24 w-24 opacity-10 animate-pulse" />
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black text-slate-400">Sélectionnez une demande</h3>
                <p className="font-medium max-w-xs mx-auto">Choisissez un partenaire dans la liste de gauche pour auditer ses informations avant mise en ligne.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SpecItem({ icon, label, value }: { icon: any, label: string, value: any }) {
  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary transition-colors">
      <div className="text-primary mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}
