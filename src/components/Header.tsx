"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, LayoutDashboard, ShieldCheck, Building, Car, Compass } from "lucide-react";
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

  const isAdmin = useMemo(() => user && user.email === ADMIN_EMAIL, [user]);

  if (!isClient) {
    return <header className="sticky top-0 z-50 w-full bg-primary h-16 shadow-md" />;
  }

  const currencies = ["DZD", "EUR", "USD", "GBP", "CHF", "EGP"];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group" prefetch={true}>
            <span className="text-2xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform">
              StayFloow<span className="text-secondary">.com</span>
            </span>
          </Link>

          {/* Navigation Principale Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            <NavLink href="/search" icon={<Building className="h-4 w-4" />} label={t("accommodations")} />
            <NavLink href="/cars" icon={<Car className="h-4 w-4" />} label={t("car_rental")} />
            <NavLink href="/circuits" icon={<Compass className="h-4 w-4" />} label={t("tours")} />
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors flex items-center gap-2 outline-none">
                  <span>{getCurrencyFlag(currency)}</span>
                  <span>{currency}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
                {currencies.map((c) => (
                  <DropdownMenuItem key={c} onSelect={() => setCurrency(c as any)} className="font-bold cursor-pointer">
                    <span className="mr-2">{getCurrencyFlag(c as any)}</span> {c}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:bg-white/10 px-2 py-2 rounded-md transition-colors outline-none">
                  <span className="text-lg">{getLocaleDetails().flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-none shadow-2xl">
                {availableLocales.map((loc) => (
                  <DropdownMenuItem key={loc} onSelect={() => setLocale(loc as any)} className="font-bold cursor-pointer">
                    <span className="mr-2">{getLocaleDetails(loc as any).flag}</span> {getLocaleDetails(loc as any).name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!isAdmin && (
              <Button variant="ghost" className="text-sm font-bold hover:bg-white/10 px-3 py-2 rounded-md transition-colors" asChild>
                <Link href="/partners/join" prefetch={true}>
                  {t("list_property")}
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!userLoading ? (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 border-2 border-white/20 hover:border-white transition-colors outline-none">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user.photoURL || ""} />
                        <AvatarFallback className={cn("text-white font-black", isAdmin ? "bg-amber-500" : "bg-white/10")}>
                          {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 rounded-xl mt-2 border-none shadow-2xl" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black text-slate-900">{isAdmin ? "Administrateur" : (user.displayName || "Voyageur")}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {isAdmin ? (
                      <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer bg-primary/5 text-primary rounded-lg mb-1">
                        <Link href="/admin" prefetch={true}><ShieldCheck className="h-4 w-4 mr-3" /> Portail Admin</Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer rounded-lg">
                          <Link href="/profile" prefetch={true}><UserIcon className="h-4 w-4 mr-3" /> Mon Profil</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer rounded-lg">
                          <Link href="/partners/dashboard" prefetch={true}><LayoutDashboard className="h-4 w-4 mr-3" /> Espace Partenaire</Link>
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
                    <Link href="/auth/register" prefetch={true}>{t("register")}</Link>
                  </Button>
                  <Button className="bg-white text-primary hover:bg-slate-100 font-bold px-6 shadow-lg border-none rounded-full" asChild>
                    <Link href="/auth/login" prefetch={true}>{t("login")}</Link>
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

function NavLink({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link 
      href={href} 
      prefetch={true}
      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
