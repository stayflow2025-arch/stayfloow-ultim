"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, X, Send, Headset, Loader2, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { chatWithSupport } from "@/ai/flows/customer-support-flow";
import { ScrollArea } from "./ui/scroll-area";

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function CustomerSupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Bonjour ! Je suis l'assistant StayFloow. Comment puis-je vous aider aujourd'hui ? (Si vous avez une réservation, précisez votre numéro STxxxx)" }
  ]);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage = input.trim();
    setInput("");
    
    // Ajouter le message de l'utilisateur immédiatement
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    startTransition(async () => {
      try {
        // Détecter un éventuel ID de réservation dans le texte (STxxxx)
        const stMatch = userMessage.match(/ST\d{4}/i);
        const resId = stMatch ? stMatch[0].toUpperCase() : undefined;

        const response = await chatWithSupport({
          message: userMessage,
          history: messages,
          reservationId: resId
        });

        setMessages(prev => [...prev, { role: 'model', content: response.response }]);
      } catch (error) {
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: "Désolé, j'ai rencontré une petite erreur de connexion. Pouvez-vous reformuler ?" 
        }]);
      }
    });
  };

  return (
    <>
      {/* Bouton flottant */}
      <div
        className={cn(
          "fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out transform",
          isOpen ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
        )}
      >
        <Button
          onClick={handleToggle}
          className="rounded-full shadow-2xl w-16 h-16 flex items-center justify-center bg-primary hover:bg-primary/90 text-white border-4 border-white active:scale-95 transition-all"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>

      {/* Fenêtre de chat */}
      <div
        className={cn(
          "fixed bottom-8 right-8 z-50 w-[90vw] md:w-[400px] transition-all duration-500 ease-in-out transform origin-bottom-right",
          isOpen 
            ? "translate-y-0 scale-100 opacity-100" 
            : "translate-y-10 scale-90 opacity-0 pointer-events-none"
        )}
      >
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white ring-1 ring-black/5 flex flex-col h-[550px]">
          <CardHeader className="bg-slate-900 text-white p-6 shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-xl">
                  <Headset className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    Support StayFloow <Sparkles className="h-3 w-3 text-secondary" />
                  </CardTitle>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">IA Entraînée • Réponse Instantanée</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleToggle}
                className="text-white hover:bg-white/10 rounded-full h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-hidden flex flex-col bg-slate-50/50">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%] space-y-1",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all",
                      msg.role === 'user' 
                        ? "bg-primary text-white rounded-br-none" 
                        : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] font-black text-slate-300 uppercase px-1">
                      {msg.role === 'user' ? 'Vous' : 'StayFloow AI'}
                    </span>
                  </div>
                ))}
                {isPending && (
                  <div className="mr-auto items-start animate-in fade-in duration-300">
                    <div className="bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs font-bold text-slate-400">L'expert réfléchit...</span>
                    </div>
                  </div>
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3 items-center">
              <input 
                placeholder="Posez votre question..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isPending}
                className="flex-1 h-12 rounded-xl bg-slate-50 border-none px-4 text-sm font-medium focus:ring-2 ring-primary/20 outline-none"
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isPending}
                className="h-12 w-12 rounded-xl bg-primary text-white shadow-lg shrink-0"
              >
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
