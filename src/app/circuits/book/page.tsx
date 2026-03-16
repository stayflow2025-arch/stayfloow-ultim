"use client";

import React, { Suspense, useState, useMemo } from 'react';
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
  Calendar as CalendarIcon, 
  Loader2, 
  Info, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone 
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
import { sendBookingConfirmationEmail } from '@/lib/mail';
import { circuits as mockCircuits } from '@/lib/data';
import { format } from 'date-fns';
import { CrossSellCard } from '@/components/cross-sell-card';
import { cn } from "@/lib/utils";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(6, "Numéro requis"),
  dialCode: z.string().min(1, "Indicatif requis"),
  paymentMethod: z.string().min(1, "Obligatoire"),
  agreeToTerms: z.boolean().refine(val => val === true, "Veuillez accepter les conditions"),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

function CircuitBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  
  const tourId = searchParams.get('id');
  const tourDate = searchParams.get('date');
  const endDate = searchParams.get('endDate');
  const ticketsParam = searchParams.get('tickets');
  
  const tickets = useMemo(() => {
    if (!ticketsParam) return {};
    try {
      return JSON.parse(ticketsParam);
    } catch (e) {
      return {};
    }
  }, [ticketsParam]);

  const fullTotalAmount = Number(searchParams.get('total')) || 0;
  const depositAmount = fullTotalAmount * 0.14;
  const onSiteAmount = fullTotalAmount * 0.86;

  const circuitRef = useMemoFirebase(() => tourId ? doc(db, 'listings', tourId) : null, [db, tourId]);
  const { data: dbCircuit, isLoading: loading } = useDoc(circuitRef);
  const circuit = useMemo(() => dbCircuit || mockCircuits.find(c => c.id === tourId), [dbCircuit, tourId]);

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: { 
      fullName: user?.displayName || "", 
      email: user?.email || "", 
      phone: "", 
      dialCode: "+213", 
      paymentMethod: 'card', 
      agreeToTerms: false,
      cardNumber: "",
      cardExpiry: "",
      cardCvc: ""
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    const resNum = `ST-TOUR-${Math.floor(1000 + Math.random() * 8999)}`;
    const finalUserId = user?.uid || `guest_${Date.now()}`;

    try {
      await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: circuit?.ownerId || "guide_stayfloow",
        listingId: tourId,
        itemName: circuit?.details?.name || circuit?.title || "Circuit",
        itemType: 'circuit',
        itemImage: circuit?.photos?.[0] || circuit?.images?.[0] || "",
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
          participants: Object.values(tickets).reduce((a: any, b: any) => Number(a) + Number(b), 0), 
          totalPrice: fullTotalAmount,
          depositAmount: depositAmount
        }
      });
      setIsConfirmed(true);
      toast({ title: "Réservation réussie !" });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) { 
      toast({ variant: "destructive", title: "Erreur lors de la réservation." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  if (!circuit) {
    return (
      <div className="p-20 text-center font-bold">
        Erreur de chargement de l'offre.
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-5xl space-y-12">
        <Card className="border-none shadow-2xl p-12 rounded-[2.5rem] bg-white text-center max-w-2xl mx-auto animate-in zoom-in-95">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-black mb-4">Votre aventure commence bientôt !</h1>
          <p className="text-xl text-slate-600 mb-8 font-medium">Retrouvez votre ticket dans votre portail client.</p>
          <div className="space-y-3">
            <Button className="w-full bg-primary h-14 px-10 font-black rounded-xl text-lg shadow-xl" onClick={() => router.push('/profile/bookings')}>
              Gérer mes réservations
            </Button>
            <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => router.push('/')}>
              Retour à l'accueil
            </Button>
          </div>
        </Card>
        <CrossSellCard location={circuit.location?.address || (circuit as any).location || "Alger"} bookedItemType="circuit" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour au circuit
      </Button>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <CardTitle className="text-xl font-black uppercase">1. Vos Informations</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <FormField 
                    control={form.control} 
                    name="fullName" 
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Nom complet</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Sofiane Belkacem" className="h-14 rounded-xl bg-slate-50 border-slate-100" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField 
                      control={form.control} 
                      name="email" 
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Email</FormLabel>
                          <FormControl>
                            <Input className="h-14 rounded-xl bg-slate-50 border-slate-100" type="email" placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-2">
                      <FormLabel className="font-bold">Téléphone (WhatsApp)</FormLabel>
                      <div className="flex gap-2">
                        <FormField 
                          control={form.control} 
                          name="dialCode" 
                          render={({ field }) => (
                            <FormItem className="w-24">
                              <FormControl>
                                <Input className="h-14 text-center font-bold bg-slate-50 border-slate-100 rounded-xl" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField 
                          control={form.control} 
                          name="phone" 
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input className="h-14 rounded-xl bg-slate-50 border-slate-100" placeholder="550 00 00 00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white p-8">
                  <CardTitle className="text-xl font-black uppercase">2. Mode de Paiement</CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <FormField 
                    control={form.control} 
                    name="paymentMethod" 
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Label htmlFor="card" className={cn(
                          "flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all",
                          field.value === 'card' ? "border-primary bg-primary/5" : "border-slate-100"
                        )}>
                          <RadioGroupItem value="card" id="card" className="sr-only" />
                          <CreditCard className="h-6 w-6 text-primary" /> 
                          <span className="font-black">Carte Bancaire</span>
                        </Label>
                        <Label htmlFor="paypal" className={cn(
                          "flex items-center gap-4 p-6 border-2 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all",
                          field.value === 'paypal' ? "border-primary bg-primary/5" : "border-slate-100"
                        )}>
                          <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                          <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" /> 
                          <span className="font-black">PayPal</span>
                        </Label>
                      </RadioGroup>
                    )}
                  />

                  {paymentMethod === 'card' && (
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Informations de paiement sécurisées</span>
                      </div>
                      <div className="space-y-4">
                        <FormField 
                          control={form.control} 
                          name="cardNumber" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-slate-700">Numéro de carte</Label>
                              <FormControl>
                                <Input placeholder="0000 0000 0000 0000" className="h-14 bg-white border-slate-200 rounded-xl font-mono text-lg" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField 
                            control={form.control} 
                            name="cardExpiry" 
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-slate-700">Expiration</FormLabel>
                                <FormControl>
                                  <Input placeholder="MM/AA" className="h-14 bg-white border-slate-200 rounded-xl" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField 
                            control={form.control} 
                            name="cardCvc" 
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="font-bold text-slate-700">CVC</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" className="h-14 bg-white border-slate-200 rounded-xl" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <FormField 
                control={form.control} 
                name="agreeToTerms" 
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 p-6 bg-white rounded-2xl border-2 border-slate-100 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <Label className="text-sm font-medium leading-tight text-slate-600 cursor-pointer">
                      Je confirme l'exactitude des informations et j'accepte les conditions de StayFloow.com.
                    </Label>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={!form.watch('agreeToTerms') || isSubmitting} className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl rounded-2xl">
                {isSubmitting ? <Loader2 className="animate-spin h-6 w-6" /> : `Payez maintenant ${formatPrice(depositAmount)}`}
              </Button>
            </form>
          </Form>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white">
            <div className="relative h-48 w-full">
              <Image 
                src={circuit.photos?.[0] || (circuit as any).images?.[0] || 'https://picsum.photos/seed/tour/800/600'} 
                alt="tour" 
                fill 
                className="object-cover" 
              />
            </div>
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-2xl font-black text-primary leading-tight">
                {circuit.details?.name || (circuit as any).title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <CalendarIcon className="h-4 w-4" /> 
                  {tourDate ? format(new Date(tourDate), "dd MMM") : "..."} 
                  {endDate && ` au ${format(new Date(endDate), "dd MMM yyyy")}`}
                </div>
                <div className="space-y-2">
                  {Object.entries(tickets).map(([tid, count]: [string, any]) => {
                    if (Number(count) === 0) return null;
                    const ticketTypes = circuit.details?.ticketTypes || (circuit as any).ticketTypes || [];
                    const ttype = ticketTypes.find((t: any) => t.id === tid) || { name: tid, price: (circuit as any).price || (circuit as any).pricePerPerson };
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
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Prix total circuit</span>
                  <span className="font-black text-slate-900">{formatPrice(fullTotalAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                  <span className="text-xs font-bold text-primary">À PAYER EN LIGNE (14%)</span>
                  <span className="font-black text-primary">{formatPrice(depositAmount)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">À PAYER SUR PLACE (86%)</span>
                  <span className="font-black text-slate-700">{formatPrice(onSiteAmount)}</span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                <Info className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                  ℹ Notre plateforme prélève uniquement 14% du montant total à titre de frais de service lors de votre réservation en ligne. Le solde restant (86%) est réglé directement au prestataire.
                </p>
              </div>

              <Separator />
              <div className="flex justify-between items-end pt-2">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Total TTC</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{formatPrice(fullTotalAmount)}</p>
                </div>
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
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <CircuitBookingContent />
    </Suspense>
  );
}
