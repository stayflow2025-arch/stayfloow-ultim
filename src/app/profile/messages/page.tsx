
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, addDoc, serverTimestamp, onSnapshot, limit } from "firebase/firestore";
import { 
  Send, ArrowLeft, Loader2, MessageCircle, 
  User as UserIcon, Calendar, Info, Phone 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // Liste des conversations
  const convsRef = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastAt", "desc")
    );
  }, [db, user]);

  const { data: conversations, isLoading: convsLoading } = useCollection(convsRef);

  // Messages de la conversation active
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  useEffect(() => {
    if (!activeConvId || !db) return;
    setMessagesLoading(true);
    const q = query(
      collection(db, "conversations", activeConvId, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setMessagesLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsubscribe();
  }, [activeConvId, db]);

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

    // Update conversation meta
    // In production we would use a cloud function or updateDoc here
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-screen bg-slate-100 flex flex-col">
      <header className="bg-primary text-white py-4 px-6 shadow-md shrink-0">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/profile')} className="text-white hover:bg-white/10">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black uppercase tracking-tight">Messagerie StayFloow</h1>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Conversations */}
        <aside className={cn(
          "w-full md:w-80 bg-white border-r flex flex-col",
          activeConvId ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b bg-slate-50">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">Discussions récentes</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto opacity-20" /></div>
            ) : conversations?.length === 0 ? (
              <div className="p-8 text-center text-slate-400 italic text-sm">Aucun message.</div>
            ) : (
              conversations?.map((conv: any) => (
                <div 
                  key={conv.id} 
                  onClick={() => router.push(`/profile/messages?id=${conv.id}`)}
                  className={cn(
                    "p-4 border-b cursor-pointer transition-colors hover:bg-slate-50",
                    activeConvId === conv.id ? "bg-primary/5 border-l-4 border-l-primary" : ""
                  )}
                >
                  <p className="font-bold text-slate-900 truncate">Hôte StayFloow</p>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{format(new Date(conv.lastAt), "dd/MM HH:mm")}</p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Chat Area */}
        <main className={cn(
          "flex-1 bg-white flex flex-col",
          !activeConvId ? "hidden md:flex items-center justify-center text-slate-300" : "flex"
        )}>
          {activeConvId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-full text-primary"><UserIcon className="h-5 w-5" /></div>
                  <div>
                    <p className="font-black text-slate-900">Support Partenaire</p>
                    <p className="text-[10px] text-green-500 font-bold uppercase">En ligne</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400"><Phone className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon" className="text-slate-400"><Info className="h-5 w-5" /></Button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messagesLoading ? (
                  <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin opacity-20" /></div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={cn(
                      "flex flex-col max-w-[80%] space-y-1",
                      msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm",
                        msg.senderId === user?.uid ? "bg-primary text-white rounded-br-none" : "bg-white text-slate-700 rounded-bl-none border"
                      )}>
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {msg.createdAt?.toDate ? format(msg.createdAt.toDate(), "HH:mm") : "..."}
                      </span>
                    </div>
                  ))
                )}
                <div ref={scrollRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-3">
                <Input 
                  placeholder="Écrivez votre message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="h-12 rounded-xl bg-slate-50 border-none shadow-inner"
                />
                <Button type="submit" className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg">
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-4">
              <MessageCircle className="h-20 w-20 mx-auto opacity-10" />
              <p className="font-black uppercase tracking-widest text-sm">Sélectionnez une conversation</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
