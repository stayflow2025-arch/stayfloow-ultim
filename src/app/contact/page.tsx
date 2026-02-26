
'use client';

import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  Clock, 
  ShieldCheck,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from 'next/link';

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message envoyé !",
      description: "Notre équipe vous répondra dans les plus brefs délais.",
    });
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Simple */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search?type=accommodations" className="hover:text-secondary transition-colors font-medium">Séjours</Link>
            <Link href="/cars" className="hover:text-secondary transition-colors font-medium">Voitures</Link>
            <Link href="/circuits" className="hover:text-secondary transition-colors font-medium">Circuits</Link>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Contactez-nous</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Une question sur votre réservation ? Besoin d'aide pour devenir partenaire ? Notre équipe est là pour vous accompagner.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informations de contact */}
          <div className="space-y-6">
            <ContactInfoCard 
              icon={<Phone className="h-6 w-6" />}
              title="Téléphone"
              content="+213 (0) 550 00 00 00"
              subContent="Du dimanche au jeudi, 9h - 18h"
            />
            <ContactInfoCard 
              icon={<Mail className="h-6 w-6" />}
              title="Email"
              content="support@stayfloow.com"
              subContent="Réponse sous 24h ouvrées"
            />
            <ContactInfoCard 
              icon={<MapPin className="h-6 w-6" />}
              title="Bureaux"
              content="Sidi Yahia, Hydra, Alger"
              subContent="Algérie"
            />
            
            <Card className="bg-primary text-white overflow-hidden border-none shadow-xl">
              <CardContent className="p-8">
                <ShieldCheck className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-black mb-2">Support Prioritaire</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Tous nos clients bénéficient d'une assistance dédiée pour garantir une expérience de voyage exceptionnelle sur StayFloow.com.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire de contact */}
          <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-bold">Prénom</Label>
                    <Input id="firstName" placeholder="Votre prénom" className="h-12 border-slate-200" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-bold">Nom</Label>
                    <Input id="lastName" placeholder="Votre nom" className="h-12 border-slate-200" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold">Email professionnel</Label>
                  <Input id="email" type="email" placeholder="votre@email.com" className="h-12 border-slate-200" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-bold">Sujet</Label>
                  <Input id="subject" placeholder="Comment pouvons-nous vous aider ?" className="h-12 border-slate-200" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="font-bold">Message</Label>
                  <Textarea id="message" placeholder="Détaillez votre demande..." className="min-h-[150px] border-slate-200" required />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all rounded-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Envoyer le message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="bg-primary text-white py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <Link href="/" className="text-3xl font-black mb-6 block">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <p className="opacity-50 text-sm">© 2025 StayFloow.com. Le portail de voyage numéro 1 en Afrique.</p>
        </div>
      </footer>
    </div>
  );
}

function ContactInfoCard({ icon, title, content, subContent }: { icon: any, title: string, content: string, subContent: string }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-white rounded-2xl">
      <CardContent className="p-6 flex items-start gap-4">
        <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0">
          {icon}
        </div>
        <div>
          <h4 className="font-black text-slate-900">{title}</h4>
          <p className="text-primary font-bold">{content}</p>
          <p className="text-xs text-slate-400 mt-1">{subContent}</p>
        </div>
      </CardContent>
    </Card>
  );
}
