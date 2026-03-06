"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, addDoc, serverTimestamp, limit } from "firebase/firestore";
import { 
  Send, ArrowLeft, Loader2, MessageCircle, 
  User as UserIcon, Phone, Info, 
  ShieldCheck, LayoutDashboard
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function MessagesPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConvId = searchParams.get('id');
  
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Liste des conversations réelles
  const convsRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastAt", "desc")
    );
  }, [db, user]);

  const { data: conversations, isLoading: convsLoading } = useCollection(convsRef);

  // 2. Messages de la conversation active - Standardisé
  const messagesRef = useMemoFirebase(() => {
    if (!activeConvId || !db) return null;
    return query(
      collection(db, "conversations", activeConvId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );
  }, [db, activeConvId]);

  const { data: messages, isLoading: messagesLoading } = useCollection(messagesRef);

  useEffect(() => {
    if (messages && scrollRef.current) {
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvId || !user) return;

    const msg = newMessage;
    setNewMessage("");

    await addDoc(collection(db, "conversations", activeConvId, "messages"), {
      senderId: user.uid,
      text: msg,
      createdAt: serverTimestamp(),
    });
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  return (
    <div className="h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-primary text-white py-4 px-6 shadow-xl shrink-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-black uppercase tracking-tight">Messagerie StayFloow</h1>
          </div>
          <Badge className="bg-green-600 border-none font-black text-[10px]">CONNEXION SÉCURISÉE</Badge>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden max-w-7xl mx-auto w-full">
        {/* Sidebar Conversations */}
        <aside className={cn(
          "w-full md:w-96 bg-white border-r flex flex-col shadow-inner",
          activeConvId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b bg-slate-50/50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Mes Discussions</h2>
            <p className="text-[10px] font-bold text-slate-300">Organisez vos séjours avec les hôtes.</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {convsLoading ? (
              <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-primary/20 h-10 w-10" /></div>
            ) : conversations?.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <MessageCircle className="h-12 w-12 text-slate-100 mx-auto" />
                <p className="text-slate-400 font-bold text-sm">Aucune conversation trouvée.</p>
              </div>
            ) : (
              conversations?.map((conv: any) => (
                <div 
                  key={conv.id} 
                  onClick={() => router.push(`/profile/messages?id=${conv.id}`)}
                  className={cn(
                    "p-6 border-b cursor-pointer transition-all hover:bg-slate-50 group",
                    activeConvId === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-black text-slate-900 group-hover:text-primary transition-colors">Hôte StayFloow</p>
                    {conv.lastAt && <span className="text-[9px] font-black text-slate-300 uppercase">{format(new Date(conv.lastAt), "dd/MM")}</span>}
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMessage || 'Nouvelle demande...'}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={cn(
          "flex-1 bg-white flex flex-col relative",
          !activeConvId ? "hidden md:flex items-center justify-center bg-slate-50" : "flex"
        )}>
          {activeConvId ? (
            <>
              {/* Chat Header */}
              <div className="p-5 border-b bg-white flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary"><UserIcon className="h-6 w-6" /></div>
                  <div>
                    <p className="font-black text-slate-900 leading-none mb-1">Support Hôte</p>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[10px] text-green-600 font-black uppercase">Partenaire Certifié</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary"><Phone className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-primary"><Info className="h-5 w-5" /></Button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#F8FAFC]">
                <div className="flex justify-center mb-8">
                  <div className="bg-white px-4 py-1.5 rounded-full border shadow-sm flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Échanges protégés par StayFloow</span>
                  </div>
                </div>

                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-primary/20" /></div>
                ) : (
                  messages?.map((msg: any) => (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[75%] space-y-1.5",
                      msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
                    )}>
                      <div className={cn(
                        "px-5 py-4 rounded-3xl text-[15px] font-medium shadow-sm transition-all",
                        msg.senderId === user?.uid 
                          ? "bg-primary text-white rounded-br-none shadow-primary/10" 
                          : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
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

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white border-t flex gap-4 items-center">
                <div className="flex-1 relative">
                  <Input 
                    placeholder="Écrivez votre message à l'hôte..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner px-6 font-medium text-slate-700 focus-visible:ring-primary/20"
                  />
                </div>
                <Button type="submit" disabled={!newMessage.trim()} className="h-14 w-14 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95">
                  <Send className="h-6 w-6" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6 animate-in fade-in duration-700">
              <div className="bg-white p-10 rounded-[3rem] shadow-2xl inline-block">
                <MessageCircle className="h-24 w-24 mx-auto text-slate-100" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Messagerie Privée</h3>
                <p className="text-slate-400 font-medium max-w-xs mx-auto">Sélectionnez une discussion à gauche pour contacter un hôte ou obtenir de l'aide.</p>
              </div>
              <Button variant="outline" className="border-primary text-primary font-black rounded-xl" onClick={() => router.push('/profile/bookings')}>
                <LayoutDashboard className="mr-2 h-4 w-4" /> Retour aux réservations
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
