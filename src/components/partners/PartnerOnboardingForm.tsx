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
  Building, Car, Compass, MapPin, Upload, CheckCircle2, 
  ChevronRight, ChevronLeft, Loader2, Wand2, X, Plus, Minus, Info, TrendingUp, Star, Users, Home, Clock, Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { getPriceRecommendation, type PriceRecommendationOutput } from '@/ai/flows/price-recommendation-flow';
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
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<PriceRecommendationOutput | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dialCode: '+213',
    address: '',
    listingName: '',
    description: '',
    price: '', // Adulte par défaut
    type: [] as string[],
    duration: '1 jour',
    languages: [] as string[],
    amenities: [] as string[], // Options sélectionnées
    capacity: { min: 1, max: 10 },
    ticketTypes: [
      { id: 'adult', name: 'Adulte', price: 0 },
      { id: 'child', name: 'Enfant (6-15 ans)', price: 0 },
      { id: 'infant', name: 'Jeune enfant (0-5 ans)', price: 0 }
    ],
    inclusions: [] as string[],
    restrictions: [] as string[],
    itinerary: '',
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
        keyFeatures: formData.amenities.length > 0 ? formData.amenities : ["Authentique", "Inoubliable"],
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
      await setDoc(doc(db, 'listings', listingId), {
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
          type: formData.type[0],
          duration: formData.duration,
          languages: formData.languages,
          amenities: formData.amenities,
          capacity: formData.capacity,
          ticketTypes: formData.ticketTypes,
          inclusions: formData.inclusions,
          restrictions: formData.restrictions,
          itinerary: formData.itinerary,
        },
        price: parseFloat(formData.price) || 0,
        photos: photos,
        rating: 8.5 + Math.random() * 1.5, // Mock initial rating
        reviewsCount: 0,
        createdAt: serverTimestamp()
      });
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
        <div className="space-y-2"><Label className="font-bold">{t('first_name')} *</Label><Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="h-12" /></div>
        <div className="space-y-2"><Label className="font-bold">{t('last_name')} *</Label><Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="h-12" /></div>
        <div className="space-y-2"><Label className="font-bold">{t('pro_email')} *</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-12" /></div>
        <div className="space-y-2">
          <Label className="font-bold">{t('phone_whatsapp')} *</Label>
          <div className="flex gap-2">
            <Input value={formData.dialCode} onChange={e => setFormData({...formData, dialCode: e.target.value})} className="w-24 h-12 text-center font-bold bg-slate-50" />
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="h-12 flex-1" />
          </div>
        </div>
      </div>
      <div className="space-y-2"><Label className="font-bold">Nom de l'expérience / Circuit *</Label><Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} placeholder="Ex: Safari 4x4 au Tassili" className="h-12" /></div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2"><Label className="font-bold">Lieu de départ / Localisation principale *</Label><Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Ville, Région" className="h-12" /></div>
      <OnboardingMap location={formData.address} />
    </div>
  );

  const renderStep3 = () => {
    const circuitOptions = [
      'Guide inclus (local arabe/français)', 'Repas inclus (halal)', 'Transport 4x4 (désert)',
      'Durée 1 jour', 'Durée multi-jours (2-7 jours)', 'Annulation gratuite',
      'Langue arabe', 'Langue français', 'Thème désert/Sahara',
      'Thème culturel/historique (pyramides, ruines)', 'Thème Nil/croisière',
      'Groupe petit (max 10 pers)', 'Assurance incluse',
      'Départ depuis aéroport (Alger/Caire)', 'Rating guide 8+'
    ];

    const langOptions = [
      { name: 'Français', flag: '🇫🇷' },
      { name: 'Arabe', flag: '🇩🇿' },
      { name: 'Anglais', flag: '🇬🇧' },
      { name: 'Espagnol', flag: '🇪🇸' },
    ];

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
        {/* Langues */}
        <div className="space-y-4">
          <Label className="font-black text-lg">Langues du tour *</Label>
          <div className="flex flex-wrap gap-3">
            {langOptions.map(l => (
              <button 
                key={l.name}
                onClick={() => setFormData(prev => ({ ...prev, languages: prev.languages.includes(l.name) ? prev.languages.filter(x => x !== l.name) : [...prev.languages, l.name] }))}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all font-bold",
                  formData.languages.includes(l.name) ? "border-primary bg-primary/10 text-primary" : "border-slate-100 hover:border-slate-200"
                )}
              >
                <span>{l.flag}</span> {l.name}
              </button>
            ))}
          </div>
        </div>

        {/* Options / Filtres populaires */}
        <div className="space-y-4">
          <Label className="font-black text-lg">Options & Caractéristiques (pour les filtres clients) *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {circuitOptions.map(opt => (
              <div key={opt} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Checkbox 
                  id={opt} 
                  checked={formData.amenities.includes(opt)}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, opt] : prev.amenities.filter(x => x !== opt) }))}
                />
                <label htmlFor={opt} className="text-xs font-bold text-slate-600 cursor-pointer">{opt}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Capacité du groupe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border-2 border-slate-100">
          <div className="space-y-4">
            <Label className="font-bold">Capacité minimum du groupe</Label>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setFormData({...formData, capacity: {...formData.capacity, min: Math.max(1, formData.capacity.min - 1)}})}><Minus className="h-4 w-4" /></Button>
              <span className="font-black text-xl">{formData.capacity.min}</span>
              <Button variant="outline" size="icon" onClick={() => setFormData({...formData, capacity: {...formData.capacity, min: formData.capacity.min + 1}})}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="space-y-4">
            <Label className="font-bold">Capacité maximum du groupe</Label>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setFormData({...formData, capacity: {...formData.capacity, max: Math.max(1, formData.capacity.max - 1)}})}><Minus className="h-4 w-4" /></Button>
              <span className="font-black text-xl">{formData.capacity.max}</span>
              <Button variant="outline" size="icon" onClick={() => setFormData({...formData, capacity: {...formData.capacity, max: formData.capacity.max + 1}})}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>

        {/* Description & Itinéraire */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <Label className="font-black text-lg">Présentation & Itinéraire détaillé</Label>
            <Button variant="outline" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-primary border-primary rounded-full">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
              Optimiser avec l'IA
            </Button>
          </div>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="Décrivez le déroulement du circuit, les lieux visités..."
            className="min-h-[200px] rounded-2xl"
          />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <Label className="font-black text-lg">Photos de l'excursion (Min. 5)</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden shadow-sm">
              <Image src={p} alt="Tour" fill className="object-cover" />
              <button onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1"><X className="h-3 w-3"/></button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-6 w-6 text-primary mb-2" />
            <span className="text-[10px] font-black text-primary uppercase">Ajouter</span>
            <input type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      <Card className="bg-slate-900 text-white overflow-hidden border-none rounded-3xl">
        <CardContent className="p-8 space-y-8">
          <h3 className="text-xl font-black flex items-center gap-3"><TrendingUp className="text-secondary" /> Tarification du circuit</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.ticketTypes.map((t, idx) => (
              <div key={t.id} className="space-y-2">
                <Label className="text-white/70 font-bold">{t.name}</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={t.price} 
                    onChange={e => {
                      const newTypes = [...formData.ticketTypes];
                      newTypes[idx].price = parseFloat(e.target.value) || 0;
                      setFormData({...formData, ticketTypes: newTypes, price: newTypes[0].price.toString()});
                    }}
                    className="bg-white/10 border-white/20 h-14 text-xl font-black pl-4"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs opacity-50 font-black">DA</span>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/10 flex justify-between items-center">
            <p className="text-sm opacity-70">Frais StayFloow.com inclus (15%)</p>
            <div className="text-right">
              <p className="text-xs font-bold uppercase text-secondary">Votre gain estimé (Adulte)</p>
              <p className="text-3xl font-black">{(parseFloat(formData.price || '0') * 0.85).toFixed(0)} DA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (currentStep === 5) return (
    <div className="text-center py-20 bg-white rounded-3xl shadow-2xl">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"><CheckCircle2 className="h-16 w-16 text-primary" /></div>
      <h3 className="text-4xl font-black text-slate-900 mb-4">Bravo {formData.firstName} !</h3>
      <p className="text-xl text-slate-600 max-w-lg mx-auto">Votre circuit est en cours de validation. Vous recevrez une notification dès sa mise en ligne.</p>
      <Button size="lg" className="mt-12 bg-primary px-10 h-14 font-black text-lg" asChild><a href="/">Retour au site</a></Button>
    </div>
  );

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
      <div className="bg-slate-100 h-2 w-full"><div className="bg-primary h-full transition-all duration-700" style={{ width: `${(currentStep / steps.length) * 100}%` }} /></div>
      <CardContent className="p-10">
        <div className="flex justify-between mb-12">
          {steps.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-black border-2", currentStep >= s.id ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-300")}>{currentStep > s.id ? <CheckCircle2 className="h-5 w-5"/> : s.id}</div>
              <span className={cn("text-[10px] font-black uppercase tracking-tighter", currentStep === s.id ? "text-primary" : "text-slate-300")}>{s.title}</span>
            </div>
          ))}
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="mt-12 pt-8 border-t flex justify-between">
          <Button variant="ghost" onClick={handlePrev} disabled={currentStep === 1} className="font-bold">← Précédent</Button>
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">
              {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : "Soumettre le circuit"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20">Continuer →</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
