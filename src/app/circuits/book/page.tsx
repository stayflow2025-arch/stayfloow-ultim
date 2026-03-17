
"use client";

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  CheckCircle, 
  CreditCard, 
  ShieldCheck, 
  Loader2, 
  Lock 
} from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
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
import { sendBookingConfirmationEmail } from '@/lib/mail';
import { circuits as mockCircuits } from '@/lib/data';
import { CrossSellCard } from '@/components/cross-sell-card';
import { cn } from "@/lib/utils";
import { createStripeCheckout } from "@/lib/stripe-payment";

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
  const { user } = useUser();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();
  
  const tourId = searchParams.get('id');
  const tourDate = searchParams.get('date');
  const endDate = searchParams.get('endDate');
  
  const fullTotalAmount = Number(searchParams.get('total')) || 0;
  const depositAmount = fullTotalAmount * 0.14;
  const onSiteAmount = fullTotalAmount * 0.86;

  const circuitRef = useMemoFirebase(() => tourId ? doc(db, 'listings', tourId) : null, [db, tourId]);
  const { data: dbCircuit, isLoading: loading } = useDoc(circuitRef);
  const circuit = useMemo(() => dbCircuit || mockCircuits.find(c => c.id === tourId), [dbCircuit, tourId]);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      fullName: user?.displayName || "", 
      email: user?.email || "", 
      phone: "", 
      dialCode: "+213", 
      paymentMethod: 'card', 
      agreeToTerms: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof bookingSchema>) => {
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const resNum = `ST-TOUR-${Math.floor(1000 + Math.random() * 8999)}`;

    try {
      if (values.paymentMethod === 'card') {
        const url = await createStripeCheckout(
          db, 
          finalUserId, 
          "price_tour_placeholder", 
          window.location.origin + "/profile/bookings?success=true",
          window.location.href
        );
        window.location.href = url;
        return;
      }

      await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: circuit?.ownerId || "guide_stayfloow",
        listingId: tourId,
        itemName: circuit?.details?.name || circuit?.title || "Circuit",
        itemType: 'circuit',
        itemImage: circuit?.photos?.[0] || circuit?.images?.[0] || "https://picsum.photos/seed/tour/800/600",
        customerName: values.fullName,
        customerEmail: values.email,
        totalPrice: fullTotalAmount,
        depositPaid: depositAmount,
        status: 'approved',
        startDate: tourDate,
        endDate: endDate || tourDate,
        createdAt: new Date().toISOString(),
        reservationNumber: resNum
      });

      await sendBookingConfirmationEmail({
        customerName: values.fullName, 
        customerEmail: values.email, 
        reservationNumber: resNum,
        itemName: circuit?.details?.name || circuit?.title || "Circuit", 
        itemType: 'circuit',
        hostName: "StayFloow Guide", 
        hostEmail: "contact@stayfloow.com", 
        hostPhone: "+213 550 00 00 00",
        bookingDetails: { 
          startDate: tourDate, 
          endDate: endDate,
          totalPrice: fullTotalAmount,
          depositAmount: depositAmount
        }
      });
      setIsConfirmed(true);
    } catch (e) { 
      toast({ variant: "destructive", title: t('error_loading_offer') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!circuit) return <div className="p-20 text-center font-bold">{t('error_loading_offer')}</div>;

  if (isConfirmed) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl space-y-12 text-center">
        <Card className="border-none shadow-2xl p-12 rounded-[2.5rem] bg-white max-w-2xl mx-auto">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-8" />
          <h1 className="text-3xl font-black mb-4">{t('booking_confirmed_msg')}</h1>
          <Button className="w-full bg-primary h-14 rounded-xl text-lg shadow-xl" onClick={() => router.push('/profile/bookings')}>{t('manage_bookings')}</Button>
        </Card>
        <CrossSellCard location={circuit.location?.address || circuit.location || "Alger"} bookedItemType="circuit" />
      </div>
    );
  }

  const circuitImage = circuit?.photos?.[0] || circuit?.images?.[0] || "https://picsum.photos/seed/tour/800/600";

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black">
        <ArrowLeft className="mr-2 h-4 w-4" /> {t('back_to_tour')}
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <CardTitle className="text-xl font-black uppercase tracking-tight">{t('your_info')}</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t('full_name')}</FormLabel>
                      <FormControl><Input placeholder={t('full_name_placeholder')} className="h-14 rounded-xl" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">{t('contact.email')}</FormLabel>
                        <FormControl><Input className="h-14 rounded-xl" type="email" placeholder={t('email_placeholder')} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="flex gap-2">
                      <FormField control={form.control} name="dialCode" render={({ field }) => (
                        <FormItem className="w-24">
                          <FormLabel className="font-bold">Code</FormLabel>
                          <FormControl><Input className="h-14 text-center font-bold" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel className="font-bold">{t('phone_whatsapp')}</FormLabel>
                          <FormControl><Input className="h-14 rounded-xl" placeholder={t('phone_placeholder')} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <CardTitle className="text-xl font-black uppercase tracking-tight">{t('payment_method')} (Stripe)</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                    <Lock className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium italic">Paiement 100% sécurisé via Stripe. Vous pourrez saisir votre numéro de carte sur la page suivante.</p>
                  </div>

                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Label htmlFor="card" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer", field.value === 'card' ? "border-primary bg-primary/5" : "border-slate-100")}>
                        <RadioGroupItem value="card" id="card" className="sr-only" /><CreditCard className="h-6 w-6 text-primary" /><span className="font-black">Carte / Stripe</span>
                      </Label>
                      <Label htmlFor="paypal" className={cn("flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer", field.value === 'paypal' ? "border-primary bg-primary/5" : "border-slate-100")}>
                        <RadioGroupItem value="paypal" id="paypal" className="sr-only" /><div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div><span className="font-black">PayPal</span>
                      </Label>
                    </RadioGroup>
                  )} />
                </CardContent>
              </Card>

              <FormField control={form.control} name="agreeToTerms" render={({ field }) => (
                <FormItem className="flex items-start space-x-3 p-6 bg-white rounded-2xl border-2 border-slate-100">
                  <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <Label className="text-sm font-medium text-slate-600 cursor-pointer">{t('confirm_terms')}</Label>
                </FormItem>
              )} />

              <Button type="submit" disabled={!form.watch('agreeToTerms') || isSubmitting} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : `${t('pay_now')} ${formatPrice(depositAmount)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
            <div className="relative h-48 w-full">
              <Image src={circuitImage} alt="tour" fill className="object-cover" />
            </div>
            <CardContent className="p-8 space-y-6">
              <h3 className="text-2xl font-black text-primary leading-tight">{circuit.details?.name || circuit.title}</h3>
              <Separator />
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm"><span className="text-slate-500">{t('total_price')}</span><span className="font-black">{formatPrice(fullTotalAmount)}</span></div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10"><span className="text-xs font-bold text-primary">LIGNE (14%)</span><span className="font-black text-primary">{formatPrice(depositAmount)}</span></div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"><span className="text-xs font-bold text-slate-500">SUR PLACE (86%)</span><span className="font-black text-slate-700">{formatPrice(onSiteAmount)}</span></div>
              </div>
              <div className="pt-2 flex justify-between items-end"><div><p className="text-[10px] font-black text-slate-400 uppercase">Total TTC</p><p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(fullTotalAmount)}</p></div><ShieldCheck className="h-10 w-10 text-primary opacity-20" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CircuitBookingPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <CircuitBookingContent />
    </Suspense>
  );
}
