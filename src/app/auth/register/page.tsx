"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";

const signupSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis."),
  email: z.string().email("L'adresse email est invalide."),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    if (!captchaToken) {
      toast({
        variant: "destructive",
        title: "Captcha requis",
        description: "Veuillez confirmer que vous n'êtes pas un robot.",
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      await updateProfile(userCredential.user, {
        displayName: values.fullName
      });

      toast({
        title: "Compte créé !",
        description: `Bienvenue sur StayFloow, ${values.fullName} !`,
      });
      
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer le compte.",
      });
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black text-primary mb-4 block hover:opacity-80 transition-opacity tracking-tighter">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Créer un compte</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium px-4">
            Rejoignez la communauté StayFloow et commencez à planifier vos voyages.
          </p>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="pt-8 px-8 pb-0">
             <CardTitle className="sr-only">Formulaire d'inscription</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 ml-1">Nom complet</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: John Doe"
                          className="h-14 border-slate-200 focus:border-primary rounded-2xl px-5"
                          {...field}
                        />
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
                      <FormLabel className="font-bold text-slate-700 ml-1">Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          className="h-14 border-slate-200 focus:border-primary rounded-2xl px-5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-slate-700 ml-1">Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="h-14 border-slate-200 focus:border-primary rounded-2xl px-5"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="py-2 flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                    onChange={(t) => setCaptchaToken(t)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !captchaToken} 
                  className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95 mt-4"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      <UserPlus className="h-6 w-6" /> S'inscrire
                    </span>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Déjà un compte ?{" "}
                <Link href="/auth/login" className="text-primary font-black hover:underline">
                  Se connecter
                </Link>
              </p>
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mt-8 hover:text-primary transition-colors group">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Retourner à l'accueil
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}