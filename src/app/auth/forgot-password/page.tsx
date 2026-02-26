
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { sendPasswordResetEmail } from '@/lib/mail';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().email("L'adresse email est invalide."),
});

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setIsSending(true);

    try {
      await sendPasswordResetEmail({ userEmail: values.email, userType: 'customer' });
      toast({
        title: "Email envoyé !",
        description: "Si un compte existe pour cet email, vous recevrez un lien pour réinitialiser votre mot de passe.",
      });
      form.reset();
    } catch (e) {
      console.error("Password reset email failed to send:", e);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer l'email de réinitialisation.",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-2xl overflow-hidden bg-white">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <KeyRound className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black text-slate-900">Mot de passe oublié</CardTitle>
          <CardDescription className="text-slate-500 font-medium px-6">
            Saisissez votre email pour recevoir un lien de réinitialisation StayFloow.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email professionnel</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="votre@email.com" 
                      className="h-12 border-slate-200 focus:border-primary"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button 
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg shadow-primary/20 rounded-xl transition-all"
                disabled={isSending}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </Button>

            </form>
          </Form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <Link href="/auth/login" className="flex items-center justify-center gap-2 font-bold text-primary hover:underline group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
