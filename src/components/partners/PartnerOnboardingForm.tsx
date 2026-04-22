'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building, Car, Compass, MapPin, Upload, CheckCircle2, 
  Loader2, Wand2, X, Plus, Minus, Users, Bed, Bath, Sofa, Clock, Globe,
  Wifi, Wind, ParkingCircle, Coffee, Utensils, Waves, Star, Home, Layout, Trees,
  Gauge, Fuel, Route, ShieldCheck, Wallet, Baby, User, Mountain, Plane, Calendar as CalendarIcon,
  Info, Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, collection, setDoc, query, where, getDocs } from 'firebase/firestore';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { optimizeImage } from '@/lib/image-optimizer';
import { useToast } from '@/hooks/use-toast';
import { OnboardingMap } from '@/components/onboarding-map';
import { useLanguage } from '@/context/language-context';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import ReCAPTCHA from "react-google-recaptcha";
import { sendWelcomeEmailAction, sendAdminNewListingNotificationAction } from "@/app/actions/mail";
import { createListingAction } from "@/app/actions/listing";

const NORMALIZATION_RATES: Record<string, number> = {
  EUR: 1,
  DZD: 145.2,
  USD: 1.08,
  GBP: 0.83,
  CHF: 0.95,
  EGP: 52.5,
};

const ACCOMMODATION_AMENITIES = [
  { id: "Wi-Fi gratuit", icon: <Wifi className="h-4 w-4" /> },
  { id: "Piscine", icon: <Waves className="h-4 w-4" /> },
  { id: "Climatisation", icon: <Wind className="h-4 w-4" /> },
  { id: "Parking gratuit", icon: <ParkingCircle className="h-4 w-4" /> },
  { id: "Petit-déjeuner inclus", icon: <Coffee className="h-4 w-4" /> },
  { id: "Vue mer", icon: <Waves className="h-4 w-4" /> },
  { id: "Cuisine équipée", icon: <Utensils className="h-4 w-4" /> },
  { id: "Restaurant sur place", icon: <Utensils className="h-4 w-4" /> },
  { id: "Réception 24h/24", icon: <Clock className="h-4 w-4" /> },
  { id: "Animaux domestiques acceptés", icon: <Globe className="h-4 w-4" /> },
  { id: "Terrasse / balcon / vue", icon: <Building className="h-4 w-4" /> },
  { id: "Salle de bain privée", icon: <Bath className="h-4 w-4" /> },
];

const CAR_AMENITIES = [
  { id: "Transmission automatique", icon: <Gauge className="h-4 w-4" /> },
  { id: "Climatisation", icon: <Wind className="h-4 w-4" /> },
  { id: "Kilométrage illimité", icon: <Route className="h-4 w-4" /> },
  { id: "Assurance tous risques incluse", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "Voiture avec GPS intégré", icon: <MapPin className="h-4 w-4" /> },
  { id: "Siège bébé / rehausseur", icon: <Baby className="h-4 w-4" /> },
  { id: "4x4 / SUV", icon: <Car className="h-4 w-4" /> },
  { id: "Annulation gratuite", icon: <Clock className="h-4 w-4" /> },
  { id: "Payez sur place", icon: <Wallet className="h-4 w-4" /> },
  { id: "Essence", icon: <Fuel className="h-4 w-4" /> },
  { id: "Diesel", icon: <Fuel className="h-4 w-4" /> },
];

const CIRCUIT_AMENITIES = [
  { id: "Guide inclus (local arabe/français)", icon: <User className="h-4 w-4" /> },
  { id: "Repas inclus (halal)", icon: <Utensils className="h-4 w-4" /> },
  { id: "Transport 4x4 (désert)", icon: <Car className="h-4 w-4" /> },
  { id: "Annulation gratuite", icon: <Clock className="h-4 w-4" /> },
  { id: "Assurance incluse", icon: <ShieldCheck className="h-4 w-4" /> },
  { id: "Thème désert/Sahara", icon: <Mountain className="h-4 w-4" /> },
  { id: "Thème culturel/historique (pyramides, ruines)", icon: <Building className="h-4 w-4" /> },
  { id: "Thème Nil/croisière", icon: <Waves className="h-4 w-4" /> },
  { id: "Départ depuis aéroport (Alger/Caire)", icon: <Plane className="h-4 w-4" /> },
];

