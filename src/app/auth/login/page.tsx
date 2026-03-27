"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, ArrowLeft } from "lucide-react";
import { checkIsAdmin } from "@/lib/admin-config";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (checkIsAdmin(user)) {
          router.push("/admin");
        } else {
          router.push("/profile");
        }
      } else {
        setCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [auth, router]);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: any) => {
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur StayFloow.com !",
      });

      if (checkIsAdmin(user)) {
        router.push("/admin");
      } else {
        router.push("/profile");
      }
    } catch (error: any) {
      let title = "Erreur de connexion";
      let message = "Email ou mot de passe incorrect.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = "Vos identifiants sont incorrects. Veuillez vérifier votre email et mot de passe.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Trop de tentatives échouées. Votre compte est temporairement bloqué. Réessayez plus tard.";
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "La connexion par email n'est pas activée dans la console Firebase.";
      }

      toast({
        variant: "destructive",
        title: title,
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-slate-400 font-bold animate-pulse">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 border border-slate-100 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-black text-primary mb-4 block hover:opacity-80 transition-opacity tracking-tighter">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Connectez-vous</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium px-4">
            Accédez à votre espace pour gérer vos séjours, voitures et circuits.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      className="h-14 border-slate-200 focus:border-primary rounded-2xl px-5 text-lg"
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
                  <div className="flex justify-between items-center ml-1">
                    <FormLabel className="font-bold text-slate-700">Mot de passe</FormLabel>
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Oublié ?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-14 border-slate-200 focus:border-primary rounded-2xl px-5 text-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-xl shadow-primary/20 rounded-2xl transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  <LogIn className="h-6 w-6" /> Se connecter
                </span>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" className="text-primary font-black hover:underline">
              S'inscrire gratuitement
            </Link>
          </p>
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mt-8 hover:text-primary transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}