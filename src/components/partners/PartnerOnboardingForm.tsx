"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Building, Car, Compass, Upload, MapPin, CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generatePartnerDescription } from '@/ai/flows/partner-description-generator';

const steps = [
  { id: 1, title: 'General Info' },
  { id: 2, title: 'Listing Details' },
  { id: 3, title: 'Availability' },
  { id: 4, title: 'Photos' },
];

export default function PartnerOnboardingForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [category, setCategory] = useState<'accommodation' | 'car_rental' | 'circuit'>('accommodation');
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [formData, setFormData] = useState({
    listingName: '',
    description: '',
    location: '',
    email: '',
    phone: '',
    price: '',
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleAIEnhance = async () => {
    if (!formData.listingName || !formData.location) {
      alert("Please enter a name and location first!");
      return;
    }
    setIsGeneratingDescription(true);
    try {
      const result = await generatePartnerDescription({
        listingType: category,
        listingName: formData.listingName,
        location: formData.location,
        keyFeatures: ["Authentic", "Secure", "Comfortable"],
        existingDescription: formData.description
      });
      setFormData(prev => ({ ...prev, description: result.generatedDescription }));
    } catch (error) {
      console.error("AI enhancement failed", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="flex justify-between items-center max-w-md mx-auto relative px-2">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -z-10 -translate-y-1/2" />
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2",
                currentStep >= step.id 
                  ? "bg-primary border-primary text-white" 
                  : "bg-white border-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : step.id}
            </div>
            <span className={cn(
              "text-[10px] uppercase font-bold tracking-wider",
              currentStep === step.id ? "text-primary" : "text-muted-foreground"
            )}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <Card className="border-none booking-card-shadow">
        <CardContent className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <Label className="text-base mb-4 block">What are you listing?</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'accommodation', label: 'Accommodation', icon: Building, desc: 'Hotels, Riads, Apartments' },
                    { id: 'car_rental', label: 'Car Rental', icon: Car, desc: 'Urban, SUVs, 4x4s' },
                    { id: 'circuit', label: 'Circuit/Tour', icon: Compass, desc: 'Safaris, City Tours' },
                  ].map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => setCategory(cat.id as any)}
                      className={cn(
                        "p-4 rounded-lg border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-2 hover:border-primary/50",
                        category === cat.id ? "border-primary bg-primary/5 shadow-sm" : "border-muted"
                      )}
                    >
                      <cat.icon className={cn("h-8 w-8 mb-2", category === cat.id ? "text-primary" : "text-muted-foreground")} />
                      <div className="font-bold">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="listingName">Name of your {category.replace('_', ' ')}</Label>
                  <Input 
                    id="listingName" 
                    placeholder="e.g. Royal Riad Algiers" 
                    value={formData.listingName}
                    onChange={(e) => setFormData({...formData, listingName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Address / City</Label>
                  <div className="relative">
                    <Input 
                      id="location" 
                      placeholder="Enter city or full address" 
                      className="pl-9"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (WhatsApp preferred)</Label>
                  <Input 
                    id="phone" 
                    placeholder="+213 123 456 789"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Tell us more about your listing</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 h-auto p-0 flex items-center gap-1"
                    onClick={handleAIEnhance}
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription ? <Loader2 className="h-3 w-3 animate-spin" /> : <Compass className="h-3 w-3" />}
                    AI Enhance Description
                  </Button>
                </div>
                <Textarea 
                  placeholder="Describe your unique features, comfort, and service..." 
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <Label className="mb-4 block">Top Amenities</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {['WiFi', 'AC', 'Parking', 'Pool', 'Breakfast', 'Secure'].map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox id={item} />
                        <label htmlFor={item} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Base Price per night (DZD/EGP)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="e.g. 5000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                  <p className="text-[10px] text-muted-foreground">Average price for similar listings: 4,500 DZD</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-8">
              <div className="mx-auto w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                <Compass className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Set your Availability</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Sync your calendar or manually block dates where you won't be taking bookings.
              </p>
              <div className="bg-muted h-64 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                <span className="text-muted-foreground italic">Interactive Calendar Interface Loading...</span>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <Label className="text-base block mb-2 text-center">Add high-quality photos (Min 5)</Label>
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-12 bg-muted/30 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <p className="font-bold text-lg mb-1">Drag and drop photos here</p>
                <p className="text-muted-foreground text-sm">Or click to browse from your device</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-md border flex items-center justify-center">
                    <span className="text-muted-foreground/30 text-xs">Photo {i} placeholder</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-t pt-8">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="px-8"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              onClick={nextStep} 
              className="px-8 bg-primary hover:bg-primary/90"
            >
              {currentStep === steps.length ? 'Submit Listing' : 'Continue'}
              {currentStep !== steps.length && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          By continuing, you agree to StayFloow's <Link href="#" className="text-primary underline">Partner Terms</Link>
        </p>
      </div>
    </div>
  );
}
