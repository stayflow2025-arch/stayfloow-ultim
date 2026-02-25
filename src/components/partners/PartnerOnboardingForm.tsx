
'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Building, Car, Compass, MapPin, Upload, CheckCircle2, 
  ChevronRight, ChevronLeft, Loader2, Wand2, X, Plus, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface Props {
  initialCategory: 'accommodation' | 'car_rental' | 'circuit';
}

export default function PartnerOnboardingForm({ initialCategory }: Props) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    lat: 36.75,
    lng: 3.05,
    listingName: '',
    description: '',
    price: '',
    type: [] as string[],
    amenities: [] as string[],
    capacity: { min: 1, max: 10 },
    inventory: 1,
    rules: [] as string[],
  });

  const steps = [
    { id: 1, title: 'Informations' },
    { id: 2, title: 'Localisation' },
    { id: 3, title: 'Détails Pro' },
    { id: 4, title: 'Photos & Prix' },
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

  const handleSubmit = async () => {
    if (photos.length < 5) {
      toast({ variant: 'destructive', title: 'Photos manquantes', description: 'Veuillez ajouter au moins 5 photos.' });
      return;
    }
    setIsSubmitting(true);
    try {
      const db = getFirestore();
      const listingId = `list_${Date.now()}`;
      await setDoc(doc(db, 'listings', listingId), {
        category: initialCategory,
        status: 'pending',
        partnerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        location: {
          address: formData.address,
          lat: formData.lat,
          lng: formData.lng
        },
        details: {
          name: formData.listingName,
          description: formData.description,
          type: formData.type,
          amenities: formData.amenities,
          capacity: formData.capacity,
          inventory: formData.inventory,
          rules: formData.rules
        },
        price: parseFloat(formData.price),
        photos: photos,
        createdAt: serverTimestamp()
      });
      setCurrentStep(5); // Success step
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

  // Content renderers
  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold">Prénom *</Label>
          <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Jean" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Nom *</Label>
          <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Dupont" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Email professionnel *</Label>
          <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@pro.com" className="h-12" />
        </div>
        <div className="space-y-2">
          <Label className="font-bold">Numéro de téléphone (WhatsApp) *</Label>
          <div className="flex gap-2">
            <div className="bg-slate-100 flex items-center px-3 rounded-md text-sm font-bold border">🇩🇿 +213</div>
            <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0550 00 00 00" className="h-12 flex-1" />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label className="font-bold">Nom commercial de l'annonce *</Label>
        <Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} placeholder="Ex: Riad Les Jardins d'Alger" className="h-12" />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-2">
        <Label className="font-bold">Adresse complète *</Label>
        <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Numéro, Rue, Ville, Code Postal" className="h-12" />
      </div>
      <div className="space-y-2">
        <Label className="font-bold">Localisation GPS (Cliquez sur la carte)</Label>
        <div 
          className="h-64 bg-slate-200 rounded-xl relative overflow-hidden cursor-crosshair group flex items-center justify-center border-2 border-slate-300 border-dashed"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            setFormData({...formData, lat: 36.75 + (0.5 - y) * 0.1, lng: 3.05 + (x - 0.5) * 0.1});
          }}
        >
          <MapPin className="h-12 w-12 text-primary absolute z-10 animate-bounce" style={{ top: '40%', left: '50%', marginLeft: '-24px' }} />
          <Image src="https://picsum.photos/seed/map-preview/800/400" alt="Map Preview" fill className="object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow text-xs font-bold">
            Lat: {formData.lat.toFixed(4)} | Lng: {formData.lng.toFixed(4)}
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-bold">Cliquez pour définir la position</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const options = {
      accommodation: {
        types: ['Hôtel ★★★', 'Hôtel ★★★★', 'Hôtel ★★★★★', 'Riad', 'Villa', 'Appartement', 'Studio', 'Glamping'],
        amenities: ['WiFi gratuit', 'Piscine', 'Climatisation', 'Parking gratuit', 'Petit-déjeuner', 'Vue mer', 'Cuisine équipée']
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

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="space-y-4">
          <Label className="font-black text-lg">Type d'offre *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {options.types.map(t => (
              <div 
                key={t}
                onClick={() => setFormData(prev => ({ ...prev, type: prev.type.includes(t) ? prev.type.filter(x => x !== t) : [...prev.type, t] }))}
                className={cn(
                  "p-3 rounded-lg border-2 text-center cursor-pointer text-sm font-bold transition-all",
                  formData.type.includes(t) ? "border-primary bg-primary/5 text-primary" : "border-slate-100 bg-white"
                )}
              >
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="font-black text-lg">Équipements & Inclusions *</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
            {options.amenities.map(a => (
              <div key={a} className="flex items-center space-x-3">
                <Checkbox 
                  id={a} 
                  checked={formData.amenities.includes(a)}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, amenities: checked ? [...prev.amenities, a] : prev.amenities.filter(x => x !== a) }))}
                />
                <label htmlFor={a} className="text-sm font-bold text-slate-700 cursor-pointer">{a}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="font-black text-lg">Description attractive (Min 150 car.)</Label>
            <Button variant="outline" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-primary border-primary gap-2">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              Améliorer avec l'IA
            </Button>
          </div>
          <Textarea 
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
            placeholder="Détaillez votre offre, son charme, ses spécificités..." 
            className="min-h-[150px]"
          />
          <div className="text-right text-xs text-slate-400">{formData.description.length} / 150 caractères min</div>
        </div>
      </div>
    );
  };

  const renderStep4 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        <Label className="font-black text-lg">Photos de l'annonce (5 minimum)</Label>
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
              {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-[10px] text-white py-1 font-black text-center">PRINCIPALE</span>}
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
        <p className="text-xs text-slate-500 italic">Glissez-déposez pour réorganiser. Max 30 photos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900 p-8 rounded-2xl text-white shadow-2xl">
        <div className="space-y-4">
          <Label className="font-black text-xl flex items-center gap-2">
            <Info className="h-5 w-5 text-secondary" />
            Prix de base (DZD)
          </Label>
          <p className="text-xs opacity-70">Saisissez le prix par nuit ou par jour. Ce prix sera votre référence.</p>
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
        </div>
        <div className="flex flex-col justify-center gap-4 border-l border-white/10 pl-8">
           <div className="flex justify-between items-center text-sm">
              <span className="opacity-70">Frais StayFloow.com (15%)</span>
              <span className="font-bold">-{formData.price ? (parseFloat(formData.price) * 0.15).toFixed(0) : 0} DZD</span>
           </div>
           <div className="flex justify-between items-center text-xl font-black text-secondary">
              <span>Votre gain net</span>
              <span>{formData.price ? (parseFloat(formData.price) * 0.85).toFixed(0) : 0} DZD</span>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-20 animate-in zoom-in-95 fade-in duration-500">
      <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle2 className="h-16 w-16 text-primary" />
      </div>
      <h3 className="text-4xl font-black text-slate-900 mb-4">Merci, {formData.firstName} !</h3>
      <p className="text-xl text-slate-600 max-w-lg mx-auto leading-relaxed">
        Votre annonce est en cours de validation par nos experts. Vous recevrez une notification par email sous 24 à 48 heures.
      </p>
      <div className="mt-12">
        <Button size="lg" className="bg-primary hover:bg-primary/90 px-10" asChild>
          <a href="/">Retour à l'accueil</a>
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
            <ChevronLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          {currentStep === steps.length ? (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Valider et envoyer pour examen'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90 px-12 h-14 rounded-xl font-black text-lg shadow-xl shadow-primary/20"
            >
              Continuer <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
