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
  Loader2, Wand2, X, Plus, Minus, Users, Bed, Bath, Sofa
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { OnboardingMap } from '@/components/onboarding-map';
import { useLanguage } from '@/context/language-context';

// Taux de conversion pour normaliser le prix en DZD avant stockage
const CONVERSION_RATES: Record<string, number> = {
  DZD: 1,
  USD: 1 / 134.5,
  EUR: 1 / 145.2,
  GBP: 1 / 171.1,
  CHF: 1 / 150.5,
  EGP: 1 / 2.85,
};

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
    livingRoomsCount: 0,
    gardensCount: 0,
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
      
      // Calcul du prix normalisé en DZD pour stockage
      const enteredPrice = parseFloat(formData.price) || 0;
      const rate = CONVERSION_RATES[formData.listingCurrency] || 1;
      const normalizedPriceDZD = Math.round(enteredPrice / rate);

      // 1. Mettre à jour le rôle de l'utilisateur
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'partner'
      });

      // 2. Créer le profil partenaire
      await setDoc(doc(db, 'partners', user.uid), {
        userId: user.uid,
        companyName: `${formData.firstName} ${formData.lastName}`,
        createdAt: new Date().toISOString(),
        verified: false
      });

      // 3. Enregistrer l'annonce
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
          ...(initialCategory === 'accommodation' ? {
            propertyType: formData.propertyType,
            roomsCount: formData.roomsCount,
            bathroomsCount: formData.bathroomsCount,
            livingRoomsCount: formData.livingRoomsCount,
            gardensCount: formData.gardensCount
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
        price: normalizedPriceDZD, // Toujours stocké en DZD
        currency: 'DZD', // Monnaie de base du système
        photos: photos,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'listings', listingId), finalData);
      setCurrentStep(5);
    } catch (error) {
      console.error("Submission error:", error);
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
      <p className="text-xl text-slate-600 max-w-lg mx-auto">Votre annonce est en cours de validation. Vous pouvez désormais accéder à votre espace partenaire.</p>
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
            <div className="space-y-2"><Label className="font-bold">Nom de votre service *</Label><Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} className="h-12 bg-slate-50" /></div>
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
                    <SelectItem value="DZD">DZD (DA)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-lg">Prix unitaire *</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="h-14 text-xl font-black rounded-2xl bg-slate-50" placeholder="Ex: 7500" />
                <p className="text-[10px] text-slate-400 italic">Le prix sera automatiquement converti selon la devise du client.</p>
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
  const amenities = category === 'accommodation' ? ["Wi-Fi", "Climatisation", "Parking", "Piscine", "Cuisine"] : category === 'car_rental' ? ["GPS", "Assurance", "Clim", "Siège Bébé"] : ["Guide", "Repas", "Transport"];
  
  return (
    <div className="space-y-8">
      {category === 'accommodation' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Counter icon={<Bed/>} label="Chambres" value={formData.roomsCount} onChange={v => setFormData({...formData, roomsCount: v})} />
          <Counter icon={<Bath/>} label="Salles de bain" value={formData.bathroomsCount} onChange={v => setFormData({...formData, bathroomsCount: v})} />
          <Counter icon={<Sofa/>} label="Salons" value={formData.livingRoomsCount} onChange={v => setFormData({...formData, livingRoomsCount: v})} />
          <Counter icon={<Building/>} label="Jardins" value={formData.gardensCount} onChange={v => setFormData({...formData, gardensCount: v})} />
        </div>
      )}

      <div className="space-y-4">
        <Label className="font-black">Équipements populaires</Label>
        <div className="flex flex-wrap gap-3">
          {amenities.map(a => (
            <Badge key={a} variant={formData.amenities.includes(a) ? "default" : "outline"} onClick={() => setFormData({...formData, amenities: formData.amenities.includes(a) ? formData.amenities.filter((x:any) => x!==a) : [...formData.amenities, a]})} className="cursor-pointer px-4 py-2 rounded-xl border-slate-200">
              {a}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label className="font-black">Description commerciale</Label>
          <Button variant="ghost" size="sm" onClick={onAI} disabled={isGen} className="text-primary font-bold"><Wand2 className="h-4 w-4 mr-2"/> {isGen ? 'Génération...' : 'Améliorer par IA'}</Button>
        </div>
        <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[150px] bg-slate-50" />
      </div>
    </div>
  );
}

function Counter({ icon, label, value, onChange }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center gap-2">
      <div className="text-primary">{icon}</div>
      <span className="text-[10px] font-black uppercase text-slate-400">{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, value-1))} className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center"><Minus className="h-3 w-3"/></button>
        <span className="font-black">{value}</span>
        <button onClick={() => onChange(value+1)} className="h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center"><Plus className="h-3 w-3"/></button>
      </div>
    </div>
  );
}