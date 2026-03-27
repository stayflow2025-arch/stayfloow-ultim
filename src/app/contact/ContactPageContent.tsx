"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef } from "react";

interface ContactPageContentProps {
  t: (key: string) => string;
  toast: any;
}

export default function ContactPageContent({ t, toast }: ContactPageContentProps) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const onSubmit = async (values: any) => {
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "Vérification requise",
        description: "Veuillez valider le captcha pour prouver que vous n'êtes pas un robot.",
      });
      return;
    }

    setIsSubmitting(true);
    // Simuler un envoi
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: t("contact.successTitle"),
      description: t("contact.successMessage"),
    });

    form.reset();
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Info Sidebar */}
        <div className="space-y-6">
          <h1 className="text-4xl font-black text-slate-900 mb-8 leading-tight">
            {t("contact.title")}
          </h1>
          
          <ContactInfoCard 
            icon={<Phone className="text-primary" />}
            title="Téléphone"
            value="+213 (0) 550 00 00 00"
          />
          <ContactInfoCard 
            icon={<Mail className="text-primary" />}
            title="Email"
            value="support@stayfloow.com"
          />
          <ContactInfoCard 
            icon={<MapPin className="text-primary" />}
            title="Bureaux"
            value="Hydra, Alger, Algérie"
          />
        </div>

        {/* Form Card */}
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-8 md:p-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t("contact.name")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("contact.namePlaceholder")} className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t("contact.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={t("contact.emailPlaceholder")} className="h-12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">{t("contact.message")}</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder={t("contact.messagePlaceholder")}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="py-2 flex justify-center md:justify-start">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={onCaptchaChange}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={!captchaToken || isSubmitting}
                  className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : t("contact.send")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ContactInfoCard({ icon, title, value }: { icon: any, title: string, value: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="bg-primary/10 p-3 rounded-xl">{icon}</div>
      <div>
        <h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">{title}</h4>
        <p className="font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}