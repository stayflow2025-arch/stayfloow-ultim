
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Building, Car, Compass, Upload, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';

const steps = [
  { id: 1, title: 'Infos générales' },
  { id: 2, title: 'Détails & GPS' },
  { id: 3, title: 'Tarifs & Options' },
  { id: 4, title: 'Photos' },
];

export default function PartnerOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<'accommodation' | 'car_rental' | 'circuit'>('accommodation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    listingName: '',
    description: '',
    location: '',
    gpsCoordinates: '',
    email: '',
    phone: '',
    price: '',
    amenities: [] as string[],
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleAIEnhance = async () => {
    if (!formData.listingName || !formData.location) return;
    setIsGenerating(true);
    try {
      const result = await generatePartnerDescription({
        listingType: category,
        listingName: formData.listingName,
        location: formData.location,
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

  const commonAmenities = {
    accommodation: ['WiFi', 'Climatisation', 'Petit-déjeuner', 'Piscine', 'Parking', 'Spa'],
    car_rental: ['Kilométrage illimité', 'Assurance incluse', 'GPS intégré', 'Siège bébé', 'Plein fait'],
    circuit: ['Guide certifié', 'Transport inclus', 'Repas inclus', 'Matériel fourni', 'Assurance voyage'],
  };

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div className="flex justify-between items-center max-w-lg mx-auto relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500 rounded-full" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-4 transition-all",
              currentStep >= step.id ? "bg-primary border-primary text-white" : "bg-white border-slate-200 text-slate-400"
            )}>
              {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : step.id}
            </div>
            <span className={cn("text-[10px] font-black uppercase", currentStep === step.id ? "text-primary" : "text-slate-400")}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-2 border-slate-100 shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-slate-900">Que souhaitez-vous proposer ?</h3>
                <p className="text-slate-500">Choisissez la catégorie qui correspond le mieux à votre activité.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'accommodation', label: 'Hébergement', icon: Building, desc: 'Hôtels, Riads, Villas' },
                  { id: 'car_rental', label: 'Véhicules', icon: Car, desc: 'Location de voitures, SUV' },
                  { id: 'circuit', label: 'Circuit / Tour', icon: Compass, desc: 'Excursions, Safaris' },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setCategory(cat.id as any)}
                    className={cn(
                      "p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3",
                      category === cat.id ? "border-primary bg-primary/5 shadow-inner" : "border-slate-100 hover:border-primary/30"
                    )}
                  >
                    <cat.icon className={cn("h-10 w-10", category === cat.id ? "text-primary" : "text-slate-300")} />
                    <div className="font-black text-slate-900">{cat.label}</div>
                    <div className="text-xs text-slate-500">{cat.desc}</div>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-2">
                  <Label className="font-bold">Nom commercial</Label>
                  <Input value={formData.listingName} onChange={e => setFormData({...formData, listingName: e.target.value})} placeholder="Ex: Grand Riad Atlas" className="h-12 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Email professionnel</Label>
                  <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="contact@etablissement.com" className="h-12 border-slate-200" />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="font-bold">Description attractive</Label>
                  <Button variant="ghost" size="sm" onClick={handleAIEnhance} disabled={isGenerating} className="text-[#006ce4] font-bold gap-2">
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    Générer par IA
                  </Button>
                </div>
                <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Décrivez les atouts uniques de votre offre..." 
                  className="min-h-[120px] border-slate-200" 
                />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Adresse physique</Label>
                  <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="Rue, Ville, Code Postal" className="h-12 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Coordonnées GPS (Optionnel)</Label>
                  <div className="relative">
                    <Input value={formData.gpsCoordinates} onChange={e => setFormData({...formData, gpsCoordinates: e.target.value})} placeholder="36.75, 3.05" className="h-12 pl-10 border-slate-200" />
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <Label className="font-bold block text-lg">Options & Équipements</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
                  {commonAmenities[category].map((item) => (
                    <div key={item} className="flex items-center space-x-3">
                      <Checkbox 
                        id={item} 
                        checked={formData.amenities.includes(item)}
                        onCheckedChange={(checked) => {
                          if (checked) setFormData({...formData, amenities: [...formData.amenities, item]});
                          else setFormData({...formData, amenities: formData.amenities.filter(i => i !== item)});
                        }}
                        className="h-5 w-5 border-slate-300" 
                      />
                      <label htmlFor={item} className="text-sm font-bold text-slate-700 cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label className="font-bold">Prix de base (DZD / nuit ou jour)</Label>
                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="h-12 border-slate-200 font-bold" />
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center">
              <div className="border-4 border-dashed border-slate-100 rounded-2xl p-16 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h4 className="text-xl font-black text-slate-900">Téléchargez vos photos</h4>
                <p className="text-slate-500 mt-2">Glissez-déposez au moins 5 photos haute résolution</p>
              </div>
              <p className="text-xs text-slate-400">Format supportés: JPG, PNG. Max 5MB par fichier.</p>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
            <Button variant="ghost" onClick={prevStep} disabled={currentStep === 1} className="font-bold text-slate-500">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 px-10 h-12 rounded-xl font-black shadow-lg shadow-primary/20">
              {currentStep === steps.length ? 'Terminer l\'inscription' : 'Continuer'}
              {currentStep !== steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
