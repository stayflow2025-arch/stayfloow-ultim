"use client";

import React, { useState } from "react";
import { 
  Users, Mail, ExternalLink, Send, 
  Search, Filter, CheckCircle, XCircle, 
  Clock, Loader2, ArrowLeft, RefreshCw, MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  useUser, useFirestore, useCollection, 
  useMemoFirebase, initializeFirebase 
} from "@/firebase";
import { 
  collection, query, orderBy, 
  doc, updateDoc, deleteDoc 
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { checkIsAdmin } from "@/lib/admin-config";
import { sendProspectEmailAction } from "@/app/actions/mail";
import { useToast } from "@/hooks/use-toast";

export default function ProspectManagementPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const { toast } = useToast();

  const isAdmin = React.useMemo(() => checkIsAdmin(user), [user]);

  // Fetch prospects in real-time
  const prospectsRef = useMemoFirebase(() => {
    if (!isAdmin || !db || isUserLoading || !user) return null;
    return query(collection(db, 'prospects'), orderBy('createdAt', 'desc'));
  }, [db, isAdmin, isUserLoading, user]);
  
  const { data: prospects, isLoading: prospectsLoading } = useCollection(prospectsRef);

  const filteredProspects = (prospects || []).filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.location && p.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "Tous" || p.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const stats = React.useMemo(() => {
    return {
      total: prospects?.length || 0,
      new: prospects?.filter(p => p.status === 'Nouveau').length || 0,
      contacted: prospects?.filter(p => p.status === 'Contacté').length || 0,
      converted: prospects?.filter(p => p.status === 'Converti').length || 0
    };
  }, [prospects]);

  const handleSendInvitation = async (prospect: any) => {
    if (!prospect.email) {
      toast({
        title: "Erreur",
        description: "Ce prospect n'a pas d'adresse e-mail.",
        variant: "destructive",
      });
      return;
    }

    setSendingEmailId(prospect.id);
    try {
      const res = await sendProspectEmailAction({
        prospectName: prospect.name,
        prospectEmail: prospect.email,
        sourcePlatform: prospect.sourcePlatform
      });

      if (res?.success) {
        // Mettre à jour le statut dans Firestore
        const prospectRef = doc(db, 'prospects', prospect.id);
        await updateDoc(prospectRef, {
          status: 'Contacté',
          updatedAt: new Date().toISOString()
        });
        
        toast({
          title: "Succès",
          description: `Invitation envoyée à ${prospect.name}`,
        });
      }
    } catch (error) {
      console.error("Error sending prospect email:", error);
      toast({
        title: "Erreur",
        description: "L'e-mail n'a pas pu être envoyé.",
        variant: "destructive",
      });
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const prospectRef = doc(db, 'prospects', id);
      await updateDoc(prospectRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating prospect status:", error);
    }
  };

  const handleDeleteProspect = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce prospect ?")) return;
    try {
      await deleteDoc(doc(db, 'prospects', id));
    } catch (error) {
      console.error("Error deleting prospect:", error);
    }
  };

  if (isUserLoading || prospectsLoading) {
    return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user || !isAdmin) {
    return <div className="p-10 text-center">Accès restreint.</div>;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] p-8 space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="bg-white rounded-full shadow-sm" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CRM Prospection B2B</h1>
            <p className="text-slate-500 font-medium italic">Gérer les invitations automatiques via Zapier / Apify / PhantomBuster.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex items-center px-4 py-2 border-none shadow-sm h-fit bg-white hover:bg-slate-50 transition-all group"
            onClick={() => toast({ title: "Live Sync", description: "La synchronisation en temps réel est active via Firestore." })}
          >
            <RefreshCw className="h-3 w-3 mr-2 text-primary group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Sync Live Active</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatMiniCard title="Total Prospects" value={stats.total} icon={<Users />} color="blue" />
        <StatMiniCard title="Nouveaux" value={stats.new} icon={<Clock />} color="orange" />
        <StatMiniCard title="Contactés" value={stats.contacted} icon={<Mail />} color="indigo" />
        <StatMiniCard title="Convertis" value={stats.converted} icon={<CheckCircle />} color="green" />
      </div>

      <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between p-6">
          <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Filter className="h-4 w-4" /> Liste des Cibles
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              {["Tous", "Hôtel", "Voiture", "Circuit"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                    typeFilter === t ? "bg-primary text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                className="pl-9 h-10 rounded-xl border-slate-200 shadow-sm" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50/50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Prospect</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Source / Lieu</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProspects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{p.name}</span>
                        <span className="text-xs font-bold text-slate-400">{p.email || p.phone || "No contact"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <TypeBadge type={p.type || 'Autre'} />
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-500">
                      <div className="flex flex-col">
                        <Badge variant="outline" className="w-fit mb-1 border-slate-200 text-slate-400 uppercase text-[9px] font-black">{p.sourcePlatform}</Badge>
                        <span className="text-[11px] opacity-70">{p.location || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {p.propertyLink && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={p.propertyLink} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          onClick={() => handleSendInvitation(p)}
                          disabled={sendingEmailId === p.id}
                          className={cn(
                            "rounded-full h-8 px-4 font-black uppercase text-[10px] inline-flex items-center gap-2",
                            p.status === 'Contacté' ? "bg-slate-200 text-slate-500 hover:bg-slate-300" : "bg-primary text-white hover:bg-primary/90"
                          )}
                        >
                          {sendingEmailId === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          {p.status === 'Contacté' ? 'Re-inviter' : 'Inviter'}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(p.id, 'Converti')} title="Marquer comme converti">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteProspect(p.id)} className="hover:text-red-500">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProspects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <MessageSquare className="h-10 w-10 text-slate-200" />
                        <p className="text-slate-400 font-bold">Aucun prospect trouvé dans la collection Firestore.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatMiniCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-emerald-50 text-emerald-600"
  };
  return (
    <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden p-6 flex flex-col items-center text-center">
      <div className={cn("p-4 rounded-3xl mb-3", colors[color])}>{icon}</div>
      <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{title}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    "Nouveau": "bg-blue-500 text-white",
    "Contacté": "bg-indigo-500 text-white",
    "Converti": "bg-green-500 text-white",
    "Refusé": "bg-slate-400 text-white"
  };
  return (
    <Badge className={cn("border-none px-3 font-black uppercase text-[10px] rounded-full", styles[status] || "bg-slate-200")}>
      {status}
    </Badge>
  );
}

function TypeBadge({ type }: { type: string }) {
  const styles: any = {
    "Hôtel": "bg-amber-100 text-amber-700 border-amber-200",
    "Voiture": "bg-blue-100 text-blue-700 border-blue-200",
    "Circuit": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Autre": "bg-slate-100 text-slate-600 border-slate-200"
  };
  return (
    <Badge variant="outline" className={cn("px-2.5 py-0.5 font-black uppercase text-[9px] rounded-lg", styles[type] || styles["Autre"])}>
      {type}
    </Badge>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
