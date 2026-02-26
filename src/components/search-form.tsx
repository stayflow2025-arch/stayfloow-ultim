"use client";

import { Search } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { Input } from "@/components/ui/input";

/**
 * @fileOverview Formulaire de recherche simple et réutilisable.
 * Complémentaire à la barre de recherche avancée du Hero.
 */
export function SearchForm() {
  const { t } = useLanguage();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const query = formData.get("q");
    if (query) {
      window.location.href = `/search?dest=${encodeURIComponent(query.toString())}`;
    }
  };

  return (
    <form className="relative w-full max-w-md group" onSubmit={handleSearch}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" />
      <Input
        name="q"
        type="text"
        placeholder={t("search")}
        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl font-medium"
      />
    </form>
  );
}
