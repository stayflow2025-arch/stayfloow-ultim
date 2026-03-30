"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogOut, User as UserIcon, LayoutDashboard, ShieldCheck, Building, Car, Compass, ChevronDown, Menu, X, Mail } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser, useAuth, useFirestore } from "@/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { checkIsAdmin } from "@/lib/admin-config";

export function Header() {
  const { t, locale, setLocale, getLocaleDetails, availableLocales } = useLanguage();
  const { currency, setCurrency, getCurrencyFlag } = useCurrency();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user && db) {
      const fetchRole = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'users', user.uid));
          if (docSnap.exists()) {
            setUserRole(docSnap.data().role);
          }
        } catch (e) {}
      };
      fetchRole();
    }
  }, [user, db]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Déconnexion réussie" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur" });
    }
  };

  const isAdmin = useMemo(() => checkIsAdmin(user), [user]);
  const isPartner = useMemo(() => userRole === 'partner', [userRole]);

  if (!mounted) {
    return <header className="sticky top-0 z-50 w-full bg-primary h-16 shadow-md" />;
  }

  const currencies = ["DZD", "EUR", "USD", "GBP", "CHF", "EGP"];

  return (
    <header className="sticky top-0 z-50 w-full bg-primary text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center px-4 justify-between">
        <div className="flex items-center gap-4 lg:gap-8">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 bg-white border-none">
              <SheetHeader className="p-6 bg-primary text-white">
                <SheetTitle className="text-white font-black text-2xl tracking-tighter">StayFloow<span className="text-secondary">.com</span></SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4">
                <MobileLink href="/search" icon={<Building />} label={t("accommodations")} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/cars" icon={<Car />} label={t("car_rental")} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/circuits" icon={<Compass />} label={t("tours")} onClick={() => setIsMobileMenuOpen(false)} />
                <MobileLink href="/contact" icon={<Mail />} label={t("contact")} onClick={() => setIsMobileMenuOpen(false)} />
                <div className="h-px bg-slate-100 my-4" />
                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Paramètres</p>
                <div className="grid grid-cols-2 gap-2 px-4">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-between border-slate-200 text-slate-700 h-10 px-3">
                        {getCurrencyFlag(currency)} {currency} <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 border-none shadow-2xl rounded-xl p-1">
                      {currencies.map(c => (
                        <DropdownMenuItem key={c} onSelect={() => setCurrency(c as any)} className="font-bold cursor-pointer">{getCurrencyFlag(c as any)} {c}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-between border-slate-200 text-slate-700 h-10 px-3 uppercase">
                        {getLocaleDetails().flag} {locale} <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-40 border-none shadow-2xl rounded-xl p-1">
                      {availableLocales.map(loc => (
                        <DropdownMenuItem key={loc} onSelect={() => setLocale(loc as any)} className="font-bold cursor-pointer">{getLocaleDetails(loc as any).flag} {getLocaleDetails(loc as any).name}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </nav>
            </SheetContent>
          </Sheet>

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
            <Link href="/contact" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors">
              <Mail className="h-4 w-4" /> {t("contact")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:flex items-center gap-4">
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

            {!isAdmin && !isPartner && (
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
                        {isPartner && (
                          <DropdownMenuItem asChild className="font-bold py-3 cursor-pointer rounded-lg bg-primary/5 text-primary">
                            <Link href="/partners/dashboard"><LayoutDashboard className="h-4 w-4 mr-3" /> Espace Partenaire</Link>
                          </DropdownMenuItem>
                        )}
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

function MobileLink({ href, icon, label, onClick }: { href: string, icon: any, label: string, onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-4 p-4 rounded-xl text-slate-700 font-black text-lg hover:bg-primary/5 transition-colors">
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}
