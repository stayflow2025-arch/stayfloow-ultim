
"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, LayoutDashboard, ShieldCheck, Building, Car, Compass, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useEffect, useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ADMIN_EMAIL = "stayflow2025@gmail.com";

export function Header() {
  const { t, locale, setLocale, getLocaleDetails, availableLocales } = useLanguage();
  const { currency, setCurrency, getCurrencyFlag } = useCurrency();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Déconnexion réussie" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  const isAdmin = useMemo(() => user && user.email === ADMIN_EMAIL, [user]);

  if (!mounted) {
    return <header className="sticky top-0 z-50 w-full bg-primary h-16 shadow-md" />;
  }

  const currencies = ["DZD", "EUR", "USD", "GBP", "CHF", "EGP"];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-black tracking-tighter text-white">
              StayFloow<span className="text-secondary">.com</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            <Link href="/search" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              <Building className="h-4 w-4" /> {t("accommodations")}
            </Link>
            <Link href="/cars" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              <Car className="h-4 w-4" /> {t("car_rental")}
            </Link>
            <Link href="/circuits" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              <Compass className="h-4 w-4" /> {t("tours")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2 outline-none">
                  <span>{getCurrencyFlag(currency)}</span>
                  <span>{currency}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1 bg-white">
                {currencies.map((c) => (
                  <DropdownMenuItem key={c} onSelect={() => setCurrency(c as any)} className="font-bold cursor-pointer rounded-lg text-slate-700">
                    <span className="mr-2">{getCurrencyFlag(c as any)}</span> {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-md transition-colors outline-none font-bold text-sm">
                  <span className="text-lg">{getLocaleDetails().flag}</span>
                  <span className="uppercase">{locale}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl p-1 bg-white">
                {availableLocales.map((loc) => (
                  <DropdownMenuItem key={loc} onSelect={() => setLocale(loc as any)} className="font-bold cursor-pointer rounded-lg text-slate-700">
                    <span className="mr-2">{getLocaleDetails(loc as any).flag}</span> {getLocaleDetails(loc as any).name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAdmin && (
              <Button variant="ghost" className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors" asChild>
                <Link href="/partners/join">{t("list_property")}</Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isUserLoading ? (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-white/20 hover:border-white transition-colors outline-none">
                      <Avatar className="h-full w-full">
                        <AvatarFallback className={cn("text-white font-black", isAdmin ? "bg-amber-500" : "bg-white/10")}>
                          {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 rounded-xl mt-2 border-none shadow-2xl bg-white" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-slate-900">{isAdmin ? "Administrateur" : (user.displayName || "Voyageur")}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isAdmin ? (
                      <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer bg-primary/5 text-primary rounded-lg mb-1">
                        <Link href="/admin"><ShieldCheck className="h-4 w-4 mr-3" /> Portail Admin</Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer rounded-lg text-slate-700">
                          <Link href="/profile"><UserIcon className="h-4 w-4 mr-3" /> Mon Profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer rounded-lg text-slate-700">
                          <Link href="/partners/dashboard"><LayoutDashboard className="h-4 w-4 mr-3" /> Espace Partenaire</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="font-bold py-3 text-red-600 cursor-pointer rounded-lg hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-3" /> {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="hidden sm:flex font-bold hover:bg-white/10 rounded-full" asChild>
                    <Link href="/auth/register">{t("register")}</Link>
                  </Button>
                  <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6 shadow-lg border-none rounded-full" asChild>
                    <Link href="/auth/login">{t("login")}</Link>
                  </Button>
                </div>
              )
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
