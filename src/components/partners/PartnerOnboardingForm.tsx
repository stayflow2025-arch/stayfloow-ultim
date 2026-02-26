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
  ChevronRight, ChevronLeft, Loader2, Wand2, X, Plus, Minus, Info, TrendingUp, Star, Users, Home
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

interface BedConfig {
  id: string;
  name: string;
  desc: string;
  count: number;
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
  const [showMoreBeds, setShowMoreBeds] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dialCode: '+213',
    address: '',
    lat: 36.75,
    lng: 3.05,
    listingName: '',
    description: '',
    price: '',
    type: [] as string[],
    roomType: 'double_room',
    stars: 'N/A',
    isManagementGroup: 'no',
    freeCancellation48h: false,
    amenities: [] as string[],
    capacity: { adults: 2, children: 0 },
    composition: { bedrooms: 1, bathrooms: 1, kitchens: 1, toilets: 1 },
    inventory: 1,
    rules: [] as string[],
    beds: [
      { id: 'single', name: 'single_bed', desc: 'single_bed_desc', count: 0 },
      { id: 'double', name: 'double_bed', desc: 'double_bed_desc', count: 0 },
      { id: 'king', name: 'king_bed', desc: 'king_bed_desc', count: 0 },
      { id: 'grand_king', name: 'grand_king_bed', desc: 'grand_king_bed_desc', count: 0 },
      { id: 'bunk', name: 'bunk_bed', desc: 'bunk_bed_desc', count: 0 },
      { id: 'sofa', name: 'sofa_bed', desc: 'sofa_bed_desc', count: 0 },
      { id: 'futon', name: 'futon', desc: 'futon_desc', count: 0 },
    ] as BedConfig[],
  });

  const steps = [
    { id: 1, title: t('step_info') },
    { id: 2, title: t('step_loc') },
    { id: 3, title: t('step_details') },
    { id: 4, title: t('step_photos_price') },
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateBedCount = (id: string, delta: number) => {
    setFormData(prev => ({
      ...prev,
      beds: prev.beds.map(bed => 
        bed.id === id ? { ...bed, count: Math.max(0, bed.count + delta) } : bed
      )
    }));
  };

  const updateCapacity = (key: 'adults' | 'children', delta: number) => {
    setFormData(prev => ({
      ...prev,
      capacity: {
        ...prev.capacity,
        [key]: Math.max(0, prev.capacity[key] + delta)
      }
    }));
  };

  const updateComposition = (key: keyof typeof formData.composition, delta: number) => {
    setFormData(prev => ({
      ...prev,
      composition: {
        ...prev.composition,
        [key]: Math.max(0, prev.composition[key] + delta)
      }
    }));
  };

  const updateInventory = (delta: number) => {
    setFormData(prev => ({
      ...prev,
      inventory: Math.max(1, prev.inventory + delta)
    }));
  };

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
        keyFeatures: formData.amenities.length > 0 ? formData.amenities : ["Haut de gamme", "Authentique"],
        existingDescription: formData.description
      });
      setFormData(prev => ({ ...prev, description: result.generatedDescription }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePriceAnalyze = async () => {
    if (!formData.price || !formData.listingName || !formData.address) {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Nom, adresse et prix requis pour l\'analyse.' });
      return;
    }
    setIsAnalyzing(true);
    try {
      const result = await getPriceRecommendation({
        name: formData.listingName,
        location: formData.address,
        price: parseFloat(formData.price),
        demandScore: Math.floor(Math.random() * 40) + 60,
      });
      setRecommendation(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (photos.length < 5) {
      toast({ variant: 'destructive', title: 'Photos manquantes', description: 'Veuillez ajouter au moins 5 photos.' });
      return;
    }
    if (formData.type.length === 0) {
      toast({ variant: 'destructive', title: 'Type manquant', description: 'Veuillez sélectionner un type d\'hébergement.' });
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
        location: {
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng
        },
        details: {
          name: formData.listingName,
          description: formData.description,
          type: formData.type[0], 
          roomType: formData.roomType,
          stars: formData.stars,
          isManagementGroup: formData.isManagementGroup === 'yes',
          freeCancellation48h: formData.freeCancellation48h,
          amenities: formData.amenities,
          capacity: formData.capacity,
          composition: formData.composition,
          inventory: formData.inventory,
          rules: formData.rules,
          beds: formData.beds.filter(b => b.count > 0)
        },
        price: parseFloat(formData.price),
        photos: photos,
        createdAt: serverTimestamp()
      });
      setCurrentStep(5);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de soumettre l\'annonce.' });
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
        <div className="space-y-2">
          <Label className="font-bold">{t('first_name')} *</Label>
          <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Jean" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">{t('last_name')} *</Label>
          <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Dupont" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">{t('pro_email')} *</Label>
          <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@pro.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">{t('phone_whatsapp')} *</Label>
          <div className="flex gap-2">
            <Input 
              value={formData.dialCode} 
              onChange={e => setFormData({...formData, dialCode: e.target.value})} 
              className="w-24 h-12 text-center font-bold bg-slate-50 border-slate-200" 
              placeholder="+213"
            />
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0550 00 00 00" className="h-12 flex-1" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-bold">{t('commercial_name')} *</Label>
        <Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} placeholder="Ex: Riad Les Jardins d'Alger" className="h-12" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <Label className="font-bold">{t('full_address')} *</Label>
        <Input 
          value={formData.address} 
          onChange={e => setFormData({...formData, address: e.target.value})} 
          placeholder="Numéro, Rue, Ville, Code Postal" 
          className="h-12" 
        />
      </div>
      <div className="space-y-2">
        <Label className="font-bold">{t('map_preview')}</Label>
        <OnboardingMap location={formData.address} />
        <p className="text-[10px] text-slate-400 font-medium italic mt-2">
          {t('map_hint')}
        </p>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const options = {
      accommodation: {
        types: ['Hôtel', 'Villa', 'Appartement', 'Studio'],
        amenities: [
          'WiFi gratuit', 'Climatisation', 'Parking gratuit', 'Petit-déjeuner inclus', 
          'Piscine', 'Restaurant sur place', 'Réception 24h/24', 'Animaux domestiques acceptés', 
          'Terrasse / balcon / vue', 'Cuisine / coin cuisine', 'Prises électriques près du lit', 
          'Salle de bain privée', 'Lit bébé / lit supplémentaire', 'Ascenseur', 'Accessibilité PMR'
        ]
      },
      car_rental: {
        types: ['Économique', 'SUV / 4x4', 'Van / Minibus', 'Luxe', 'Moto'],
        amenities: ['Boîte Automatique', 'Essence', 'Diesel', 'Kilométrage illimité', 'GPS intégré', 'Assurance incluse']
      },
      circuit: {
        types: ['Demi-journée', 'Multi-jours', 'Circuit Désert', 'Randonnée', 'Visite Culturelle'],
        amenities: ['Transport inclus', 'Guide Pro', 'Repas inclus', 'Entrées sites', 'Hébergement inclus', 'Assurance voyage']
      }
    }[initialCategory];

    const visibleBeds = showMoreBeds ? formData.beds : formData.beds.slice(0, 4);

    return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
        {/* Type d'hébergement */}
        <div className="space-y-6">
          <Label className="font-black text-xl text-slate-900">{t('listing_type_label')} *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {options.types.map(opt => (
              <div 
                key={opt}
                onClick={() => setFormData(prev => ({ ...prev, type: [opt] }))}
                className={cn(
                  "p-6 rounded-2xl border-2 text-center cursor-pointer transition-all shadow-sm flex flex-col items-center gap-3",
                  formData.type.includes(opt) 
                    ? "border-primary bg-primary/5 text-primary scale-105" 
                    : "border-slate-100 bg-white hover:border-slate-200"
                )}
              >
                {opt === 'Hôtel' && <Building className="h-8 w-8" />}
                {opt === 'Villa' && <Home className="h-8 w-8" />}
                {opt === 'Appartement' && <Building className="h-8 w-8" />}
                {opt === 'Studio' && <Home className="h-8 w-8" />}
                <span className="font-black text-sm">{t(opt)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Composition du logement */}
        {initialCategory === 'accommodation' && (
          <div className="space-y-6 bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Home className="h-6 w-6 text-primary" /> {t('property_composition_title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { id: 'bedrooms', label: 'bedrooms_count' },
                { id: 'bathrooms', label: 'bathrooms_count' },
                { id: 'kitchens', label: 'kitchens_count' },
                { id: 'toilets', label: 'toilets_count' }
              ].map((comp) => (
                <div key={comp.id} className="space-y-4">
                  <Label className="font-bold text-slate-600">{t(comp.label)}</Label>
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <button onClick={() => updateComposition(comp.id as any, -1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Minus className="h-4 w-4"/></button>
                    <span className="flex-1 text-center font-black text-lg">{formData.composition[comp.id as keyof typeof formData.composition]}</span>
                    <button onClick={() => updateComposition(comp.id as any, 1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Plus className="h-4 w-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ETOILES & GROUPE */}
        {initialCategory === 'accommodation' && formData.type.includes('Hôtel') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
            <div className="space-y-6">
              <Label className="font-black text-lg text-slate-900">{t('stars_question')}</Label>
              <RadioGroup value={formData.stars} onValueChange={(val) => setFormData({...formData, stars: val})} className="space-y-3">
                {['N/A', '1', '2', '3', '4', '5'].map((s) => (
                  <div key={s} className="flex items-center space-x-3 group cursor-pointer">
                    <RadioGroupItem value={s} id={`star-${s}`} className="h-5 w-5" />
                    <Label htmlFor={`star-${s}`} className="font-bold text-slate-600 cursor-pointer flex items-center gap-2">
                      {s === 'N/A' ? 'N/A' : `${s} ${t(s === '1' ? 'star' : 'stars')}`}
                      {s !== 'N/A' && (
                        <div className="flex">
                          {[...Array(parseInt(s))].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-6">
              <Label className="font-black text-lg text-slate-900">{t('group_question')}</Label>
              <RadioGroup value={formData.isManagementGroup} onValueChange={(val) => setFormData({...formData, isManagementGroup: val})} className="space-y-3">
                <div className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="yes" id="group-yes" className="h-5 w-5" />
                  <Label htmlFor="group-yes" className="font-bold text-slate-600 cursor-pointer">{t('yes')}</Label>
                </div>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="no" id="group-no" className="h-5 w-5" />
                  <Label htmlFor="group-no" className="font-bold text-slate-600 cursor-pointer">{t('no')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        {/* Capacité & Inventaire */}
        {initialCategory === 'accommodation' && (
          <div className="space-y-6 bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" /> {t('capacity_title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <Label className="font-bold text-slate-600">{t('adults_max')}</Label>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => updateCapacity('adults', -1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Minus className="h-4 w-4"/></button>
                  <span className="flex-1 text-center font-black text-lg">{formData.capacity.adults}</span>
                  <button onClick={() => updateCapacity('adults', 1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Plus className="h-4 w-4"/></button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-bold text-slate-600">{t('children_max')}</Label>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => updateCapacity('children', -1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Minus className="h-4 w-4"/></button>
                  <span className="flex-1 text-center font-black text-lg">{formData.capacity.children}</span>
                  <button onClick={() => updateCapacity('children', 1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Plus className="h-4 w-4"/></button>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="font-bold text-slate-600">{t('inventory_label')}</Label>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <button onClick={() => updateInventory(-1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Minus className="h-4 w-4"/></button>
                  <span className="flex-1 text-center font-black text-lg">{formData.inventory}</span>
                  <button onClick={() => updateInventory(1)} className="h-10 w-10 bg-white shadow-sm rounded-lg flex items-center justify-center text-primary"><Plus className="h-4 w-4"/></button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration des lits */}
        {initialCategory === 'accommodation' && (
          <div className="space-y-6 bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm">
            <h3 className="text-3xl font-black text-slate-900 mb-8">{t('room_setup_title')}</h3>
            <div className="space-y-8">
              <p className="text-slate-600 font-medium">{t('bed_types_question')}</p>
              
              <div className="space-y-6">
                {visibleBeds.map((bed) => (
                  <div key={bed.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-primary/5 transition-colors">
                        <Star className="h-8 w-8 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900">{t(bed.name)}</p>
                        <p className="text-xs text-slate-400 font-medium">{t(bed.desc)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                      <button 
                        onClick={() => updateBedCount(bed.id, -1)}
                        disabled={bed.count === 0}
                        className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-slate-50 text-primary disabled:opacity-30 transition-colors"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      <span className="w-8 text-center font-black text-lg text-slate-900">{bed.count}</span>
                      <button 
                        onClick={() => updateBedCount(bed.id, 1)}
                        className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-slate-50 text-primary transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowMoreBeds(!showMoreBeds)}
                className="text-primary font-bold flex items-center gap-2 hover:underline transition-all pt-4"
              >
                {showMoreBeds ? <ChevronLeft className="h-4 w-4 rotate-90" /> : <ChevronRight className="h-4 w-4 rotate-90" />}
                {showMoreBeds ? t('show_less_beds') : t('show_more_beds')}
              </button>
            </div>
          </div>
        )}

        {/* Équipements & Annulation */}
        <div className="space-y-8">
          <Label className="font-black text-xl text-slate-900">{t('amenities_label')} *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-3xl border-2 border-slate-100">
            {options.amenities.map(a => (
              <div key={a} className="flex items-center space-x-4 group">
                <Checkbox 
                  id={a} 
                  checked={formData.amenities.includes(a)}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, a] : prev.amenities.filter(x => x !== a) }))}
                  className="h-6 w-6 rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-sm"
                />
                <label htmlFor={a} className="text-sm font-bold text-slate-600 group-hover:text-primary cursor-pointer transition-colors">{t(a)}</label>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 p-8 rounded-3xl border-2 border-primary/10 space-y-4">
            <Label className="font-black text-lg text-primary flex items-center gap-2">
              <Info className="h-5 w-5" /> {t('cancellation_policy')}
            </Label>
            <div className="flex items-center space-x-4">
              <Checkbox 
                id="cancellation" 
                checked={formData.freeCancellation48h}
                onCheckedChange={(checked) => setFormData({...formData, freeCancellation48h: checked as boolean})}
                className="h-6 w-6 rounded-md border-primary/30"
              />
              <label htmlFor="cancellation" className="text-sm font-black text-slate-700 cursor-pointer">{t('free_cancellation_48h')}</label>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <Label className="font-black text-xl text-slate-900">{t('description_label')}</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAIEnhance} 
              disabled={isGenerating} 
              className="text-primary border-primary gap-2 hover:bg-primary hover:text-white rounded-full font-black px-4"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {t('ai_improve_btn')}
            </Button>
          </div>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder={t('description_placeholder')}
            className="min-h-[180px] rounded-2xl border-slate-200 focus:border-primary p-6 text-lg leading-relaxed shadow-inner"
          />
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <Label className="font-black text-lg">{t('photos_label')}</Label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {photos.map((p, i) => (
            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group shadow-md border-2 border-white">
              <Image src={p} alt={`Photo ${i}`} fill className="object-cover" />
              <button 
                onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {photos.length < 30 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/10 transition-colors">
              <Upload className="h-6 w-6 text-primary mb-2" />
              <span className="text-[10px] font-bold text-primary">AJOUTER</span>
              <input type="file" multiple className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </label>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 p-8 rounded-2xl text-white shadow-2xl relative overflow-hidden">
        <div className="space-y-4 relative z-10">
          <Label className="font-black text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-secondary" />
            {t('base_price_label')} (DZD)
          </Label>
          <div className="relative">
             <Input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
                placeholder="0" 
                className="h-16 text-3xl font-black bg-white/10 border-white/20 text-white pl-8 focus:bg-white/20 transition-all"
             />
             <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xl opacity-50">DZD</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePriceAnalyze} 
            disabled={isAnalyzing}
            className="text-secondary border-secondary hover:bg-secondary hover:text-primary mt-4 w-full md:w-auto"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {t('ai_analyze_price_btn')}
          </Button>
        </div>
        
        <div className="flex flex-col justify-center gap-4 border-l border-white/10 pl-8 relative z-10">
           {recommendation ? (
             <div className="space-y-3 animate-in fade-in zoom-in-95 duration-500">
               <div className="flex justify-between items-center text-secondary font-black text-lg">
                 <span>{t('recommended_price')} :</span>
                 <span>{recommendation.recommendedPrice} DZD</span>
               </div>
               <div className="bg-white/5 p-3 rounded-lg text-[10px] space-y-2">
                 <p className="font-bold text-secondary flex items-center gap-1">
                   <CheckCircle2 className="h-3 w-3" /> {t('confidence_label')} : {recommendation.confidence}%
                 </p>
                 <ul className="list-disc pl-4 opacity-70">
                   {recommendation.reasoning.map((r, idx) => <li key={idx}>{r}</li>)}
                 </ul>
               </div>
             </div>
           ) : (
             <>
               <div className="flex justify-between items-center text-sm">
                  <span className="opacity-70">Frais StayFloow.com (15%)</span>
                  <span className="font-bold">-{formData.price ? (parseFloat(formData.price) * 0.15).toFixed(0) : 0} DZD</span>
               </div>
               <div className="flex justify-between items-center text-xl font-black text-secondary">
                  <span>Votre gain net</span>
                  <span>{formData.price ? (parseFloat(formData.price) * 0.85).toFixed(0) : 0} DZD</span>
               </div>
             </>
           )}
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-20 animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="h-16 w-16 text-primary" />
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-4">{t('success_msg_title')} {formData.firstName} !</h3>
      <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
        {t('success_msg_desc')}
      </p>
      <div className="mt-12">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-10 text-white font-black" asChild>
          <a href="/">{t('back_home_btn')}</a>
        </Button>
      </div>
    </div>
  );

  if (currentStep === 5) return renderSuccess();

  return (
    <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
      <div className="bg-primary h-2 w-full">
        <div className="bg-secondary h-full transition-all duration-700" style={{ width: `${(currentStep / steps.length) * 100}%` }} />
      </div>
      <CardContent className="p-10">
        <div className="mb-10 flex justify-between">
          {steps.map(s => (
            <div key={s.id} className="flex flex-col items-center gap-2">
               <div className={cn(
                 "w-12 h-12 rounded-full flex items-center justify-center font-black transition-all border-4",
                 currentStep >= s.id ? "bg-primary border-primary text-white" : "bg-white border-slate-100 text-slate-300"
               )}>
                 {currentStep > s.id ? <CheckCircle2 className="h-6 w-6" /> : s.id}
               </div>
               <span className={cn("text-[10px] font-black uppercase tracking-widest", currentStep === s.id ? "text-primary" : "text-slate-300")}>{s.title}</span>
            </div>
          ))}
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        <div className="mt-12 flex justify-between border-t border-slate-100 pt-8">
          <Button 
            variant="ghost" 
            onClick={handlePrev} 
            disabled={currentStep === 1}
            className="font-bold text-slate-500 hover:text-primary transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> {t('back')}
          </Button>
          {currentStep === steps.length ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-white px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : t('submit_review_btn')}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 text-white px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20"
            >
              {t('continue')} <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
