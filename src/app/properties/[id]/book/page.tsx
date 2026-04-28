"use client";

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Loader2,
  CheckCircle,
  Users,
  Lock,
  Calendar as CalendarIcon,
  MapPin
} from "lucide-react";
import { addDays, differenceInDays, format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { properties as mockProperties } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency-context";
import { sendBookingConfirmationEmailAction } from "@/app/actions/mail";
import { Separator } from "@/components/ui/separator";
import { CrossSellCard } from "@/components/cross-sell-card";
import { createStripeCheckout } from "@/lib/stripe-payment";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(6, "Numéro trop court"),
  dialCode: z.string().min(1, "Indicatif requis"),
  paymentMethod: z.enum(["card", "paypal"]),
});

function PropertyBookingContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const db = useFirestore();
  const { user } = useUser();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const totalParam = searchParams.get('total');

  const [date, setDate] = useState<{ from: Date; to: Date }>(() => {
    return { from: new Date(), to: addDays(new Date(), 3) };
  });

  useEffect(() => {
    if (fromParam && toParam) {
      const dFrom = new Date(fromParam);
      const dTo = new Date(toParam);
      if (!isNaN(dFrom.getTime()) && !isNaN(dTo.getTime())) {
        setDate({ from: dFrom, to: dTo });
      }
    }
  }, [fromParam, toParam]);
  
  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: dbProperty, isLoading: loading } = useDoc(docRef);

  const property = React.useMemo(() => {
    if (dbProperty) return dbProperty;
    return mockProperties.find(p => p.id === id);
  }, [dbProperty, id]);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      dialCode: "+213",
      paymentMethod: "card",
    },
  });

  const nights = Math.max(1, differenceInDays(date.to, date.from));
  const fullPrice = totalParam ? parseFloat(totalParam) : (property?.price || 85) * nights;
  const depositPrice = fullPrice * 0.14;
  const onSitePrice = fullPrice * 0.86;
  const minNights = property?.details?.minNights || 1;
  const cancellationPolicy = property?.details?.cancellationPolicy || "Flexible";
  const isBoosted = property?.isBoosted || false;
  const isValidDuration = nights >= minNights;

  const formatCardNumber = (value: string) => {
    return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    return value.replace(/\W/gi, '').replace(/(.{2})/, '$1/').substring(0, 5);
  };

  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const reservationNumber = `ST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      // 1. Enregistrement en base de données avec statut 'pending_payment'
      const docRef = await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: property?.ownerId || "admin",
        listingId: id,
        itemName: property?.details?.name || "Hébergement StayFloow",
        itemType: 'accommodation',
        itemImage: property?.photos?.[0] || "https://picsum.photos/seed/stay/800/600",
        customerName: values.fullName,
        customerEmail: values.email,
        totalPrice: fullPrice,
        depositPaid: depositPrice,
        status: values.paymentMethod === 'card' ? 'pending_payment' : 'approved',
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        createdAt: new Date().toISOString(),
        reservationNumber
      });

      const bookingId = docRef.id;

      // 3. Paiement Stripe : Redirection
      if (values.paymentMethod === 'card') {
        const checkoutUrl = await createStripeCheckout(
          depositPrice,
          "EUR",
          `Acompte Séjour: ${property?.details?.name || "Hébergement StayFloow"}`, 
          window.location.origin + "/profile/bookings?success=true", 
          window.location.href,
          { bookingId }
        );

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
          return;
        } else {
          throw new Error("Impossible de générer la session de paiement.");
        }
      } else {
        // Envoi de l'email immédiat si mode hors stripe (Paypal / sur place)
        await sendBookingConfirmationEmailAction({
          customerName: values.fullName,
          customerEmail: values.email,
          reservationNumber,
          itemName: property?.details?.name || "Hébergement StayFloow",
          itemType: 'hébergement',
          hostName: "Support StayFloow",
          hostEmail: "stayflow2025@gmail.com",
          hostPhone: "+213 550 00 00 00",
          bookingDetails: {
            startDate: date.from.toISOString(),
            endDate: date.to.toISOString(),
            nights,
            totalPrice: fullPrice,
            depositAmount: depositPrice
          }
        });
      }

      setIsSuccess(true);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur lors de la réservation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <Card className="max-w-md w-full mx-auto border-none shadow-2xl rounded-3xl p-10 bg-white animate-in zoom-in-95">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-black mb-4">Réservation Confirmée !</h1>
            <p className="text-slate-500 mb-8 font-medium">Félicitations, votre séjour est officiellement réservé.</p>
            <Button className="w-full h-14 bg-primary text-white font-black rounded-xl shadow-lg" onClick={() => router.push('/profile/bookings')}>Voir mes réservations</Button>
          </Card>
          <CrossSellCard 
            location={typeof property?.location === 'string' ? property.location.split(',')[0].trim() : property?.location?.address?.split(',')[0].trim() || "Alger"} 
            bookedItemType="property" 
          />
        </div>
      </div>
    );
  }

  const propertyImage = property?.photos?.[0] || "https://picsum.photos/seed/stay/800/600";

  return (
    <div className="min-h-screen bg-[#f8faff] flex flex-col">
      <header className="bg-primary text-white py-6 px-8 shadow-md flex justify-between items-center">
        <Button variant="ghost" onClick={() => router.back()} className="text-white font-bold hover:bg-white/10 uppercase text-xs tracking-widest"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button>
        <div className="text-2xl font-black">StayFloow<span className="text-secondary">.com</span></div>
        <div className="w-10" />
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3"><Users className="h-6 w-6 text-secondary" /> Coordonnées & Paiement</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  <div className="space-y-6">
                    <FormField control={form.control} name="fullName" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold text-slate-700">Nom complet</FormLabel><FormControl><Input placeholder="Ex: Sofiane Belkacem" className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="font-bold text-slate-700">Email</FormLabel><FormControl><Input type="email" placeholder="votre@email.com" className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="flex gap-2">
                        <FormField control={form.control} name="dialCode" render={({ field }) => (
                          <FormItem className="w-24"><FormLabel className="font-bold text-slate-700">Code</FormLabel><FormControl><Input className="h-14 text-center font-bold bg-slate-50" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                          <FormItem className="flex-1"><FormLabel className="font-bold text-slate-700">Téléphone</FormLabel><FormControl><Input className="h-14 rounded-xl bg-slate-50" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-50">
                    <h3 className="text-xl font-black mb-6 flex items-center gap-3"><CreditCard className="h-6 w-6 text-primary" /> Mode de Paiement</h3>
                    
                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Label htmlFor="card" className={cn("flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'card' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 hover:border-slate-200")}>
                          <div className="flex items-center gap-4"><RadioGroupItem value="card" id="card" className="sr-only" /><CreditCard className="h-6 w-6 text-primary" /><span className="font-black">Carte Bancaire Directe</span></div>
                        </Label>
                        <Label htmlFor="paypal" className={cn("flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'paypal' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 hover:border-slate-200")}>
                          <div className="flex items-center gap-4"><RadioGroupItem value="paypal" id="paypal" className="sr-only" /><div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div><span className="font-black">PayPal Checkout</span></div>
                        </Label>
                      </RadioGroup>
                    )} />

                    {form.watch('paymentMethod') === 'card' && (
                      <div className="space-y-4 bg-emerald-50/50 p-8 rounded-[2rem] border border-emerald-100 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-2">
                          <Lock className="h-4 w-4" /> Paiement Sécurisé par Stripe
                        </div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          Vous allez être redirigé vers la page de paiement officielle de **Stripe** pour finaliser votre réservation en toute sécurité. 
                          <br/><br/>
                          <span className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">Aucune donnée bancaire n'est stockée sur nos serveurs.</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Avertissement de durée minimum */}
                  {!isValidDuration && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <p className="text-sm font-bold text-red-600 flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Durée minimum de séjour : {minNights} nuits
                      </p>
                      <p className="text-xs text-red-500 mt-1">Vous avez sélectionné {nights} nuit(s). Veuillez modifier vos dates pour continuer.</p>
                    </div>
                  )}

                  <Button type="submit" disabled={isSubmitting || !isValidDuration} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 mt-10">
                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <span>Confirmer & Payer {isMounted && `(${formatPrice(depositPrice)})`}</span>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-28 shadow-2xl border-none rounded-[2.5rem] bg-white overflow-hidden">
                <div className="relative h-48 w-full bg-slate-100">
                  <Image src={propertyImage} alt="Stay" fill className="object-cover" />
                  <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">STAYFLOOW SELECTION</div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <h2 className="text-2xl font-black truncate leading-tight">{property?.details?.name}</h2>
                  <div className="flex flex-col gap-2 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {String(property?.location?.address || property?.location || "")}</div>
                    <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> Du {format(date.from, "dd MMM", { locale: fr })} au {format(date.to, "dd MMM yyyy", { locale: fr })} ({nights} nuits)</div>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> Annulation : <span className="font-black">{cancellationPolicy}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    {isBoosted && (
                       <div className="bg-secondary/10 text-secondary px-3 py-2 rounded-xl text-[10px] font-black uppercase flex justify-between items-center">
                         <span>Offre Promotionnelle (-10% appliqués)</span>
                       </div>
                    )}
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span className="text-slate-500">Prix total {isBoosted && <span className="line-through text-slate-300 ml-2">{formatPrice(fullPrice / 0.9)}</span>}</span>
                      <span className="font-black text-slate-900">{isMounted ? formatPrice(fullPrice) : "..."}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-[10px] font-black text-primary uppercase">Payé en ligne (14%)</span>
                      <span className="font-black text-primary">{isMounted ? formatPrice(depositPrice) : "..."}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Sur place (86%)</span>
                      <span className="font-black text-slate-700">{isMounted ? formatPrice(onSitePrice) : "..."}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t flex justify-between items-end border-slate-50 mt-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p>
                      <p className="text-4xl font-black text-primary tracking-tighter">{isMounted ? formatPrice(fullPrice) : "..."}</p>
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

export default function PropertyBookingPage() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) return null;

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-primary h-10 w-10" /></div>}>
      <PropertyBookingContent id={id} />
    </Suspense>
  );
}