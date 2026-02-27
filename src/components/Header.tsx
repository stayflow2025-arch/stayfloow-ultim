"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, LayoutDashboard, HelpCircle, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useCurrency } from "@/context/currency-context";
import { useEffect, useState } from "react";
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

export function Header() {
  const { t, locale, setLocale, getLocaleDetails, availableLocales } = useLanguage();
  const { currency, setCurrency, getCurrencyFlag } = useCurrency();
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: t("logout") });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  if (!isClient) {
    return <header className="sticky top-0 z-50 w-full bg-primary h-16" />;
  }

  const currencies = ["DZD", "EUR", "USD", "GBP", "CHF", "EGP"];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tighter text-white">
            StayFloow<span className="text-secondary">.com</span>
          </span>
        </Link>

        {/* Actions Droite */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2">
            {/* DEVISE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2">
                  <span>{getCurrencyFlag(currency)}</span>
                  <span>{currency}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {currencies.map((c) => (
                  <DropdownMenuItem key={c} onSelect={() => setCurrency(c as any)} className="font-bold cursor-pointer">
                    <span className="mr-2">{getCurrencyFlag(c as any)}</span> {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* LANGUE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:bg-white/10 px-2 py-2 rounded-md transition-colors">
                  <span className="text-lg">{getLocaleDetails().flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl">
                {availableLocales.map((loc) => (
                  <DropdownMenuItem key={loc} onSelect={() => setLocale(loc as any)} className="font-bold cursor-pointer">
                    <span className="mr-2">{getLocaleDetails(loc as any).flag}</span> {getLocaleDetails(loc as any).name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="hover:bg-white/10 p-2 rounded-full transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>

            {/* BOUTON PARTENAIRE DIRECT */}
            <Button variant="ghost" className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors" asChild>
              <Link href="/partners/join">
                {t("list_property")}
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {!userLoading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-white/20 hover:border-white transition-colors">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.photoURL || ""} />
                        <AvatarFallback className="bg-white/10 text-white font-black">
                          {user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 rounded-xl mt-2" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-slate-900">{user.displayName || "Voyageur"}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="font-bold py-2.5 cursor-pointer">
                      <Link href="/profile"><UserIcon className="h-4 w-4 mr-3" /> {t("profile")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="font-bold py-2.5 cursor-pointer">
                      <Link href="/partners/dashboard"><LayoutDashboard className="h-4 w-4 mr-3" /> {t("dashboard")}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="font-bold py-2.5 text-red-600 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-3" /> {t("logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" className="hidden sm:flex font-bold hover:bg-white/10" asChild>
                    <Link href="/auth/register">{t("register")}</Link>
                  </Button>
                  <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6 shadow-lg border-none" asChild>
                    <Link href="/auth/login">{t("login")}</Link>
                  </Button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}