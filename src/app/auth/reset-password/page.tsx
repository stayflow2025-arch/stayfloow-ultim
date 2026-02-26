"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Lock, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get('token');

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast({
        title: "Jeton invalide",
        description: "Le lien de réinitialisation semble invalide ou expiré.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation d'un appel API pour réinitialiser le mot de passe
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Password updated for token:", token);
      
      setIsSuccess(true);
      toast({
        title: "Mot de passe mis à jour !",
        description: "Votre nouveau mot de passe a été enregistré avec succès.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du mot de passe.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 mb-4">C'est fait !</CardTitle>
        <CardDescription className="text-slate-500 mb-8 font-medium">
          Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter à votre compte StayFloow.com.
        </CardDescription>
        <Button className="w-full h-14 bg-primary text-white font-black rounded-xl text-lg shadow-lg" asChild>
          <Link href="/auth/login">Se connecter</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden bg-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="text-center pt-10 px-8">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Nouveau mot de passe</CardTitle>
        <CardDescription className="text-slate-500 font-medium mt-2">
          Saisissez votre nouveau mot de passe sécurisé pour StayFloow.com.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Mot de passe</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 border-slate-200 focus:border-primary rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700">Confirmer le mot de passe</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-12 border-slate-200 focus:border-primary rounded-xl"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 rounded-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer le mot de passe"
              )}
            </Button>

          </form>
        </Form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <Link href="/auth/login" className="flex items-center justify-center gap-2 font-bold text-slate-400 hover:text-primary transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-400 font-bold animate-pulse">Chargement...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
