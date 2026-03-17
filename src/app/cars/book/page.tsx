"use client";

import React, { useState, Suspense, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle, 
  Loader2, 
  Lock,
  MapPin
} from "lucide-react";
import Image from "next/image";
import { useCurrency } from "@/context/currency-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CrossSellCard } from "@/components/cross-sell-card";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, addDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { sendBookingConfirmationEmail } from "@/lib/mail";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createStripeCheckout } from "@/lib/stripe-payment";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const bookingSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Téléphone requis"),
  dialCode: z.string().min(1, "Indicatif requis"),
  paymentMethod: z.enum(["card", "paypal"]),
  cardNumber: z.string().min(16, "Numéro invalide").max(19),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Format MM/AA"),
  cvc: z.string().min(3, "CVC invalide").max(4),
});

function BookCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const carId = searchParams.get('id') || 'mock';
  const pickupLocation = searchParams.get('pickup') || "Alger, Algérie";
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const totalParam = searchParams.get('total');
  const days = parseInt(searchParams.get('days') || '3');

  const carRef = useMemoFirebase(() => carId.startsWith('mock') ? null : doc(db, 'listings', carId), [db, carId]);
  const { data: dbCar, isLoading: carLoading } = useDoc(carRef);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: user?.displayName?.split(' ')[0] || "",
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
      email: user?.email || "",
      phone: "",
      dialCode: "+213",
      paymentMethod: "card",
      cardNumber: '',
      expiry: '',
      cvc: '',
    },
  });

  const displayCar = useMemo(() => {
    if (dbCar) return {
      name: dbCar.details?.brand + " " + (dbCar.details?.model || dbCar.details?.name),
      image: dbCar.photos?.[0] || "https://picsum.photos/seed/car/800/600",
      price: dbCar.price || 85
    };
    return {
      name: carId === 'mock-car-1' ? 'Dacia Duster 4x4' : 'VW Golf 8 GTI',
      image: carId === 'mock-car-1' ? "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800" : "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800",
      price: carId === 'mock-car-1' ? 50 : 85
    };
  }, [dbCar, carId]);

  const fullTotal = useMemo(() => {
    if (totalParam) return parseFloat(totalParam);
    return (displayCar.price * days);
  }, [totalParam, displayCar.price, days]);

  const depositTotal = fullTotal * 0.14;
  const onSiteTotal = fullTotal * 0.86;

  const formatCardNumber = (value: string) => {
    return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\W/gi, '').replace(/(.{2})/, '$1/').substring(0, 5);
  };

  const handleBooking = async (values: z.infer<typeof bookingSchema>) => {
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const resNum = `ST-CAR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      if (values.paymentMethod === 'card') {
        try {
          const url = await createStripeCheckout(db, finalUserId, "price_car_placeholder", window.location.origin + "/profile/bookings?success=true", window.location.href);
          if (url) {
            window.location.href = url;
            return;
          }
        } catch (err) {
          console.warn("Mode direct activé.");
        }
      }

      await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: dbCar?.ownerId || "stayfloow_fleet",
        listingId: carId,
        itemName: displayCar.name,
        itemType: 'car_rental',
        itemImage: displayCar.image,
        customerName: `${values.firstName} ${values.lastName}`,
        customerEmail: values.email,
        totalPrice: fullTotal,
        depositPaid: depositTotal,
        status: 'approved',
        startDate: fromParam || new Date().toISOString(),
        endDate: toParam || addDays(new Date(), days).toISOString(),
        createdAt: new Date().toISOString(),
        reservationNumber: resNum,
        pickupLocation
      });

      await sendBookingConfirmationEmail({
        customerName: `${values.firstName} ${values.lastName}`,
        customerEmail: values.email,
        reservationNumber: resNum,
        itemName: displayCar.name,
        itemType: 'location de voiture',
        hostName: "StayFloow Fleet",
        hostEmail: "fleet@stayfloow.com",
        hostPhone: "+213 550 00 00 00",
        bookingDetails: { 
          startDate: fromParam || new Date().toISOString(), 
          endDate: toParam || addDays(new Date(), days).toISOString(),
          totalPrice: fullTotal,
          depositAmount: depositTotal
        }
      });

      setIsSuccess(true);
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur lors de la réservation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (carLoading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <Card className="max-w-md w-full mx-auto border-none shadow-2xl rounded-3xl p-12 bg-white animate-in zoom-in-95">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-8" />
            <h1 className="text-3xl font-black mb-4">Réservation Confirmée !</h1>
            <p className="text-slate-500 mb-8 font-medium">Votre véhicule est réservé. Un agent StayFloow vous attendra au point de retrait.</p>
            <Button className="w-full h-14 bg-primary text-white font-black rounded-xl shadow-lg" onClick={() => router.push('/profile/bookings')}>Voir mes réservations</Button>
          </Card>
          <CrossSellCard location={pickupLocation.split(',')[0].trim()} bookedItemType="car" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col">
      <header className="bg-primary text-white py-6 px-8 shadow-md flex justify-between items-center">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-black hover:opacity-80 transition-all text-sm uppercase tracking-widest"><ArrowLeft className="h-5 w-5" /> Retour</button>
        <div className="text-2xl font-black">StayFloow<span className="text-secondary">.com</span></div>
        <div className="w-10" />
      </header>

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleBooking)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-2xl font-black uppercase tracking-tight">Conducteur & Paiement</CardTitle></CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Prénom</FormLabel>
                        <FormControl><Input className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-slate-700">Nom</FormLabel>
                        <FormControl><Input className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700">Email</FormLabel>
                      <FormControl><Input type="email" className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  
                  <div className="pt-8 border-t">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3"><CreditCard className="h-6 w-6 text-primary" /> Mode de Paiement</h3>
                    
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <Label htmlFor="card" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'card' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 hover:border-slate-200")}>
                          <RadioGroupItem value="card" id="card" className="sr-only" />
                          <CreditCard className="h-6 w-6 text-primary" />
                          <span className="font-black">Carte Bancaire Directe</span>
                        </Label>
                        <Label htmlFor="paypal" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'paypal' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 hover:border-slate-200")}>
                          <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                          <div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div>
                          <span className="font-black">PayPal Checkout</span>
                        </Label>
                      </RadioGroup>
                    )} />

                    {form.watch('paymentMethod') === 'card' && (
                      <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
                          <Lock className="h-4 w-4" /> Saisie sécurisée StayFloow Pay
                        </div>
                        <div className="space-y-4">
                          <FormField control={form.control} name="cardNumber" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Numéro de carte</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input 
                                    placeholder="0000 0000 0000 0000" 
                                    className="h-14 pl-12 rounded-xl bg-white border-slate-200" 
                                    {...field}
                                    onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                                  />
                                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="expiry" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">Expiration (MM/AA)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="MM/AA" 
                                    className="h-14 rounded-xl bg-white border-slate-200" 
                                    {...field}
                                    onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="cvc" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold">CVC</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="123" 
                                    className="h-14 rounded-xl bg-white border-slate-200" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').substring(0, 4))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full h-16 bg-primary text-white font-black text-xl rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 mt-8">
                    {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : (
                      <span>Finaliser la réservation {isMounted && `(${formatPrice(depositTotal)})`}</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="overflow-hidden shadow-2xl border-none rounded-[2.5rem] bg-white sticky top-24">
                <div className="relative h-56 w-full bg-slate-100">
                  <Image src={displayCar.image} alt="Vehicle" fill className="object-cover" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">STAYFLOOW FLEET</div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-black leading-tight">{displayCar.name}</h3>
                  <div className="flex flex-col gap-2 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {pickupLocation}</div>
                    <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> {days} jours de location</div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">Prix total</span>
                      <span className="font-black text-slate-900">{isMounted ? formatPrice(fullTotal) : "..."}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-[10px] font-black text-primary uppercase">Payé en ligne (14%)</span>
                      <span className="font-black text-primary">{isMounted ? formatPrice(depositTotal) : "..."}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Sur place (86%)</span>
                      <span className="font-black text-slate-700">{isMounted ? formatPrice(onSiteTotal) : "..."}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end border-slate-50 mt-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">{isMounted ? formatPrice(fullTotal) : "..."}</p>
                    </div>
                    <ShieldCheck className="h-10 w-10 text-primary opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

export default function BookCarPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>}>
      <BookCarContent />
    </Suspense>
  );
}