const PROPERTY_TYPES = [
  { id: 'hotel', label: 'Hôtel', icon: <Building className="h-8 w-8" /> },
  { id: 'villa', label: 'Villa', icon: <Home className="h-8 w-8" /> },
  { id: 'apartment', label: 'Appartement', icon: <Layout className="h-8 w-8" /> },
  { id: 'resort', label: 'Complexe hôtelier', icon: <Landmark className="h-8 w-8" /> },
];

interface Props {
  initialCategory: 'accommodation' | 'car_rental' | 'circuit';
}

export default function PartnerOnboardingForm({ initialCategory }: Props) {
  const { toast } = useToast();
  const db = useFirestore();
  const { user } = useUser();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dialCode: '+213',
    address: '',
    listingName: '',
    description: '',
    price: '',
    listingCurrency: 'EUR',
    propertyType: 'hotel',
    roomsCount: 1,
    bathroomsCount: 1,
    cuisinesCount: 0,
    toiletsCount: 1,
    maxCapacity: 2,
    livingRoomsCount: 0,
    gardensCount: 0,
    singleRoomsCount: 0,
    doubleRoomsCount: 0,
    parentalSuitesCount: 0,
    brand: '',
    model: '',
    year: '2023',
    transmission: 'Manuelle',
    fuel: 'Essence',
    seats: 5,
    duration: '5 jours', 
    maxGroupSize: 10,
    languages: [] as string[],
    amenities: [] as string[],
    availableDates: [] as Date[],
    applyDiscount: false, // Nouvelle option
    useOccupancyPricing: false,
    occupancyPrices: {} as Record<number, number>,
  });

  const [bookedDates, setBookedDates] = useState<Date[]>([]);

  // Récupération des dates déjà réservées (si applicable)
  useEffect(() => {
    const fetchBookings = async () => {
      // Note: Dans le cas d'un onboarding pur, listingId n'existe pas encore.
      // Cette logique est prête pour le cas d'une édition ou si un listingId est fourni.
      // @ts-ignore - On pourrait passer l'id du listing en prop si disponible
      if (!currentListingId || !db) return;

      try {
        const q = query(
          collection(db, "bookings"),
          where("listingId", "==", currentListingId),
          where("status", "in", ["approved", "pending_payment", "paid"])
        );
        const querySnapshot = await getDocs(q);
        const allBookedDays: Date[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const start = new Date(data.startDate);
          const end = new Date(data.endDate);
          
          // Remplir tous les jours entre start et end
          let current = new Date(start);
          while (current <= end) {
            allBookedDays.push(new Date(current));
            current.setDate(current.getDate() + 1);
          }
        });
        
        setBookedDates(allBookedDays);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [formData.id, db]);

  const steps = [
    { id: 1, title: t('step_info') },
    { id: 2, title: t('step_loc') },
    { id: 3, title: t('step_details') },
    { id: 4, title: t('step_photos_price') },
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAIEnhance = async () => {
    if (!formData.listingName || !formData.address) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Nom et adresse requis pour l\'IA.' });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generatePartnerDescription({
        listingType: initialCategory,
        listingName: formData.listingName,
        location: formData.address,
        keyFeatures: formData.amenities.length > 0 ? formData.amenities : ["Confortable", "Moderne"],
        existingDescription: formData.description
      });
      setFormData(prev => ({ ...prev, description: result.generatedDescription }));
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur IA', description: 'Impossible de générer la description.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!captchaToken) {
      toast({ variant: 'destructive', title: 'Captcha requis', description: 'Veuillez prouver que vous n\'êtes pas un robot.' });
      return;
    }

    if (photos.length < 1) {
      toast({ variant: 'destructive', title: 'Photos manquantes', description: 'Veuillez ajouter au moins une photo.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const listingId = `list_${Date.now()}`;
      const enteredPrice = parseFloat(formData.price) || 0;
      const rate = NORMALIZATION_RATES[formData.listingCurrency] || 1;
      const normalizedPriceEUR = enteredPrice / rate;

      const finalOwnerId = user?.uid || `guest_partner_${Date.now()}`;

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        setDocumentNonBlocking(userRef, { role: 'partner' }, { merge: true });
      }

      const finalData = {
        id: listingId,
        ownerId: finalOwnerId,
        category: initialCategory,
        status: 'pending',
        partnerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: `${formData.dialCode} ${formData.phone}`
        },
        location: { address: formData.address },
        details: {
          name: formData.listingName,
          description: formData.description,
          amenities: formData.amenities,
          availableDates: formData.availableDates.map(d => d.toISOString()),
          ...(initialCategory === 'accommodation' ? {
            propertyType: formData.propertyType,
            roomsCount: formData.roomsCount,
            bathroomsCount: formData.bathroomsCount,
            cuisinesCount: formData.cuisinesCount,
            toiletsCount: formData.toiletsCount,
            maxCapacity: formData.maxCapacity,
            livingRoomsCount: formData.livingRoomsCount,
            gardensCount: formData.gardensCount,
            singleRoomsCount: formData.singleRoomsCount,
            doubleRoomsCount: formData.doubleRoomsCount,
            parentalSuitesCount: formData.parentalSuitesCount,
            stars: 4
          } : initialCategory === 'car_rental' ? {
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            transmission: formData.transmission,
            fuel: formData.fuel,
            seats: formData.seats,
          } : {
            duration: formData.duration,
            maxGroupSize: formData.maxGroupSize,
            languages: formData.languages,
          })
        },
        price: normalizedPriceEUR, 
        currency: 'EUR', 
        photos: photos,
        rating: 8.0,
        isBoosted: formData.applyDiscount, // Enregistrement de la mise en avant
        useOccupancyPricing: formData.useOccupancyPricing,
        occupancyPrices: Object.fromEntries(
          Object.entries(formData.occupancyPrices).map(([occ, price]) => [
            occ, 
            (price / (NORMALIZATION_RATES[formData.listingCurrency] || 1))
          ])
        ),
        createdAt: new Date().toISOString()
      };

      // Persistance Côté Serveur (Plus robuste/Permissions bypass)
      const result = await createListingAction(finalData as any);
      
      if (!result.success) {
        throw new Error(result.error || "Échec de l'enregistrement sur le serveur");
      }

      await sendWelcomeEmailAction({
        hostName: formData.firstName,
        submissionType: initialCategory === 'accommodation' ? 'établissement' : initialCategory === 'car_rental' ? 'véhicule' : 'circuit',
        submissionName: formData.listingName,
        hostEmail: formData.email,
        referenceNumber: listingId.substring(5, 11).toUpperCase()
      });

      // Notification Admin
      await sendAdminNewListingNotificationAction({
        listingId: listingId,
        itemName: formData.listingName,
        itemType: initialCategory,
        hostName: `${formData.firstName} ${formData.lastName}`,
        hostEmail: formData.email,
        location: formData.address
      });

      setCurrentStep(5);
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast({ 
        variant: 'destructive', 
        title: 'Échec de la soumission', 
        description: error.message || 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsProcessingPhotos(true);
      try {
        const newPhotos: string[] = [];
        for (const file of Array.from(files)) {
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          // Optimisation HD avant ajout
          const optimized = await optimizeImage(base64);
          newPhotos.push(optimized);
        }
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 10));
      } catch (err) {
        console.error("Photo optimization error:", err);
        toast({ variant: 'destructive', title: 'Erreur photo', description: 'Une ou plusieurs photos n\'ont pas pu être traitées.' });
      } finally {
        setIsProcessingPhotos(false);
      }
    }
  };

  if (currentStep === 5) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl shadow-2xl animate-in zoom-in-95">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
        <h3 className="text-4xl font-black text-slate-900 mb-4">Offre Soumise avec Succès !</h3>
        <p className="text-xl text-slate-600 max-w-lg mx-auto">
          Merci {formData.firstName} ! Un e-mail de bienvenue vient de vous être envoyé à <strong>{formData.email}</strong>. Pensez à vérifier vos courriers indésirables.
        </p>
        <div className="mt-12 flex flex-col gap-4 max-w-xs mx-auto">
          <Button size="lg" className="bg-primary h-14 font-black rounded-xl" asChild>
            <a href="/auth/login">Se connecter</a>
          </Button>
          <Button variant="ghost" className="font-bold text-slate-400" onClick={() => window.location.href = '/'}>
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
      <div className="bg-slate-100 h-2 w-full">
        <div 
          className="bg-primary h-full transition-all duration-1000" 
          style={{ width: `${(currentStep / steps.length) * 100}%` }} 
        />
      </div>
      <CardContent className="p-10">
        <div className="flex justify-between mb-12 overflow-x-auto pb-4 no-scrollbar">
          {steps.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black border-2 transition-all",
                currentStep >= s.id ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-300"
              )}>
                {currentStep > s.id ? <CheckCircle2 className="h-5 w-5"/> : s.id}
              </div>
              <span className={cn("text-[9px] font-black uppercase tracking-tighter", currentStep === s.id ? "text-primary" : "text-slate-300")}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="font-bold">{t('first_name')} *</Label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-12 bg-slate-50" /></div>
              <div className="space-y-2"><Label className="font-bold">{t('last_name')} *</Label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-12 bg-slate-50" /></div>
              <div className="space-y-2"><Label className="font-bold">{t('pro_email')} *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12 bg-slate-50" /></div>
              <div className="space-y-2">
                <Label className="font-bold">{t('phone_whatsapp')} *</Label>
                <div className="flex gap-2">
                  <Input value={formData.dialCode} onChange={e => setFormData({...formData, dialCode: e.target.value})} className="w-24 h-12 text-center font-bold bg-slate-50" />
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 flex-1 bg-slate-50" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Nom de votre service *</Label>
              <Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} className="h-12 bg-slate-50" placeholder="Ex: Riad El Mansour" />
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="font-bold">{t('full_address')} *</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ville, Algérie..." className="h-12 bg-slate-50" />
            </div>
            <OnboardingMap location={formData.address} />
          </div>
        )}

        {currentStep === 3 && renderStep3(formData, setFormData, initialCategory, handleAIEnhance, isGenerating, t, bookedDates)}
        
        {currentStep === 4 && (
          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="font-black text-lg">Photos professionnelles *</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                    <Image src={p} alt="Listing" fill className="object-cover" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-50">
                      <X className="h-3 w-3 text-red-500"/>
                    </button>
                  </div>
                ))}
                <label className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
                  <Upload className="h-8 w-8 text-primary mb-2" />
                  <span className="text-[10px] font-black text-primary uppercase">Ajouter</span>
                  <input type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Saisir le prix en :</Label>
                <Select value={formData.listingCurrency} onValueChange={v => setFormData({...formData, listingCurrency: v})}>
                  <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                    <SelectItem value="DZD">DZD (DA) - Dinar Algérien</SelectItem>
                    <SelectItem value="USD">USD ($) - Dollar US</SelectItem>
                    <SelectItem value="GBP">GBP (£) - Livre Sterling</SelectItem>
                    <SelectItem value="CHF">CHF (₣) - Franc Suisse</SelectItem>
                    <SelectItem value="EGP">EGP (E£) - Livre Égyptienne</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-lg">Prix unitaire (en {formData.listingCurrency}) *</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-14 text-xl font-black rounded-2xl bg-slate-50" placeholder="Ex: 75" disabled={formData.useOccupancyPricing} />
                <p className="text-[10px] text-slate-400 italic">Ce prix sera converti en Euro pour le stockage de référence. {formData.useOccupancyPricing && "(Désactivé car le prix par personne est activé)"}</p>
              </div>
            </div>

            {/* SECTION PRIX PAR NOMBRE DE PERSONNES (OCCUPANCY) */}
            {initialCategory === 'accommodation' && (
              <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <div 
                  className="flex items-center space-x-4 cursor-pointer group" 
                  onClick={() => setFormData({...formData, useOccupancyPricing: !formData.useOccupancyPricing})}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm",
                    formData.useOccupancyPricing ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-transparent"
                  )}>
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-black text-slate-900 cursor-pointer text-base">Définir des prix différents selon le nombre de personnes</Label>
                    <p className="text-xs text-slate-500 font-medium italic text-primary">Pratique pour les appartements, villas et maisons.</p>
                  </div>
                </div>

                {formData.useOccupancyPricing && (
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {Array.from({ length: formData.maxCapacity }, (_, i) => i + 1).map((occ) => (
                      <div key={occ} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                          <Users className="h-3 w-3 text-primary" /> Prix pour {occ} {occ > 1 ? 'personnes' : 'personne'}
                        </Label>
                        <div className="relative">
                          <Input 
                            type="number" 
                            placeholder="Prix" 
                            className="pl-8 h-12 font-black border-slate-100" 
                            value={formData.occupancyPrices[occ] || ''} 
                            onChange={(e) => setFormData({
                              ...formData, 
                              occupancyPrices: { ...formData.occupancyPrices, [occ]: parseFloat(e.target.value) }
                            })}
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                            {formData.listingCurrency === 'DZD' ? 'DA' : 
                             formData.listingCurrency === 'EUR' ? '€' : 
                             formData.listingCurrency === 'USD' ? '$' : 
                             formData.listingCurrency === 'GBP' ? '£' : 
                             formData.listingCurrency === 'CHF' ? 'CHF' : 'E£'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOUVELLES OPTIONS : BOOST & MENTION FRAIS */}
            <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div 
                className="flex items-center space-x-4 cursor-pointer group" 
                onClick={() => setFormData({...formData, applyDiscount: !formData.applyDiscount})}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm",
                  formData.applyDiscount ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-transparent"
                )}>
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <Label className="font-black text-slate-900 cursor-pointer text-base">Mettre en avant mon offre avec une réduction de 10%</Label>
                  <p className="text-xs text-slate-500 font-medium italic">Votre annonce sera boostée sur le site avec un badge "Promotion" pour attirer plus de voyageurs.</p>
                </div>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex gap-4 items-start bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-sm font-bold text-slate-800 leading-tight">
                    Information sur le système de paiement StayFloow :
                  </p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Notre plateforme prélève uniquement <strong>14% de frais de service</strong> sur le montant total de la réservation. Ce montant est payé directement par le client sur le site lors de sa réservation.
                  </p>
                  <div className="p-3 bg-white/50 rounded-xl border border-primary/5">
                    <p className="text-xs font-black text-primary uppercase tracking-tighter">
                      La différence (86%) vous sera versée directement par le client, soit à son arrivée sur place, soit selon vos modalités de paiement habituelles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-4 border-t flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={(t) => setCaptchaToken(t)}
              />
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t flex justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1} className="font-bold text-slate-400">
            ← {t('back')}
          </Button>
          <Button 
            onClick={currentStep === 4 ? handleSubmit : handleNext} 
            disabled={isSubmitting || (currentStep === 4 && !captchaToken)} 
            className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : currentStep === 4 ? "Publier l'annonce" : t('continue') + " →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderStep3(formData: any, setFormData: any, category: string, onAI: any, isGen: boolean, t: any, bookedDates: Date[]) {
  const toggleAmenity = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      amenities: prev.amenities.includes(id) 
        ? prev.amenities.filter((a: string) => a !== id)
        : [...prev.amenities, id]
    }));
  };

  return (
    <div className="space-y-10">
      {category === 'accommodation' && (
        <div className="space-y-12">
          <div className="space-y-6">
            <Label className="font-black text-xl text-slate-900">Quel type de bien proposez-vous ? *</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({...formData, propertyType: type.id})}
                  className={cn(
                    "flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all gap-4 h-40 shadow-sm",
                    formData.propertyType === type.id 
                      ? "border-primary bg-primary/5 text-primary scale-[1.02] shadow-lg ring-1 ring-primary/20" 
                      : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                  )}
                >
                  <div className={cn("transition-transform", formData.propertyType === type.id ? "scale-110" : "")}>
                    {type.icon}
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
                <Counter icon={<Bed className="h-5 w-5"/>} label="Chambres" value={formData.roomsCount} onChange={(v: number) => setFormData({...formData, roomsCount: v})} />
                <Counter icon={<Bath className="h-5 w-5"/>} label="SDB" value={formData.bathroomsCount} onChange={(v: number) => setFormData({...formData, bathroomsCount: v})} />
                <Counter icon={<Utensils className="h-5 w-5"/>} label="Cuisines" value={formData.cuisinesCount} onChange={(v: number) => setFormData({...formData, cuisinesCount: v})} /> 
                <Counter icon={<Users className="h-5 w-5"/>} label="Toilettes" value={formData.toiletsCount} onChange={(v: number) => setFormData({...formData, toiletsCount: v})} /> 
                <Counter icon={<Sofa className="h-5 w-5"/>} label="Salons" value={formData.livingRoomsCount} onChange={(v: number) => setFormData({...formData, livingRoomsCount: v})} />
                <Counter icon={<Trees className="h-5 w-5"/>} label="Jardins" value={formData.gardensCount} onChange={(v: number) => setFormData({...formData, gardensCount: v})} />
                <Counter icon={<Users className="h-5 w-5"/>} label="Capacité" value={formData.maxCapacity} onChange={(v: number) => setFormData({...formData, maxCapacity: v})} />
              </div>
            </div>
          </div>

          {formData.propertyType === 'hotel' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
              <h4 className="font-black text-lg text-primary flex items-center gap-2">
                <Star className="h-5 w-5 fill-primary" /> Configuration des chambres de l'hôtel
              </h4>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">Précisez le nombre de chambres disponibles par catégorie :</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Counter icon={<Bed/>} label="Chambres Seules" value={formData.singleRoomsCount} onChange={(v: number) => setFormData({...formData, singleRoomsCount: v})} light />
                <Counter icon={<Users/>} label="Chambres Doubles" value={formData.doubleRoomsCount} onChange={(v: number) => setFormData({...formData, doubleRoomsCount: v})} light />
                <Counter icon={<Star/>} label="Suites Parentales (King)" value={formData.parentalSuitesCount} onChange={(v: number) => setFormData({...formData, parentalSuitesCount: v})} light />
              </div>
            </div>
          )}


          <div className="space-y-4">
            <Label className="font-black text-lg">Équipements & Inclusions *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-inner">
              {ACCOMMODATION_AMENITIES.map((amenity) => (
                <div 
                  key={amenity.id} 
                  onClick={() => toggleAmenity(amenity.id)}
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    formData.amenities.includes(amenity.id) ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-transparent"
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 group-hover:text-primary transition-colors">{amenity.icon}</span>
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      formData.amenities.includes(amenity.id) ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {amenity.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION CALENDRIER DE DISPONIBILITÉ */}
          <div className="space-y-6">
            <Label className="font-black text-xl text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" /> Calendrier de disponibilité *
            </Label>
            <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-slate-50 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Sélectionnez les jours où votre hébergement est disponible à la location. 
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Astuce : Cliquez sur les jours pour les activer ou les désactiver.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.availableDates.length > 0 ? (
                      formData.availableDates.sort((a: Date, b: Date) => a.getTime() - b.getTime()).slice(0, 8).map((date: Date, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-white border-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95">
                          {format(date, "dd MMM", { locale: fr })}
                          <X className="h-3.5 w-3.5 cursor-pointer text-red-400 hover:text-red-600 transition-colors" onClick={() => setFormData({...formData, availableDates: formData.availableDates.filter((d: any) => d.getTime() !== date.getTime())})} />
                        </Badge>
                      ))
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl w-full">
                        <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                          <Info className="h-4 w-4" /> Aucun jour sélectionné. Votre bien ne sera pas visible.
                        </p>
                      </div>
                    )}
                    {formData.availableDates.length > 8 && (
                      <Badge variant="outline" className="px-3 py-2 rounded-xl font-bold border-slate-200 bg-white">
                        + {formData.availableDates.length - 8} autres jours
                      </Badge>
                    )}
                  </div>

                  {/* Légende */}
                  <div className="pt-6 space-y-3 border-t border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-primary rounded-full shadow-sm" />
                      <span className="text-[10px] font-black uppercase text-slate-500">Disponible (Votre choix)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-slate-200 rounded-full" />
                      <span className="text-[10px] font-black uppercase text-slate-400">Non mis en location</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-400/20" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-red-400">Période déjà réservée (Indisponible)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white flex justify-center w-full max-w-[350px] mx-auto relative">
                  <Calendar
                    mode="multiple"
                    selected={formData.availableDates}
                    onSelect={(dates) => {
                      setFormData((prev: any) => ({
                        ...prev,
                        availableDates: dates || []
                      }));
                    }}
                    locale={fr}
                    disabled={[
                      { before: new Date() },
                      ...bookedDates.map(d => ({ from: d, to: d })) // Désactiver les dates réservées
                    ]}
                    className="border-none p-0"
                    numberOfMonths={1}
                    classNames={{
                      button_previous: "absolute left-4",
                      button_next: "absolute right-4",
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {category === 'car_rental' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2"><Label className="font-bold">Marque</Label><Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Ex: Dacia" className="bg-slate-50 h-12" /></div>
            <div className="space-y-2"><Label className="font-bold">Modèle</Label><Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Ex: Duster" className="bg-slate-50 h-12" /></div>
            <div className="space-y-2"><Label className="font-bold">Année</Label><Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="bg-slate-50 h-12" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-bold">Transmission</Label>
                <Select value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})}>
                  <SelectTrigger className="bg-slate-50 h-12"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Manuelle">Manuelle</SelectItem><SelectItem value="Automatique">Automatique</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold">Carburant</Label>
                <Select value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})}>
                  <SelectTrigger className="bg-slate-50 h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Essence">Essence</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Électrique">Électrique</SelectItem>
                    <SelectItem value="Hybride">Hybride</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-lg">Équipements & Options du véhicule *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-inner">
              {CAR_AMENITIES.map((amenity) => (
                <div 
                  key={amenity.id} 
                  onClick={() => toggleAmenity(amenity.id)}
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    formData.amenities.includes(amenity.id) ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-transparent"
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 group-hover:text-primary transition-colors">{amenity.icon}</span>
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      formData.amenities.includes(amenity.id) ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {amenity.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {category === 'circuit' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <Label className="font-black text-[10px] uppercase text-slate-400 flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-primary" /> Nombre de jours</Label>
              <Input 
                type="number" 
                value={parseInt(formData.duration) || 1} 
                onChange={e => setFormData({...formData, duration: `${e.target.value} jours`})} 
                className="bg-white h-12 font-bold" 
              />
            </div>
            <Counter icon={<Users/>} label="Max Groupe" value={formData.maxGroupSize} onChange={(v: number) => setFormData({...formData, maxGroupSize: v})} />
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <Label className="font-black text-[10px] uppercase text-slate-400 flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-primary" /> Langues</Label>
              <Input placeholder="Français, Arabe..." className="bg-white h-12" onBlur={(e) => setFormData({...formData, languages: e.target.value.split(',').map(l => l.trim())})} />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-xl text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" /> Dates de départs disponibles *
            </Label>
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-50 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Sélectionnez les <strong>dates de début</strong> du circuit. Le système affichera automatiquement la plage complète de {formData.duration} aux clients.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.availableDates.length > 0 ? (
                      formData.availableDates.sort((a: Date, b: Date) => a.getTime() - b.getTime()).map((date: Date, idx: number) => (
                        <Badge key={idx} variant="secondary" className="bg-white border-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95">
                          {format(date, "dd MMM yyyy", { locale: fr })}
                          <X className="h-3.5 w-3.5 cursor-pointer text-red-400 hover:text-red-600 transition-colors" onClick={() => setFormData({...formData, availableDates: formData.availableDates.filter((_: any, i: number) => i !== idx)})} />
                        </Badge>
                      ))
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                          <Info className="h-4 w-4" /> Aucune date de départ sélectionnée
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white flex justify-center w-full max-w-[350px] mx-auto relative">
                  <Calendar
                    mode="multiple"
                    selected={formData.availableDates}
                    onSelect={(dates) => {
                      const newDates = dates || [];
                      setFormData((prev: any) => ({
                        ...prev,
                        availableDates: newDates
                      }));
                    }}
                    locale={fr}
                    disabled={[
                      { before: new Date() },
                      ...bookedDates.map(d => ({ from: d, to: d }))
                    ]}
                    className="border-none p-0"
                    classNames={{
                      button_previous: "absolute left-4",
                      button_next: "absolute right-4",
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-lg">Services inclus & Thématiques *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-inner">
              {CIRCUIT_AMENITIES.map((amenity) => (
                <div 
                  key={amenity.id} 
                  onClick={() => toggleAmenity(amenity.id)}
                  className="flex items-center space-x-3 cursor-pointer group p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className={cn(
                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                    formData.amenities.includes(amenity.id) ? "bg-primary border-primary text-white" : "bg-white border-slate-300 text-transparent"
                  )}>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 group-hover:text-primary transition-colors">{amenity.icon}</span>
                    <span className={cn(
                      "text-sm font-bold transition-colors",
                      formData.amenities.includes(amenity.id) ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                    )}>
                      {amenity.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="font-black text-lg">Description attractive</Label>
          <Button variant="ghost" size="sm" onClick={onAI} disabled={isGen} className="text-primary font-black border border-primary/20 rounded-lg">
            <Wand2 className="h-4 w-4 mr-2"/> {isGen ? 'Génération...' : 'Amériorer avec l\'IA'}
          </Button>
        </div>
        <Textarea 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Décrivez votre offre en détails pour attirer les clients..."
          className="min-h-[150px] bg-slate-50 rounded-3xl border-slate-200" 
        />
      </div>
    </div>
  );
}

function Counter({ icon, label, value, onChange, light = false }: any) {
  return (
    <div className={cn(
      "p-5 rounded-3xl flex flex-col items-center gap-3 border transition-all hover:shadow-md group",
      light ? "bg-white border-primary/10" : "bg-white border-slate-100 shadow-sm"
    )}>
      <div className="text-primary opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{label}</span>
      <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
        <button 
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))} 
          className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary transition-all active:scale-90 hover:bg-primary hover:text-white"
        >
          <Minus className="h-4 w-4"/>
        </button>
        <span className="font-black text-lg min-w-[20px] text-center text-slate-900">{value}</span>
        <button 
          type="button"
          onClick={() => onChange(value + 1)} 
          className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary transition-all active:scale-90 hover:bg-primary hover:text-white"
        >
          <Plus className="h-4 w-4"/>
        </button>
      </div>
    </div>
  );
}
