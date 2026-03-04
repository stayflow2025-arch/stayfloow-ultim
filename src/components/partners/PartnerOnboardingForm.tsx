'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Gauge, Fuel, Route, ShieldCheck, Wallet, Baby, User, Mountain, Plane, Calendar as CalendarIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { OnboardingMap } from '@/components/onboarding-map';
import { useLanguage } from '@/context/language-context';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const NORMALIZATION_RATES: Record<string, number> = {
  EUR: 1,
  DZD: 145.2,
  USD: 1.08,
  GBP: 0.83,
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
  { id: 'studio', label: 'Studio', icon: <Building className="h-8 w-8" /> },
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
    livingRoomsCount: 0,
    gardensCount: 0,
    // Specifiques Hotel
    singleRoomsCount: 0,
    doubleRoomsCount: 0,
    parentalSuitesCount: 0,
    brand: '',
    model: '',
    year: '2023',
    transmission: 'Manuelle',
    fuel: 'Essence',
    seats: 5,
    duration: '1 jour',
    maxGroupSize: 10,
    languages: [] as string[],
    amenities: [] as string[],
    availableDates: [] as Date[],
  });

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
    if (!user) {
      toast({ variant: 'destructive', title: 'Connexion requise' });
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

      await updateDoc(doc(db, 'users', user.uid), { role: 'partner' });

      const finalData = {
        id: listingId,
        ownerId: user.uid,
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
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'listings', listingId), finalData);
      setCurrentStep(5);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la soumission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotos(prev => [...prev, reader.result as string].slice(0, 10));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  if (currentStep === 5) return (
    <div className="text-center py-20 bg-white rounded-3xl shadow-2xl animate-in zoom-in-95">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="h-16 w-16 text-primary" /></div>
      <h3 className="text-4xl font-black text-slate-900 mb-4">Profil Partenaire Activé !</h3>
      <p className="text-xl text-slate-600 max-w-lg mx-auto">Votre annonce est en cours de validation. Vous recevrez un email dès qu'elle sera en ligne.</p>
      <Button size="lg" className="mt-12 bg-primary px-10 h-14 font-black text-lg rounded-xl" asChild><a href="/partners/dashboard">Accéder au Dashboard</a></Button>
    </div>
  );

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
      <div className="bg-slate-100 h-2 w-full"><div className="bg-primary h-full transition-all duration-1000" style={{ width: `${(currentStep / steps.length) * 100}%` }} /></div>
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
              <span className={cn("text-[9px] font-black uppercase tracking-tighter", currentStep === s.id ? "text-primary" : "text-slate-300")}>{s.title}</span>
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
            <div className="space-y-2"><Label className="font-bold">Nom de votre service *</Label><Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} className="h-12 bg-slate-50" placeholder="Ex: Riad El Mansour" /></div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-2"><Label className="font-bold">{t('full_address')} *</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ville, Algérie..." className="h-12 bg-slate-50" /></div>
            <OnboardingMap location={formData.address} />
          </div>
        )}

        {currentStep === 3 && renderStep3(formData, setFormData, initialCategory, handleAIEnhance, isGenerating, t)}
        
        {currentStep === 4 && (
          <div className="space-y-10">
            <div className="space-y-4">
              <Label className="font-black text-lg">Photos professionnelles *</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-md">
                    <Image src={p} alt="Listing" fill className="object-cover" />
                    <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-red-50"><X className="h-3 w-3 text-red-500"/></button>
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
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="DZD">DZD (DA)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-lg">Prix unitaire (en {formData.listingCurrency}) *</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-14 text-xl font-black rounded-2xl bg-slate-50" placeholder="Ex: 75" />
                <p className="text-[10px] text-slate-400 italic">Ce prix sera converti en Euro pour le stockage de référence.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t flex justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1} className="font-bold text-slate-400">← {t('back')}</Button>
          <Button onClick={currentStep === 4 ? handleSubmit : handleNext} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">
            {isSubmitting ? <Loader2 className="animate-spin" /> : currentStep === 4 ? "Publier l'annonce" : t('continue') + " →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function renderStep3(formData: any, setFormData: any, category: string, onAI: any, isGen: boolean, t: any) {
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
          {/* TYPE DE BIEN - STYLE IMAGE */}
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

          {/* COMPOSITION - STYLE IMAGE */}
          <div className="space-y-6">
            <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <Counter icon={<Bed className="h-5 w-5"/>} label="Chambres" value={formData.roomsCount} onChange={v => setFormData({...formData, roomsCount: v})} />
                <Counter icon={<Bath className="h-5 w-5"/>} label="SDB" value={formData.bathroomsCount} onChange={v => setFormData({...formData, bathroomsCount: v})} />
                <Counter icon={<Utensils className="h-5 w-5"/>} label="Cuisines" value={0} onChange={() => {}} /> 
                <Counter icon={<Users className="h-5 w-5"/>} label="Toilettes" value={1} onChange={() => {}} /> 
                <Counter icon={<Sofa className="h-5 w-5"/>} label="Salons" value={formData.livingRoomsCount} onChange={v => setFormData({...formData, livingRoomsCount: v})} />
                <Counter icon={<Trees className="h-5 w-5"/>} label="Jardins" value={formData.gardensCount} onChange={v => setFormData({...formData, gardensCount: v})} />
              </div>
            </div>
          </div>

          {/* OPTIONS SPÉCIFIQUES HÔTEL */}
          {formData.propertyType === 'hotel' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10">
              <h4 className="font-black text-lg text-primary flex items-center gap-2">
                <Star className="h-5 w-5 fill-primary" /> Configuration des chambres de l'hôtel
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Counter icon={<Bed/>} label="Chambres Seules" value={formData.singleRoomsCount} onChange={v => setFormData({...formData, singleRoomsCount: v})} light />
                <Counter icon={<Users/>} label="Chambres Doubles" value={formData.doubleRoomsCount} onChange={v => setFormData({...formData, doubleRoomsCount: v})} light />
                <Counter icon={<Star/>} label="Suites Parentales (King)" value={formData.parentalSuitesCount} onChange={v => setFormData({...formData, parentalSuitesCount: v})} light />
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
              <Label className="font-black text-[10px] uppercase text-slate-400 flex items-center gap-2"><Clock className="h-3 w-3 text-primary" /> Durée</Label>
              <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="Ex: 3 jours" className="bg-white h-12" />
            </div>
            <Counter icon={<Users/>} label="Max Groupe" value={formData.maxGroupSize} onChange={v => setFormData({...formData, maxGroupSize: v})} />
            <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
              <Label className="font-black text-[10px] uppercase text-slate-400 flex items-center gap-2"><Globe className="h-3 w-3 text-primary" /> Langues</Label>
              <Input placeholder="Français, Arabe..." className="bg-white h-12" onBlur={(e) => setFormData({...formData, languages: e.target.value.split(',').map(l => l.trim())})} />
            </div>
          </div>

          {/* CALENDRIER DE DISPONIBILITÉ POUR LE GUIDE */}
          <div className="space-y-4">
            <Label className="font-black text-xl text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-6 w-6 text-primary" /> Dates de disponibilité *
            </Label>
            <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-slate-50 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Sélectionnez les jours où ce circuit est ouvert à la réservation. Vos clients ne pourront choisir que parmi ces dates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.availableDates.length > 0 ? (
                      formData.availableDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white border-slate-200 text-slate-700 px-3 py-2 rounded-xl font-bold flex items-center gap-2 shadow-sm animate-in fade-in zoom-in-95">
                          {format(date, "dd MMM yyyy", { locale: fr })}
                          <X className="h-3.5 w-3.5 cursor-pointer text-red-400 hover:text-red-600 transition-colors" onClick={() => setFormData({...formData, availableDates: formData.availableDates.filter((_, i) => i !== idx)})} />
                        </Badge>
                      ))
                    ) : (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                        <p className="text-xs font-bold text-amber-600 flex items-center gap-2">
                          <Info className="h-4 w-4" /> Aucune date sélectionnée
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-white flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={formData.availableDates}
                    onSelect={(dates) => setFormData({...formData, availableDates: dates || []})}
                    locale={fr}
                    disabled={{ before: new Date() }}
                    className="border-none p-0"
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
            <Wand2 className="h-4 w-4 mr-2"/> {isGen ? 'Génération...' : 'Améliorer avec l\'IA'}
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
          onClick={() => onChange(Math.max(0, value-1))} 
          className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary transition-all active:scale-90 hover:bg-primary hover:text-white"
        >
          <Minus className="h-4 w-4"/>
        </button>
        <span className="font-black text-lg min-w-[20px] text-center text-slate-900">{value}</span>
        <button 
          onClick={() => onChange(value+1)} 
          className="h-8 w-8 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-primary transition-all active:scale-90 hover:bg-primary hover:text-white"
        >
          <Plus className="h-4 w-4"/>
        </button>
      </div>
    </div>
  );
}
