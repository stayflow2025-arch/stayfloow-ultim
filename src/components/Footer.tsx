"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MountainSnow, Globe, ChevronDown, Building, Car, Compass } from "lucide-react";
import { useCurrency } from "@/context/currency-context";
import { useLanguage } from "@/context/language-context";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import type { Currency } from "@/context/currency-context";
import type { Locale } from "@/context/language-context";
import { SiInstagram, SiFacebook, SiTiktok } from "@icons-pack/react-simple-icons";
import { useState, useEffect } from "react";

type SocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
};

export function Footer() {
  const { currency, setCurrency, getCurrencySymbol, getCurrencyFlag } = useCurrency();
  const { locale, setLocale, t, getLocaleDetails, availableLocales } = useLanguage();
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLinks = localStorage.getItem("socialMediaSettings");
        if (savedLinks) {
          setSocialLinks(JSON.parse(savedLinks));
        } else {
          // Default mock links for StayFloow
          setSocialLinks({
            instagram: "https://instagram.com/stayfloow",
            facebook: "https://facebook.com/stayfloow",
            tiktok: "https://tiktok.com/@stayfloow"
          });
        }
      } catch (error) {
        console.error("Could not load social media links from localStorage", error);
      }
    }
  }, []);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
  };

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
  };

  const currencies: Currency[] = ["DZD", "EUR", "USD", "GBP", "CHF", "EGP"];

  return (
    <footer className="border-t bg-card">
      {!isAdminPage && (
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-black mb-4 text-white">
              {t("partner_cta_title")}
            </h2>
            <p className="max-w-3xl mx-auto mb-8 text-white/90 text-lg font-medium">
              {t("partner_cta_desc")}
            </p>

            {/* BOUTON COMMENCER UNIFIÉ AVEC LE HAUT */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="px-10 py-8 bg-secondary hover:bg-secondary/90 text-primary text-xl font-black rounded-xl shadow-2xl flex items-center gap-3 active:scale-95 transition-all">
                  {t("start")}
                  <ChevronDown className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-64 p-2 rounded-xl" align="center" side="top">
                <DropdownMenuItem asChild className="font-bold py-3.5 px-4 cursor-pointer">
                  <Link href="/partners/join?category=accommodation" className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-primary" /> {t("accommodations")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-bold py-3.5 px-4 cursor-pointer">
                  <Link href="/partners/join?category=car_rental" className="flex items-center gap-3">
                    <Car className="h-5 w-5 text-primary" /> {t("car_rental")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-bold py-3.5 px-4 cursor-pointer">
                  <Link href="/partners/join?category=circuit" className="flex items-center gap-3">
                    <Compass className="h-5 w-5 text-primary" /> {t("tours")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-3xl font-black text-primary tracking-tighter">StayFloow<span className="text-secondary">.com</span></span>
            </Link>

            <p className="text-sm text-slate-500 font-medium leading-relaxed">{t("footer_tagline")}</p>

            {socialLinks && (
                <div className="flex items-center gap-5 mt-2">
                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                    <SiInstagram className="h-6 w-6" />
                  </a>
                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                    <SiFacebook className="h-6 w-6" />
                  </a>
                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-colors">
                    <SiTiktok className="h-6 w-6" />
                  </a>
                </div>
              )}
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{t("navigation")}</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/search?type=accommodations" className="text-slate-500 hover:text-primary transition-colors">{t("accommodations")}</Link></li>
              <li><Link href="/cars" className="text-slate-500 hover:text-primary transition-colors">{t("car_rental")}</Link></li>
              <li><Link href="/circuits" className="text-slate-500 hover:text-primary transition-colors">{t("tours")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{t("company")}</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/about" className="text-slate-500 hover:text-primary transition-colors">{t("about")}</Link></li>
              <li><Link href="/contact" className="text-slate-500 hover:text-primary transition-colors">{t("contact")}</Link></li>
              <li><Link href="/admin" className="text-slate-500 hover:text-primary transition-colors">Portail Admin</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">{t("legal")}</h4>
            <ul className="space-y-4 text-sm font-bold">
              <li><Link href="/partners/dashboard" className="text-slate-500 hover:text-primary transition-colors">Espace Partenaire</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-primary transition-colors">{t("terms")}</Link></li>
              <li><Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors">{t("privacy")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs text-slate-400 font-bold">
            &copy; {new Date().getFullYear()} StayFloow.com — {t("rights_reserved")}
          </p>

          <div className="flex items-center gap-4">
            {/* LANGUE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:bg-slate-50 font-bold">
                  <span className="text-lg">{getLocaleDetails().flag}</span>
                  <span className="uppercase text-xs tracking-widest">{locale}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="rounded-xl p-1" side="top">
                {availableLocales.map((loc) => {
                  const details = getLocaleDetails(loc);
                  return (
                    <DropdownMenuItem key={loc} onSelect={() => handleLocaleChange(loc)} className="font-bold cursor-pointer rounded-lg">
                      <span className="mr-3 text-lg">{details.flag}</span>
                      <span>{details.name}</span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* DEVISE */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:bg-slate-50 font-bold">
                  <span className="text-lg">{getCurrencyFlag(currency)}</span>
                  <span className="text-xs tracking-widest">{currency}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="rounded-xl p-1" side="top">
                {currencies.map((c) => (
                  <DropdownMenuItem key={c} onSelect={() => handleCurrencyChange(c)} className="font-bold cursor-pointer rounded-lg">
                    <span className="mr-3 text-lg">{getCurrencyFlag(c)}</span>
                    <span>
                      {c} ({getCurrencySymbol(c)})
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  );
}
