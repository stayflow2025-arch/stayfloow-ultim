"use client";

import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, Loader2, Lock, Calendar as CalendarIcon } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCurrency } from '@/context/currency-context';
import { useLanguage } from '@/context/language-context';
import { sendBookingConfirmationEmailAction } from '@/app/actions/mail';
import { circuits as mockCircuits } from '@/lib/data';
import { cn } from "@/lib/utils";
import { createStripeCheckout } from "@/lib/stripe-payment";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Numéro requis"),
  dialCode: z.string().min(1, "Indicatif requis"),
  paymentMethod: z.enum(['card', 'paypal']),
  agreeToTerms: z.boolean().refine(val => val === true, "Veuillez accepter les conditions"),
});

function CircuitBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const tourId = searchParams.get('id');
  const tourDate = searchParams.get('date');
  const endDate = searchParams.get('endDate');
  const fullTotalAmount = Number(searchParams.get('total')) || 0;
  const depositAmount = fullTotalAmount * 0.14;
  const onSiteAmount = fullTotalAmount * 0.86;

  const circuitRef = useMemoFirebase(() => tourId ? doc(db, 'listings', tourId) : null, [db, tourId]);
  const { data: dbCircuit, isLoading: loading } = useDoc(circuitRef);
  const circuit = useMemo(() => dbCircuit || mockCircuits.find(c => c.id === tourId), [dbCircuit, tourId]);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      fullName: user?.displayName || "", 
      email: user?.email || "", 
      phone: "", 
      dialCode: "+213", 
      paymentMethod: 'card', 
      agreeToTerms: false 
    },
  });


  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const resNum = `ST-TOUR-${Math.floor(1000 + Math.random() * 8999)}`;
    
    try {
      const docRef = await addDoc(collection(db, "bookings"), { 
        userId: finalUserId, 
        partnerId: circuit?.ownerId || "guide_stayfloow", 
        listingId: tourId, 
        itemName: circuit?.details?.name || circuit?.title || "Circuit", 
        itemType: 'circuit', 
        itemImage: circuit?.photos?.[0] || circuit?.images?.[0] || "https://picsum.photos/seed/circuit/400/300", 
        customerName: values.fullName, 
        customerEmail: values.email, 
        totalPrice: fullTotalAmount, 
        depositPaid: depositAmount, 
        status: values.paymentMethod === 'card' ? 'pending_payment' : 'approved', 
        startDate: tourDate, 
        endDate: endDate || tourDate, 
        createdAt: new Date().toISOString(), 
        reservationNumber: resNum 
      });

      const bookingId = docRef.id;

      if (values.paymentMethod === 'card') {
        const url = await createStripeCheckout(
          depositAmount, 
          "EUR", 
          `Acompte Circuit: ${circuit?.details?.name || circuit?.title || "Circuit StayFloow"}`, 
          window.location.origin + "/profile/bookings?success=true", 
          window.location.href,
          { bookingId }
        );
        if (url) {
          window.location.href = url;
          return;
        } else {
          throw new Error("Impossible de générer la session de paiement.");
        }
      } else {
        await sendBookingConfirmationEmailAction({ 
          customerName: values.fullName, 
          customerEmail: values.email, 
          reservationNumber: resNum, 
          itemName: circuit?.details?.name || circuit?.title || "Circuit", 
          itemType: 'circuit', 
          hostName: "StayFloow Guide", 
          hostEmail: "stayflow2025@gmail.com", 
          hostPhone: "+213 550 00 00 00", 
          bookingDetails: { startDate: tourDate, endDate: endDate, totalPrice: fullTotalAmount, depositAmount: depositAmount } 
        });
      }

      setIsConfirmed(true);
    } catch (e) { 
      toast({ variant: "destructive", title: t('error_loading_offer') }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!circuit) return <div className="p-20 text-center font-bold text-slate-400">{t('error_loading_offer')}</div>;

  if (isConfirmed) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl text-center">
        <Card className="border-none shadow-2xl p-8 md:p-12 rounded-[2rem] bg-white max-w-2xl mx-auto animate-in zoom-in-95">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-8" />
          <h1 className="text-2xl md:text-3xl font-black mb-4">{t('booking_confirmed_msg')}</h1>
          <p className="text-slate-500 mb-8">{t('booking_confirmed_sub')}</p>
          <Button className="w-full bg-primary h-14 rounded-xl font-black shadow-xl" onClick={() => router.push('/profile/bookings')}>{t('manage_bookings')}</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black text-slate-400 hover:text-primary px-0">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_tour')}
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-xl font-black uppercase tracking-tight">{t('your_info')}</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel className="font-bold">{t('full_name')}</FormLabel><FormControl><Input placeholder={t('full_name_placeholder')} className="h-14 rounded-xl bg-slate-50 border-slate-100" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="font-bold">{t('contact.email')}</FormLabel><FormControl><Input className="h-14 rounded-xl bg-slate-50 border-slate-100" type="email" placeholder={t('email_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="flex gap-2">
                      <FormField control={form.control} name="dialCode" render={({ field }) => (
                        <FormItem className="w-24"><FormLabel className="font-bold">Code</FormLabel><FormControl><Input className="h-14 text-center font-black bg-slate-50 border-slate-100" {...field} /></FormControl></FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="flex-1"><FormLabel className="font-bold">{t('phone_whatsapp')}</FormLabel><FormControl><Input className="h-14 rounded-xl bg-slate-50 border-slate-100" placeholder={t('phone_placeholder')} {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8"><CardTitle className="text-xl font-black uppercase tracking-tight">{t('payment_method')}</CardTitle></CardHeader>
                <CardContent className="p-8 space-y-8">
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Label htmlFor="card" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'card' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100")}>
                        <RadioGroupItem value="card" id="card" className="sr-only" /><CreditCard className="h-6 w-6 text-primary" /><span className="font-black text-sm">Carte Bancaire Directe</span>
                      </Label>
                      <Label htmlFor="paypal" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer transition-all", field.value === 'paypal' ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100")}>
                        <RadioGroupItem value="paypal" id="paypal" className="sr-only" /><div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div><span className="font-black text-sm">PayPal Checkout</span>
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
                </CardContent>
              </Card>

              <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                <FormItem className="flex items-start space-x-3 p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label className="text-sm font-medium text-slate-600 cursor-pointer">{t('confirm_terms')}</Label></FormItem>
              )} />

              <Button type="submit" disabled={!form.watch('agreeToTerms') || isSubmitting} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20">{isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : <span>{t('pay_now')} {isMounted && `(${formatPrice(depositAmount)})`}</span>}</Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="sticky top-24 shadow-2xl border-none rounded-[2rem] bg-white overflow-hidden">
            <div className="relative h-48 w-full"><Image src={circuit?.photos?.[0] || circuit?.images?.[0] || "https://picsum.photos/seed/circuit/800/600"} alt="tour" fill className="object-cover" /></div>
            <CardContent className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-primary leading-tight">{circuit?.details?.name || circuit?.title}</h3>
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase"><CalendarIcon className="h-4 w-4 text-primary" /> {tourDate ? format(new Date(tourDate), "dd MMMM yyyy", { locale: fr }) : "Date à confirmer"}</div>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold"><span className="text-slate-500">{t('total_price')}</span><span className="text-slate-900">{isMounted ? formatPrice(fullTotalAmount) : "..."}</span></div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10"><span className="text-[10px] font-black text-primary uppercase">Payé en ligne (14%)</span><span className="font-black text-primary">{isMounted ? formatPrice(depositAmount) : "..."}</span></div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-[10px] font-black text-slate-500 uppercase">Sur place (86%)</span><span className="font-black text-slate-700">{isMounted ? formatPrice(onSiteAmount) : "..."}</span></div>
              </div>
              <div className="pt-2 flex justify-between items-end border-t border-slate-50 mt-4">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Transaction</p><p className="text-4xl font-black text-primary tracking-tighter">{isMounted ? formatPrice(fullTotalAmount) : "..."}</p></div>
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
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}><CircuitBookingContent /></Suspense>
  );
}