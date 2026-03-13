"use client";

import React, { useState, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Info, 
  CreditCard, 
  Loader2,
  CheckCircle,
  Users,
  Lock
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/context/currency-context";
import { sendBookingConfirmationEmail } from "@/lib/mail";
import { Separator } from "@/components/ui/separator";
import { CrossSellCard } from "@/components/cross-sell-card";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Le nom complet est requis"),
  email: z.string().email("Adresse email invalide"),
  phone: z.string().min(6, "Numéro trop court"),
  dialCode: z.string().min(1, "Indicatif requis"),
  paymentMethod: z.enum(["card", "paypal"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

function PropertyBookingContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const db = useFirestore();
  const { user } = useUser();
  
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const totalParam = searchParams.get('total');

  const [date] = useState<{ from: Date; to: Date }>({
    from: fromParam ? new Date(fromParam) : new Date(),
    to: toParam ? new Date(toParam) : addDays(new Date(), 3),
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const docRef = useMemoFirebase(() => doc(db, 'listings', id), [db, id]);
  const { data: property, loading } = useDoc(docRef);

  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: user?.displayName || "",
      email: user?.email || "",
      phone: "",
      dialCode: "+213",
      paymentMethod: "card",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const nights = Math.max(1, differenceInDays(date.to, date.from));
  const fullPrice = totalParam ? parseFloat(totalParam) : (property?.price || 85) * nights;
  const depositPrice = fullPrice * 0.14;
  const onSitePrice = fullPrice * 0.86;

  const onSubmit = async (values: BookingValues) => {
    setIsSubmitting(true);
    const finalUserId = user?.uid || `guest_${Date.now()}`;
    const reservationNumber = `ST-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    try {
      await addDoc(collection(db, "bookings"), {
        userId: finalUserId,
        partnerId: property?.ownerId || "admin",
        listingId: id,
        itemName: property?.details?.name || "Hébergement StayFloow",
        itemType: 'accommodation',
        itemImage: property?.photos?.[0] || "",
        customerName: values.fullName,
        customerEmail: values.email,
        totalPrice: fullPrice,
        depositPaid: depositPrice,
        status: 'approved',
        startDate: date.from.toISOString(),
        endDate: date.to.toISOString(),
        createdAt: new Date().toISOString(),
        reservationNumber
      });

      await sendBookingConfirmationEmail({
        customerName: values.fullName,
        customerEmail: values.email,
        reservationNumber,
        itemName: property?.details?.name || "Hébergement StayFloow",
        itemType: 'hébergement',
        hostName: "Support StayFloow",
        hostEmail: "contact@stayfloow.com",
        hostPhone: "+213 550 00 00 00",
        bookingDetails: {
          startDate: date.from.toISOString(),
          endDate: date.to.toISOString(),
          nights,
          totalPrice: fullPrice,
          depositAmount: depositPrice
        }
      });

      setIsSuccess(true);
      toast({
        title: "Réservation confirmée !",
        description: `Un email a été envoyé à ${values.email}`,
      });
    } catch (error) {
      console.error("Booking submission failed:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          <Card className="max-w-md w-full mx-auto border-none shadow-2xl rounded-3xl p-10 text-center animate-in zoom-in-95 duration-500 bg-white">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4">Félicitations !</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Votre demande de réservation a été enregistrée avec succès. Vous pouvez la retrouver dans votre espace client.
            </p>
            <div className="space-y-3">
              <Button className="w-full h-14 bg-primary text-white font-black rounded-xl" onClick={() => router.push('/profile/bookings')}>
                Voir mes réservations
              </Button>
              <Button variant="ghost" className="w-full font-bold text-slate-400" onClick={() => router.push('/')}>
                Retour à l'accueil
              </Button>
            </div>
          </Card>

          <CrossSellCard 
            location={property?.location?.address?.split(',')[0].trim() || "Alger"} 
            bookedItemType="property" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white py-6 px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button variant="ghost" onClick={() => router.back()} className="text-white hover:bg-white/10 font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          <div className="text-xl font-black">StayFloow<span className="text-secondary">.com</span></div>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
              <CardHeader className="bg-slate-900 text-white p-8">
                <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                  <Users className="h-6 w-6 text-secondary" /> 1. Vos Coordonnées
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold">Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Sofiane Belkacem" className="h-14 rounded-xl border-slate-100 bg-slate-50" {...field} />
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
                              <Input type="email" placeholder="votre@email.com" className="h-14 rounded-xl border-slate-100 bg-slate-50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="space-y-2">
                        <FormLabel className="font-bold">Téléphone</FormLabel>
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name="dialCode"
                            render={({ field }) => (
                              <FormItem className="w-24">
                                <FormControl>
                                  <Input className="h-14 text-center font-bold bg-slate-50 border-slate-100 rounded-xl" placeholder="+213" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder="0550 00 00 00" className="h-14 rounded-xl border-slate-100 bg-slate-50" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-primary" /> 2. Mode de Paiement
                      </h3>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value} 
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            <Label 
                              htmlFor="card" 
                              className={cn(
                                "flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all",
                                field.value === 'card' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <RadioGroupItem value="card" id="card" className="sr-only" />
                                <CreditCard className="h-6 w-6 text-primary" />
                                <span className="font-bold">Carte Bancaire</span>
                              </div>
                              <div className="flex gap-1">
                                <div className="w-8 h-5 bg-slate-200 rounded" />
                                <div className="w-8 h-5 bg-slate-200 rounded" />
                              </div>
                            </Label>

                            <Label 
                              htmlFor="paypal" 
                              className={cn(
                                "flex items-center justify-between p-6 border-2 rounded-2xl cursor-pointer transition-all",
                                field.value === 'paypal' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <RadioGroupItem value="paypal" id="paypal" className="sr-only" />
                                <div className="w-6 h-6 bg-[#0070ba] rounded-full flex items-center justify-center text-white text-[10px] font-bold">P</div>
                                <span className="font-bold">PayPal</span>
                              </div>
                              <span className="text-[10px] font-black opacity-30 italic">PAYPAL</span>
                            </Label>
                          </RadioGroup>
                        )}
                      />

                      {paymentMethod === 'card' && (
                        <div className="mt-8 p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 animate-in slide-in-from-top-4 duration-500">
                          <div className="flex items-center gap-2 mb-2">
                            <Lock className="h-4 w-4 text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Informations de paiement sécurisées</span>
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="font-bold text-slate-700">Numéro de carte</Label>
                              <div className="relative">
                                <Input 
                                  placeholder="0000 0000 0000 0000" 
                                  className="h-14 bg-white border-slate-200 rounded-xl font-mono text-lg" 
                                  {...form.register("cardNumber")}
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                  <div className="w-8 h-5 bg-slate-100 rounded" />
                                  <div className="w-8 h-5 bg-slate-100 rounded" />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="font-bold text-slate-700">Date d'expiration</Label>
                                <Input 
                                  placeholder="MM/AA" 
                                  className="h-14 bg-white border-slate-200 rounded-xl" 
                                  {...form.register("cardExpiry")}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="font-bold text-slate-700">CVC</Label>
                                <Input 
                                  placeholder="123" 
                                  className="h-14 bg-white border-slate-200 rounded-xl" 
                                  {...form.register("cardCvc")}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex gap-4">
                      <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                      <p className="text-sm text-slate-600 font-medium">
                        Votre paiement est 100% sécurisé via StayFloow Pay. Nous ne conservons aucune coordonnée bancaire.
                      </p>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-xl shadow-primary/20"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        `Payez maintenant ${formatPrice(depositPrice)}`
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
                <div className="relative h-48 w-full">
                  <Image 
                    src={property?.photos?.[0] || "https://picsum.photos/seed/stay/800/600"} 
                    alt="Property" 
                    fill 
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-xl font-black truncate max-w-[240px]">{property?.details?.name || "Établissement"}</h2>
                    <p className="text-xs opacity-90">{property?.location?.address}</p>
                  </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-slate-500 uppercase tracking-widest text-[10px]">Dates choisies</span>
                      <span className="text-primary">{nights} nuits</span>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <CalendarIcon className="h-5 w-5 text-slate-400" />
                      <div className="text-sm font-black text-slate-700">
                        {format(date.from, "dd MMM", { locale: fr })} — {format(date.to, "dd MMM", { locale: fr })}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Prix total ({nights} nuits)</span>
                      <span className="font-black text-slate-900">{formatPrice(fullPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                      <span className="text-xs font-bold text-primary">À PAYER EN LIGNE (14%)</span>
                      <span className="font-black text-primary">{formatPrice(depositPrice)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-500">À PAYER SUR PLACE (86%)</span>
                      <span className="font-black text-slate-700">{formatPrice(onSitePrice)}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                    <Info className="h-5 w-5 text-blue-600 shrink-0" />
                    <p className="text-[11px] text-blue-800 font-bold leading-relaxed">
                      ℹ Notre plateforme prélève uniquement 14% du montant total à titre de frais de service lors de votre réservation en ligne. Le solde restant (86%) est réglé directement sur place auprès du prestataire à votre arrivée.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3 border border-dashed border-slate-200">
                    <Info className="h-4 w-4 text-slate-400" />
                    <p className="text-[10px] text-slate-400 font-bold leading-tight uppercase">
                      Annulation gratuite jusqu'à 48h avant l'arrivée.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-primary/5 border-primary/10 rounded-2xl">
                <CardContent className="p-6 flex gap-4">
                  <ShieldCheck className="h-8 w-8 text-primary shrink-0" />
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">Garantie StayFloow</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Nous garantissons le prix le plus bas et une assistance 24/7 durant tout votre séjour.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PropertyBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>}>
      <PropertyBookingContent id={id} />
    </Suspense>
  );
}