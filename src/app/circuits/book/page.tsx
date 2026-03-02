
"use client";

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, Calendar as CalendarIcon, Users, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/context/currency-context';
import { sendBookingConfirmationEmail } from '@/lib/mail';
import { circuits as mockCircuits } from '@/lib/data';
import { format } from 'date-fns';
import { CrossSellCard } from '@/components/cross-sell-card';

const bookingSchema = z.object({
    fullName: z.string().min(2, "Nom complet requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(6, "Numéro requis"),
    dialCode: z.string().min(1, "Indicatif requis"),
    paymentMethod: z.string().min(1, "Obligatoire"),
    agreeToTerms: z.boolean().refine(val => val === true, "Veuillez accepter les conditions"),
});

function CircuitBookingContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const db = useFirestore();
    const { toast } = useToast();
    const { formatPrice } = useCurrency();
    
    const tourId = searchParams.get('id');
    const tourDate = searchParams.get('date');
    const tickets = searchParams.get('tickets') ? JSON.parse(searchParams.get('tickets')!) : {};
    const totalAmount = Number(searchParams.get('total')) || 0;

    const { data: dbCircuit, loading } = useDoc(tourId ? doc(db, 'listings', tourId) : null);
    const circuit = dbCircuit || mockCircuits.find(c => c.id === tourId);

    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        resolver: zodResolver(bookingSchema),
        defaultValues: { fullName: "", email: "", phone: "", dialCode: "+213", paymentMethod: 'card', agreeToTerms: false },
    });

    const onSubmit = async (values: any) => {
        setIsSubmitting(true);
        const resNum = `ST-TICKET-${Math.floor(1000 + Math.random() * 8999)}`;
        try {
            await sendBookingConfirmationEmail({
                customerName: values.fullName, 
                customerEmail: values.email, 
                reservationNumber: resNum,
                itemName: circuit?.details?.name || circuit?.title || "Circuit", 
                itemType: 'circuit',
                hostName: "StayFloow Guide", 
                hostEmail: "contact@stayfloow.com", 
                hostPhone: "+213 550 00 00 00",
                bookingDetails: { startDate: tourDate, participants: Object.values(tickets).reduce((a: any, b: any) => a + b, 0) as number, totalPrice: totalAmount }
            });
            setIsConfirmed(true);
            toast({ title: "Réservation réussie !" });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) { 
            toast({ variant: "destructive", title: "Erreur lors de l'envoi de l'email." });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin h-10 w-10 mx-auto text-primary" /></div>;
    if (!circuit) return <div className="p-20 text-center">Erreur de chargement.</div>;

    const name = circuit.details?.name || circuit.title;
    const photos = circuit.photos || circuit.images || ['https://picsum.photos/seed/tour/800/600'];
    const location = circuit.location?.address || circuit.location || "Alger";

    if (isConfirmed) return (
        <div className="container mx-auto px-4 py-20 max-w-5xl space-y-12">
            <Card className="border-none shadow-2xl p-12 rounded-[2.5rem] bg-white text-center max-w-2xl mx-auto animate-in zoom-in-95">
                <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-3xl font-black mb-4">Votre aventure commence bientôt !</h1>
                <p className="text-xl text-slate-600 mb-8 font-medium">Les détails de votre ticket ont été envoyés par email.</p>
                <Button className="bg-primary h-14 px-10 font-black rounded-xl text-lg shadow-xl" asChild>
                  <Link href="/">Retour à l'accueil</Link>
                </Button>
            </Card>
            <CrossSellCard location={location.split(',')[0].trim()} bookedItemType="circuit" />
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black"><ArrowLeft className="mr-2 h-4 w-4" /> Retour au circuit</Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-xl font-black uppercase">1. Vos Informations</CardTitle></CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                                        <FormItem><FormLabel className="font-bold">Nom complet</FormLabel><FormControl><Input placeholder="Ex: Sofiane Belkacem" className="h-14 rounded-xl bg-slate-50 border-slate-100" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel className="font-bold">Email</FormLabel><FormControl><Input className="h-14 rounded-xl bg-slate-50 border-slate-100" type="email" placeholder="votre@email.com" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <div className="space-y-2">
                                            <FormLabel className="font-bold">Téléphone (WhatsApp)</FormLabel>
                                            <div className="flex gap-2">
                                                <FormField control={form.control} name="dialCode" render={({ field }) => (
                                                    <FormItem className="w-24"><FormControl><Input className="h-14 text-center font-bold bg-slate-50 border-slate-100 rounded-xl" {...field} /></FormControl></FormItem>
                                                )}/>
                                                <FormField control={form.control} name="phone" render={({ field }) => (
                                                    <FormItem className="flex-1"><FormControl><Input className="h-14 rounded-xl bg-slate-50 border-slate-100" placeholder="550 00 00 00" {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                                <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-xl font-black uppercase">2. Mode de Paiement</CardTitle></CardHeader>
                                <CardContent className="p-8">
                                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Label htmlFor="card" className="flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all border-slate-100">
                                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                                <CreditCard className="h-6 w-6 text-primary" /> <span className="font-black">Carte Bancaire</span>
                                            </Label>
                                            <Label htmlFor="paypal" className="flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all border-slate-100">
                                                <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" /> <span className="font-black">PayPal</span>
                                            </Label>
                                        </RadioGroup>
                                    )}/>
                                </CardContent>
                            </Card>

                            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <Label className="text-sm font-medium leading-tight text-slate-600 cursor-pointer">Je confirme l'exactitude des informations et j'accepte les conditions de StayFloow.com.</Label>
                                </FormItem>
                            )}/>

                            <Button type="submit" disabled={isSubmitting} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl">
                                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : `Confirmer et Payer ${formatPrice(totalAmount)}`}
                            </Button>
                        </form>
                    </Form>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
                        <div className="relative h-48 w-full"><Image src={photos[0]} alt="tour" fill className="object-cover" /></div>
                        <CardHeader className="p-8 pb-4"><CardTitle className="text-2xl font-black text-primary leading-tight">{name}</CardTitle></CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest"><CalendarIcon className="h-4 w-4" /> {tourDate ? format(new Date(tourDate), "dd MMM yyyy") : "Date à confirmer"}</div>
                                <div className="space-y-2">
                                    {Object.entries(tickets).map(([tid, count]: [string, any]) => {
                                        if (count === 0) return null;
                                        const ticketTypes = circuit.details?.ticketTypes || circuit.ticketTypes || [];
                                        const ttype = ticketTypes.find((t: any) => t.id === tid) || { name: tid, price: circuit.price || circuit.pricePerPerson };
                                        return (
                                            <div key={tid} className="flex justify-between text-sm font-black text-slate-700">
                                                <span>{count} x {ttype.name}</span>
                                                <span>{formatPrice(ttype.price * count)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-end pt-2">
                                <div><p className="text-[10px] font-black text-slate-400 uppercase">Total TTC</p><p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(totalAmount)}</p></div>
                                <ShieldCheck className="h-10 w-10 text-primary opacity-20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CircuitBookingPage() {
    return <Suspense fallback={<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-primary" /></div>}><CircuitBookingContent /></Suspense>;
}
