
"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { circuits as initialCircuits, pendingCircuits as initialPendingCircuits } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CreditCard, CheckCircle, Calendar as CalendarIcon, Info, ShieldCheck } from 'lucide-react';
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
import { sendBookingConfirmationEmail } from '@/lib/mail';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from "react-day-picker";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const bookingSchema = z.object({
    fullName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Téléphone invalide"),
    adults: z.number().min(1, "Minimum 1 adulte"),
    children: z.number().min(0),
    infants: z.number().min(0),
    paymentMethod: z.string().min(1, "Méthode requise"),
    agreeToTerms: z.boolean().refine(val => val === true, "Obligatoire"),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

function CircuitBookingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [circuit, setCircuit] = useState<any>(null);
    const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
    const [reservationDetails, setReservationDetails] = useState({ number: '', email: '' });
    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [dates, setDates] = useState<DateRange | undefined>(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        return (from && to) ? { from: new Date(from), to: new Date(to) } : undefined;
    });

    useEffect(() => {
        const id = searchParams.get('id') || "circ-1";
        const all = [...initialCircuits, ...initialPendingCircuits];
        const found = all.find(p => String(p.id) === String(id));
        if (found) setCircuit(found);
        else setCircuit(initialCircuits[0]);
    }, [searchParams]);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phone: "",
            adults: Number(searchParams.get('adults')) || 1,
            children: Number(searchParams.get('children')) || 0,
            infants: Number(searchParams.get('infants')) || 0,
            paymentMethod: 'card',
            agreeToTerms: false,
        },
    });

    if (!circuit) return <div className="p-20 text-center">Chargement du circuit...</div>;

    const adults = form.watch('adults');
    const children = form.watch('children');
    const totalPaying = (Number(adults) || 0) + (Number(children) || 0);
    const totalPrice = (Number(circuit.pricePerPerson) || 0) * totalPaying;
    const deposit = totalPrice * 0.20;

    const formatPrice = (p: number) => `${p.toLocaleString('fr-FR')} DZD`;

    const onSubmit = async (values: BookingFormValues) => {
        const resNum = `ST-CIRCUIT-${Math.floor(1000 + Math.random() * 8999)}`;
        setReservationDetails({ number: resNum, email: values.email });
        
        try {
            await sendBookingConfirmationEmail({
                customerName: values.fullName,
                customerEmail: values.email,
                reservationNumber: resNum,
                itemName: circuit.title,
                itemType: 'circuit',
                hostName: circuit.guide?.name || "Guide Stayfloow",
                hostEmail: circuit.guide?.email || "contact@stayfloow.com",
                hostPhone: circuit.guide?.phone || "+213 000 000 000",
                bookingDetails: { 
                    startDate: dates?.from?.toISOString() || new Date().toISOString(), 
                    endDate: dates?.to?.toISOString(),
                    participants: totalPaying 
                }
            });
        } catch (e) { 
            console.error("Erreur d'envoi d'email:", e); 
        }

        setIsBookingConfirmed(true);
        toast({ title: "Réservation confirmée !" });
    };

    if (isBookingConfirmed) {
        return (
            <div className="container mx-auto px-4 py-20 text-center max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="h-16 w-16 text-primary" />
                </div>
                <h1 className="text-3xl font-black mb-4">Réservation terminée !</h1>
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                    N° {reservationDetails.number}. Un e-mail de confirmation a été envoyé à <strong>{reservationDetails.email}</strong>.
                </p>
                <Link href="/"><Button className="bg-primary hover:bg-primary/90 h-12 px-8 font-black">Retour à l'accueil</Button></Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <Button variant="ghost" type="button" onClick={() => router.back()} className="mb-6 font-bold text-slate-600 hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Card className="border-none shadow-lg">
                                <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                                    <CardTitle className="text-lg font-black uppercase">1. Vos Coordonnées</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <FormField control={form.control} name="fullName" render={({ field }) => (
                                        <FormItem><FormLabel className="font-bold">Nom complet</FormLabel><FormControl><Input className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem><FormLabel className="font-bold">Email</FormLabel><FormControl><Input className="h-12" type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                        <FormField control={form.control} name="phone" render={({ field }) => (
                                            <FormItem><FormLabel className="font-bold">Téléphone (WhatsApp)</FormLabel><FormControl><Input className="h-12" type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                                        )}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold">Dates souhaitées</Label>
                                        <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button type="button" className="w-full h-12 justify-start font-bold border border-slate-200 bg-white text-black hover:bg-slate-50">
                                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                                    {dates?.from ? (dates.to ? `${format(dates.from, "dd MMM", { locale: fr })} - ${format(dates.to, "dd MMM", { locale: fr })}` : format(dates.from, "dd MMM", { locale: fr })) : "Sélectionner les dates"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar mode="range" selected={dates} onSelect={setDates} locale={fr} disabled={{ before: new Date() }} />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-lg">
                                <CardHeader className="bg-slate-900 text-white rounded-t-lg">
                                    <CardTitle className="text-lg font-black uppercase">2. Paiement Acompte</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-6">
                                    <Alert className="bg-primary/5 border-primary/20">
                                        <Info className="h-4 w-4 text-primary" />
                                        <AlertTitle className="font-bold text-primary">Acompte de 20% requis</AlertTitle>
                                        <AlertDescription className="text-slate-600">Pour garantir votre départ, un acompte est nécessaire. Le solde sera à régler au guide sur place.</AlertDescription>
                                    </Alert>
                                    
                                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-4">
                                            <div>
                                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                                <Label htmlFor="card" className="flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 transition-all">
                                                    <CreditCard className="mb-2 h-6 w-6 text-primary" /> 
                                                    <span className="font-bold">Carte Bancaire</span>
                                                </Label>
                                            </div>
                                            <div>
                                                <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                                                <Label htmlFor="paypal" className="flex flex-col items-center p-6 border-2 rounded-xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-slate-50 transition-all">
                                                    <div className="mb-2 h-6 w-16 bg-slate-200 rounded animate-pulse" /> 
                                                    <span className="font-bold">PayPal</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}/>
                                </CardContent>
                            </Card>

                            <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                                <FormItem className="flex items-start space-x-3 p-6 border-2 border-slate-100 rounded-xl bg-white shadow-sm">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <Label className="text-sm cursor-pointer leading-tight text-slate-600">J'accepte les conditions de réservation StayFloow.com et je confirme que les informations fournies sont exactes.</Label>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <Button type="submit" className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20">
                                Payer l'acompte : {formatPrice(deposit)}
                            </Button>
                        </form>
                    </Form>
                </div>

                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-2xl border-none overflow-hidden rounded-2xl">
                        <div className="relative h-48 w-full">
                            <Image src={circuit.images[0]} alt={circuit.title} fill className="object-cover" />
                            <div className="absolute top-4 left-4">
                                <span className="bg-primary text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">CIRCUIT VÉRIFIÉ</span>
                            </div>
                        </div>
                        <CardHeader className="bg-white">
                            <CardTitle className="text-xl font-black text-slate-900">{circuit.title}</CardTitle>
                            <p className="text-sm text-slate-500 flex items-center gap-1"><Info className="h-3 w-3" /> Guide certifié par StayFloow</p>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-0 bg-white">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Participants</span>
                                <span className="font-black text-slate-900">{totalPaying}</span>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Prix total</span>
                                    <span className="font-bold">{formatPrice(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black text-primary bg-primary/5 p-3 rounded-lg border border-primary/10">
                                    <span>Acompte (20%)</span>
                                    <span>{formatPrice(deposit)}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 italic">
                                * Le solde de {formatPrice(totalPrice - deposit)} sera réglé directement au guide.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function CircuitBookingPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center flex flex-col items-center gap-4"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" /> Chargement...</div>}>
            <CircuitBookingForm />
        </Suspense>
    );
}
