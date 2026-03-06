"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { 
  MessageSquare, Search, ArrowLeft, Loader2, 
  Send, ShieldCheck, Info
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { checkIsAdmin } from "@/lib/admin-config";

function AdminMessagingContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeId = searchParams.get('id');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Détection robuste de l'admin
  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);

  // Redirection si non-admin
  useEffect(() => {
    if (!isUserLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isUserLoading, isAdmin, router]);

  // Toutes les conversations de la plateforme - Uniquement si ADMIN MAÎTRE
  const convsRef = useMemoFirebase(() => {
    if (!isAdmin || !db || isUserLoading || !user) return null;
    return query(collection(db, "conversations"), orderBy("lastAt", "desc"), limit(100));
  }, [db, isAdmin, isUserLoading, user]);
  const { data: conversations, isLoading: convsLoading } = useCollection(convsRef);

  // Messages de la conversation sélectionnée - Standardisé via useCollection
  const messagesRef = useMemoFirebase(() => {
    if (!activeId || !isAdmin || !db || !user) return null;
    return query(collection(db, "conversations", activeId, "messages"), orderBy("createdAt", "asc"), limit(100));
  }, [db, activeId, isAdmin, user]);
  
  const { data: messages, isLoading: messagesLoading } = useCollection(messagesRef);

  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (messages && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages]);

  const handleSendAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeId || !user || !isAdmin) return;

    const msg = replyText;
    setReplyText("");

    addDoc(collection(db, "conversations", activeId, "messages"), {
      senderId: user.uid,
      text: `[SUPPORT ADMIN] ${msg}`,
      createdAt: serverTimestamp(),
      isAdminMessage: true
    });
  };

  if (isUserLoading || !isAdmin || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-primary h-12 w-12 mx-auto" />
          <p className="text-white/50 font-black uppercase tracking-widest text-[10px]">Authentification Sécurisée...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="bg-slate-800 text-white flex items-center h-16 shadow-lg z-50 shrink-0">
        <div className="w-80 flex items-center px-6 border-r border-slate-700 h-full">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="mr-4 text-white hover:bg-white/10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-black uppercase tracking-tight text-lg">Support Global</h1>
        </div>
        <div className="flex-1 px-8 flex items-center gap-4">
          <Badge className="bg-amber-50 text-amber-900 font-black text-[10px]">MODE MODÉRATION ACTIF</Badge>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Surveillance des échanges client ↔ partenaire</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={cn(
          "w-full md:w-80 bg-white border-r flex flex-col shadow-inner shrink-0",
          activeId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Rechercher ID..." className="pl-10 h-10 rounded-xl bg-white text-xs border-slate-200" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {convsLoading ? (
              <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary/20" /></div>
            ) : conversations?.length === 0 ? (
              <div className="p-12 text-center text-slate-300 font-bold text-sm">Aucune discussion active.</div>
            ) : (
              conversations?.map((conv: any) => (
                <div 
                  key={conv.id} 
                  onClick={() => router.push(`/admin/messaging?id=${conv.id}`)}
                  className={cn(
                    "p-5 border-b cursor-pointer transition-all hover:bg-slate-50 group",
                    activeId === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-slate-900 text-sm truncate uppercase tracking-tighter">ID: {conv.id.substring(0,12)}</p>
                    {conv.lastAt && <span className="text-[9px] font-black text-slate-300 uppercase">{format(new Date(conv.lastAt), "dd/MM")}</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage || 'Nouvelle conversation'}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-[8px] font-black uppercase text-slate-400">{conv.participants?.length || 0} participants</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        <main className={cn(
          "flex-1 bg-[#F8FAFC] flex flex-col relative",
          !activeId ? "hidden md:flex items-center justify-center" : "flex"
        )}>
          {activeId ? (
            <>
              <div className="p-5 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-2xl text-amber-600"><MessageSquare className="h-6 w-6" /></div>
                  <div>
                    <p className="font-black text-slate-900 leading-none mb-1 uppercase">Conversation #{activeId.substring(0,8)}</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      <p className="text-[10px] text-amber-600 font-black uppercase">Canal de support sécurisé</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary"><Info className="h-5 w-5" /></Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="flex justify-center mb-10">
                  <div className="bg-slate-900 text-white px-6 py-2 rounded-full shadow-2xl flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-[#39FF14]" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Historique audité par StayFloow Modération</span>
                  </div>
                </div>

                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary/20 h-10 w-10" /></div>
                ) : (
                  messages?.map((msg: any) => (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[70%] space-y-1.5",
                      msg.isAdminMessage ? "mx-auto items-center w-full" : (msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start")
                    )}>
                      <div className={cn(
                        "px-5 py-4 rounded-3xl text-sm font-medium shadow-sm transition-all",
                        msg.isAdminMessage 
                          ? "bg-slate-800 text-white text-center italic border-2 border-amber-500/30" 
                          : (msg.senderId === user?.uid ? "bg-primary text-white rounded-br-none" : "bg-white text-slate-700 rounded-bl-none border")
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase px-2">
                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "HH:mm", { locale: fr }) : "..."}
                      </span>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              <form onSubmit={handleSendAdminMessage} className="p-6 bg-white border-t flex gap-4 items-center">
                <Input 
                  placeholder="Intervenir dans la discussion en tant qu'administrateur..." 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-medium text-slate-700"
                />
                <Button type="submit" disabled={!replyText.trim()} className="h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-xl hover:bg-slate-800">
                  <Send className="h-6 w-6" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 opacity-20">
              <MessageSquare className="h-32 w-32 mx-auto" />
              <p className="text-2xl font-black uppercase">Sélectionnez une discussion à auditer</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminMessagingPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>}>
      <AdminMessagingContent />
    </Suspense>
  );
}
