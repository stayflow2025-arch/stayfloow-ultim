
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
  Loader2, Wand2, X, Plus, Minus, Users, Home, Bed, Bath, Utensils, Fuel, Gauge, Clock, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { OnboardingMap } from '@/components/onboarding-map';
import { useLanguage } from '@/context/language-context';

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
    listingCurrency: 'DZD',
    isDiscountEnabled: false,
    propertyType: 'hotel',
    roomsCount: 1,
    bathroomsCount: 1,
    kitchensCount: 0,
    toiletsCount: 1,
    livingRoomsCount: 0,
    gardensCount: 0,
    singleRoomsCount: 0,
    parentalSuitesCount: 0,
    doubleRoomsCount: 0,
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
      toast({ variant: 'destructive', title: 'Connexion requise', description: 'Veuillez vous connecter pour soumettre une annonce.' });
      return;
    }

    if (photos.length < 1) {
      toast({ variant: 'destructive', title: 'Photos manquantes', description: 'Veuillez ajouter au moins une photo.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const listingId = `list_${Date.now()}`;
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
        photos: photos,
        rating: 8.0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'listings', listingId), finalData);
      setCurrentStep(5);
    } catch (error) {
      console.error("Submission error:", error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Échec de la soumission. Vérifiez votre connexion.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to resize images to avoid 1MB Firestore limit
  const resizeImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compresse à 70%
      };
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const resized = await resizeImage(reader.result as string);
          setPhotos(prev => [...prev, resized].slice(0, 30));
        };
        reader.readAsDataURL(file);
      });
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
          placeholder={initialCategory === 'car_rental' ? "Ex: Dacia Duster 4x4" : initialCategory === 'circuit' ? "Ex: Safari Sahara" : "Ex: Riad Alger"} 
          className="h-12 bg-slate-50" 
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2"><Label className="font-bold">{t('full_address')} *</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ville, Algérie..." className="h-12 bg-slate-50" /></div>
      <OnboardingMap location={formData.address} />
    </div>
  );

  const renderStep3 = () => {
    const amenitiesList = initialCategory === 'accommodation' ? [
      "Wi-Fi gratuit", "Climatisation", "Parking gratuit", "Petit-déjeuner inclus",
      "Piscine", "Restaurant sur place", "Réception 24h/24"
    ] : initialCategory === 'car_rental' ? [
      "Boîte automatique", "Climatisation", "Kilométrage illimité", "Assurance incluse"
    ] : [
      "Guide inclus", "Repas inclus", "Transport 4x4", "Annulation gratuite"
    ];

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        {initialCategory === 'accommodation' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border">
            <CounterField icon={<Bed/>} label={t('chambers')} value={formData.roomsCount} onChange={v => setFormData({...formData, roomsCount: v})} />
            <CounterField icon={<Bath/>} label={t('bathrooms')} value={formData.bathroomsCount} onChange={v => setFormData({...formData, bathroomsCount: v})} />
            <CounterField icon={<Sofa/>} label={t('living_rooms')} value={formData.livingRoomsCount} onChange={v => setFormData({...formData, livingRoomsCount: v})} />
          </div>
        )}

        <div className="space-y-4">
          <Label className="font-black text-lg">{t('amenities_label')} *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {amenitiesList.map(amenity => (
              <div key={amenity} className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer",
                formData.amenities.includes(amenity) ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
              )}>
                <Checkbox 
                  id={amenity} 
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, amenity] : prev.amenities.filter(a => a !== amenity) }))}
                />
                <label htmlFor={amenity} className="text-sm font-bold text-slate-700 cursor-pointer flex-1">{amenity}</label>
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
            placeholder="Décrivez votre offre en détail..."
            className="min-h-[150px] rounded-2xl bg-slate-50"
          />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <Label className="font-black text-lg">{t('photos_label')} *</Label>
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
        <p className="text-[10px] text-slate-400 italic">Astuce : Vos photos sont compressées automatiquement pour garantir une publication rapide.</p>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest ml-1">Devise de l'annonce</Label>
            <Select value={formData.listingCurrency} onValueChange={v => setFormData({...formData, listingCurrency: v})}>
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
                className="h-14 pl-16 text-xl font-black rounded-2xl bg-slate-50"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-lg">
                {formData.listingCurrency === 'DZD' ? 'DA' : formData.listingCurrency === 'EUR' ? '€' : '$'}
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
          <div className="space-y-1 flex-1" onClick={() => setFormData(prev => ({ ...prev, isDiscountEnabled: !prev.isDiscountEnabled }))}>
            <Label htmlFor="discount" className="text-lg font-black text-slate-900 cursor-pointer flex items-center gap-2">
              Rendre mon offre attractive (-15% de rabais)
              <Badge className="bg-secondary text-primary border-none font-black text-[10px]">RECOMMANDÉ</Badge>
            </Label>
            <p className="text-sm text-slate-500 font-medium">
              Les offres avec réduction sont mises en avant sur StayFloow.com et reçoivent en moyenne 3 fois plus de réservations.
            </p>
          </div>
        </div>
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
          <div className="flex gap-4">
            {!user && currentStep === steps.length && (
              <Button variant="outline" className="h-14 px-8 rounded-xl font-black text-primary border-primary" onClick={() => toast({ title: "Connexion requise", description: "Veuillez vous connecter avant de soumettre." })}>
                Se connecter pour publier
              </Button>
            )}
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
