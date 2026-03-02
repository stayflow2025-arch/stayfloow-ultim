
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
  Loader2, Wand2, X, Plus, Minus, Users, Home, Bed, Bath, Utensils, Fuel, Gauge, Calendar as CalendarIcon, Clock, Globe, Sofa, Trees, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { OnboardingMap } from '@/components/onboarding-map';
import { useLanguage } from '@/context/language-context';

interface Props {
  initialCategory: 'accommodation' | 'car_rental' | 'circuit';
}

export default function PartnerOnboardingForm({ initialCategory }: Props) {
  const { toast } = useToast();
  const db = useFirestore();
  const { t, locale } = useLanguage();
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
    listingCurrency: 'DZD',
    isDiscountEnabled: false,
    // Accommodation fields
    propertyType: 'hotel',
    roomsCount: 1,
    bathroomsCount: 1,
    kitchensCount: 0,
    toiletsCount: 1,
    livingRoomsCount: 0,
    gardensCount: 0,
    // Hotel specific room types
    singleRoomsCount: 0,
    parentalSuitesCount: 0,
    doubleRoomsCount: 0,
    // Car fields
    brand: '',
    model: '',
    year: '2023',
    transmission: 'Manuelle',
    fuel: 'Essence',
    seats: 5,
    // Circuit fields
    duration: '1 jour',
    maxGroupSize: 10,
    languages: [] as string[],
    // Shared
    amenities: [] as string[],
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
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length < 5) {
      toast({ variant: 'destructive', title: 'Photos manquantes', description: 'Veuillez ajouter au moins 5 photos.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const listingId = `list_${Date.now()}`;
      const finalData = {
        category: initialCategory,
        status: 'pending',
        partnerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: `${formData.dialCode} ${formData.phone}`
        },
        location: { address: formData.address, lat: 0, lng: 0 },
        details: {
          name: formData.listingName,
          description: formData.description,
          amenities: formData.amenities,
          ...(initialCategory === 'accommodation' ? {
            propertyType: formData.propertyType,
            roomsCount: formData.roomsCount,
            bathroomsCount: formData.bathroomsCount,
            kitchensCount: formData.kitchensCount,
            toiletsCount: formData.toiletsCount,
            livingRoomsCount: formData.livingRoomsCount,
            gardensCount: formData.gardensCount,
            ...(formData.propertyType === 'hotel' ? {
              singleRoomsCount: formData.singleRoomsCount,
              parentalSuitesCount: formData.parentalSuitesCount,
              doubleRoomsCount: formData.doubleRoomsCount,
            } : {})
          } : initialCategory === 'car_rental' ? {
            brand: formData.brand,
            model: formData.model,
            year: formData.year,
            transmission: formData.transmission,
            fuel: formData.fuel,
            seats: formData.seats,
          } : initialCategory === 'circuit' ? {
            duration: formData.duration,
            maxGroupSize: formData.maxGroupSize,
            languages: formData.languages,
          } : {})
        },
        price: parseFloat(formData.price) || 0,
        currency: formData.listingCurrency,
        isDiscountEnabled: formData.isDiscountEnabled,
        discountPercentage: formData.isDiscountEnabled ? 15 : 0,
        photos: photos,
        rating: 8.0,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'listings', listingId), finalData);
      setCurrentStep(5);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la soumission.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos].slice(0, 30));
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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
        <Label className="font-bold">
          {initialCategory === 'car_rental' ? t('brand') : initialCategory === 'circuit' ? t('circuit_title') : t('listing_name_label')} *
        </Label>
        <Input 
          value={formData.listingName} 
          onChange={e => setFormData({...formData, listingName: e.target.value})} 
          placeholder={initialCategory === 'car_rental' ? "Ex: Dacia Duster 4x4 Premium" : initialCategory === 'circuit' ? "Ex: Safari Sahara 3 Jours" : "Ex: Riad Alger Luxury"} 
          className="h-12 bg-slate-50" 
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2"><Label className="font-bold">{t('full_address')} *</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ville, Point de départ, Point de rdv..." className="h-12 bg-slate-50" /></div>
      <OnboardingMap location={formData.address} />
    </div>
  );

  const renderStep3 = () => {
    if (initialCategory === 'car_rental') {
      const carOptions = [
        "Transmission automatique", "Climatisation", "Kilométrage illimité",
        "Assurance tous risques incluse", "Voiture avec GPS intégré",
        "Siège bébé / rehausseur", "4x4 / SUV", "Essence / Diesel / Électrique",
        "Âge minimum du conducteur", "Boîte manuelle", "Nombre de places (5+ ou 7+)",
        "Annulation gratuite", "Payez sur place", "Voiture récente (moins de 5 ans)",
        "Fournisseur bien noté (rating 8+)"
      ];

      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="font-bold">{t('brand')} *</Label>
              <Input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Ex: Toyota" className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">{t('model')} *</Label>
              <Input value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Ex: Corolla" className="h-12 bg-slate-50" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">{t('year')} *</Label>
              <Input value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} placeholder="Ex: 2023" className="h-12 bg-slate-50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <CounterField icon={<Users/>} label="Places" value={formData.seats} onChange={v => setFormData({...formData, seats: v})} />
            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-primary/5 p-3 rounded-xl text-primary"><Gauge/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Boîte</span>
              <RadioGroup value={formData.transmission} onValueChange={v => setFormData({...formData, transmission: v})} className="flex gap-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="Manuelle" id="m"/><Label htmlFor="m" className="text-xs font-bold">M</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Automatique" id="a"/><Label htmlFor="a" className="text-xs font-bold">A</Label></div>
              </RadioGroup>
            </div>
            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-primary/5 p-3 rounded-xl text-primary"><Fuel/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Énergie</span>
              <RadioGroup value={formData.fuel} onValueChange={v => setFormData({...formData, fuel: v})} className="flex gap-2">
                <div className="flex items-center space-x-2"><RadioGroupItem value="Essence" id="ess"/><Label htmlFor="ess" className="text-[10px]">Essence</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="Diesel" id="die"/><Label htmlFor="die" className="text-[10px]">Diesel</Label></div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-lg">{t('amenities_label')} *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carOptions.map(option => (
                <div key={option} className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                  formData.amenities.includes(option) ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                )}>
                  <Checkbox 
                    id={option} 
                    checked={formData.amenities.includes(option)}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, option] : prev.amenities.filter(a => a !== option) }))}
                  />
                  <label htmlFor={option} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">{t(option)}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-black text-lg">{t('description_label')}</Label>
              <Button variant="outline" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-primary border-primary rounded-full font-bold">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                {t('ai_improve_btn')}
              </Button>
            </div>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Décrivez l'état du véhicule, les conditions de remise des clés..."
              className="min-h-[150px] rounded-2xl bg-slate-50"
            />
          </div>
        </div>
      );
    }

    if (initialCategory === 'circuit') {
      const circuitOptions = [
        "Guide inclus (local arabe/français)", "Repas inclus (halal)", "Transport 4x4 (désert)",
        "Durée 1 jour", "Durée multi-jours (2-7 jours)", "Annulation gratuite",
        "Langue arabe", "Langue français", "Thème désert/Sahara",
        "Thème culturel/historique (pyramides, ruines)", "Thème Nil/croisière",
        "Groupe petit (max 10 pers)", "Assurance incluse",
        "Départ depuis aéroport (Alger/Caire)", "Rating guide 8+"
      ];

      return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
            <CounterField icon={<Users/>} label="Taille max du groupe" value={formData.maxGroupSize} onChange={v => setFormData({...formData, maxGroupSize: v})} />
            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <div className="bg-primary/5 p-3 rounded-xl text-primary"><Clock/></div>
              <span className="text-[10px] font-black text-slate-400 uppercase">Durée estimée</span>
              <Input value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="Ex: 3 jours / 2 nuits" className="h-10 text-center font-bold border-none shadow-none focus:ring-0" />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-lg">{t('amenities_label')} *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circuitOptions.map(option => (
                <div key={option} className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                  formData.amenities.includes(option) ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                )}>
                  <Checkbox 
                    id={option} 
                    checked={formData.amenities.includes(option)}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, option] : prev.amenities.filter(a => a !== option) }))}
                  />
                  <label htmlFor={option} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">{t(option)}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="font-black text-lg">Langues parlées par le guide *</Label>
            <div className="flex flex-wrap gap-3">
              {["Arabe", "Français", "Anglais", "Espagnol", "Allemand"].map(lang => (
                <Button 
                  key={lang} 
                  type="button"
                  variant={formData.languages.includes(lang) ? "default" : "outline"}
                  onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.includes(lang) ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang] }))}
                  className="rounded-full font-bold"
                >
                  {lang === 'Français' ? '🇫🇷' : lang === 'Arabe' ? '🇩🇿' : lang === 'Anglais' ? '🇬🇧' : lang === 'Espagnol' ? '🇪🇸' : '🇩🇪'} {lang}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="font-black text-lg">{t('description_label')}</Label>
              <Button variant="outline" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-primary border-primary rounded-full font-bold">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
                {t('ai_improve_btn')}
              </Button>
            </div>
            <Textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              placeholder="Détaillez le programme jour par jour..."
              className="min-h-[200px] rounded-2xl bg-slate-50"
            />
          </div>
        </div>
      );
    }

    const amenitiesList = [
      "Wi-Fi gratuit", "Climatisation", "Parking gratuit", "Petit-déjeuner inclus",
      "Piscine", "Restaurant sur place", "Réception 24h/24", "Animaux domestiques acceptés",
      "Terrasse / balcon / vue", "Cuisine / coin cuisine", "Prises électriques près du lit",
      "Salle de bain privée", "Lit bébé / lit supplémentaire", "Ascenseur", "Accessibilité PMR"
    ];

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
        {/* Type d'hébergement */}
        <div className="space-y-4">
          <Label className="font-black text-lg">Quel type de bien proposez-vous ? *</Label>
          <RadioGroup 
            value={formData.propertyType} 
            onValueChange={val => setFormData({...formData, propertyType: val})}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { id: 'hotel', label: 'Hôtel', icon: Building },
              { id: 'villa', label: 'Villa', icon: Home },
              { id: 'apartment', label: 'Appartement', icon: Home },
              { id: 'studio', label: 'Studio', icon: Home }
            ].map(type => (
              <Label key={type.id} htmlFor={type.id} className={cn(
                "flex flex-col items-center gap-3 p-6 border-2 rounded-2xl cursor-pointer transition-all",
                formData.propertyType === type.id ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200"
              )}>
                <RadioGroupItem value={type.id} id={type.id} className="sr-only" />
                <type.icon className="h-8 w-8" />
                <span className="font-bold">{type.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Configuration des chambres (HÔTEL UNIQUEMENT) */}
        {formData.propertyType === 'hotel' && (
          <div className="space-y-6 animate-in zoom-in-95">
            <Label className="font-black text-lg flex items-center gap-2 text-primary">
              <Star className="h-5 w-5 fill-primary" /> {t('chambers')}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-primary/10">
              <CounterField icon={<Bed/>} label={t('single_rooms')} value={formData.singleRoomsCount} onChange={v => setFormData({...formData, singleRoomsCount: v})} />
              <CounterField icon={<Star/>} label={t('parental_suites')} value={formData.parentalSuitesCount} onChange={v => setFormData({...formData, parentalSuitesCount: v})} />
              <CounterField icon={<Users/>} label={t('double_rooms')} value={formData.doubleRoomsCount} onChange={v => setFormData({...formData, doubleRoomsCount: v})} />
            </div>
          </div>
        )}

        {/* Composition du logement (GÉNÉRAL) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
          <CounterField icon={<Bed/>} label={t('chambers')} value={formData.roomsCount} onChange={v => setFormData({...formData, roomsCount: v})} />
          <CounterField icon={<Bath/>} label={t('bathrooms')} value={formData.bathroomsCount} onChange={v => setFormData({...formData, bathroomsCount: v})} />
          <CounterField icon={<Utensils/>} label={t('kitchens')} value={formData.kitchensCount} onChange={v => setFormData({...formData, kitchensCount: v})} />
          <CounterField icon={<Users/>} label={t('toilets')} value={formData.toiletsCount} onChange={v => setFormData({...formData, toiletsCount: v})} />
          <CounterField icon={<Sofa/>} label={t('living_rooms')} value={formData.livingRoomsCount} onChange={v => setFormData({...formData, livingRoomsCount: v})} />
          <CounterField icon={<Trees/>} label={t('gardens')} value={formData.gardensCount} onChange={v => setFormData({...formData, gardensCount: v})} />
        </div>

        {/* Équipements */}
        <div className="space-y-4">
          <Label className="font-black text-lg">{t('amenities_label')} *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenitiesList.map(amenity => (
              <div key={amenity} className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer group",
                formData.amenities.includes(amenity) ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
              )}>
                <Checkbox 
                  id={amenity} 
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter(a => a !== amenity) }))}
                />
                <label htmlFor={amenity} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">
                  {t(amenity)}
                  {amenity === "Petit-déjeuner inclus" && <span className="ml-2 bg-green-600 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase">Highlight</span>}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Description IA */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="font-black text-lg">{t('description_label')}</Label>
            <Button variant="outline" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-primary border-primary rounded-full font-bold">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              {t('ai_improve_btn')}
            </Button>
          </div>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="Ex: Niché au calme, cet appartement offre une vue imprenable sur la baie..."
            className="min-h-[150px] rounded-2xl bg-slate-50"
          />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <Label className="font-black text-lg">{t('photos_label')}</Label>
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

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Devise de l'annonce</Label>
            <Select 
              value={formData.listingCurrency} 
              onValueChange={v => setFormData({...formData, listingCurrency: v})}
            >
              <SelectTrigger className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold">
                <SelectValue placeholder="Choisir une devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DZD">DZD (DA)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="CHF">CHF (CHF)</SelectItem>
                <SelectItem value="EGP">EGP (E£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="font-black text-lg">{t('base_price_label')} *</Label>
            <div className="relative">
              <Input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                placeholder="Ex: 12500" 
                className="h-14 pl-16 text-xl font-black rounded-2xl bg-slate-50 border-slate-100"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">
                {formData.listingCurrency === 'DZD' ? 'DA' : 
                 formData.listingCurrency === 'EUR' ? '€' : 
                 formData.listingCurrency === 'USD' ? '$' : 
                 formData.listingCurrency === 'GBP' ? '£' : 
                 formData.listingCurrency === 'EGP' ? 'E£' : 'CHF'}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-4 p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 transition-all cursor-pointer group hover:bg-primary/10">
          <Checkbox 
            id="discount" 
            checked={formData.isDiscountEnabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDiscountEnabled: !!checked }))}
            className="h-6 w-6 mt-1 rounded-lg"
          />
          <div className="space-y-1 cursor-pointer flex-1" onClick={() => setFormData(prev => ({ ...prev, isDiscountEnabled: !prev.isDiscountEnabled }))}>
            <Label htmlFor="discount" className="text-lg font-black text-slate-900 cursor-pointer flex items-center gap-2">
              Rendre mon offre attractive (-15% de rabais)
              <Badge className="bg-secondary text-primary border-none font-black text-[10px]">RECOMMANDÉ</Badge>
            </Label>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Les offres avec réduction sont mises en avant sur StayFloow.com et reçoivent en moyenne 3 fois plus de réservations. La remise sera appliquée automatiquement sur le prix affiché.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          {initialCategory === 'car_rental' ? 'Prix de location par jour (24h).' : initialCategory === 'circuit' ? 'Prix par personne (TTC).' : 'Prix par nuit pour l\'ensemble du logement ou par chambre.'}
        </p>
      </div>
    </div>
  );

  if (currentStep === 5) return (
    <div className="text-center py-20 bg-white rounded-3xl shadow-2xl animate-in zoom-in-95">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="h-16 w-16 text-primary" /></div>
      <h3 className="text-4xl font-black text-slate-900 mb-4">{t('success_msg_title')}</h3>
      <p className="text-xl text-slate-600 max-w-lg mx-auto">{t('success_msg_desc')}</p>
      <Button size="lg" className="mt-12 bg-primary px-10 h-14 font-black text-lg rounded-xl" asChild><a href="/">{t('back_home_btn')}</a></Button>
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

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="mt-12 pt-8 border-t flex justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1} className="font-bold text-slate-400">← {t('back')}</Button>
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">
              {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : t('submit_review_btn')}
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">
              {t('continue')} →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CounterField({ icon, label, value, onChange }: { icon: any, label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
      <div className="bg-primary/5 p-3 rounded-xl text-primary">{icon}</div>
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => onChange(Math.max(0, value - 1))} className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"><Minus className="h-4 w-4 text-slate-400" /></button>
        <span className="font-black text-lg w-4 text-center">{value}</span>
        <button type="button" onClick={() => onChange(value + 1)} className="h-8 w-8 rounded-full border border-primary text-primary flex items-center justify-center hover:bg-primary/5 transition-colors"><Plus className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
