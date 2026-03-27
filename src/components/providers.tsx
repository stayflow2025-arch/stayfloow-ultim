
"use client";

import { CurrencyProvider } from "@/context/currency-context";
import { LanguageProvider } from "@/context/language-context";
import React from "react";

/**
 * @fileOverview Composant de regroupement des providers client (Langue, Devise).
 * Fournit les contextes nécessaires à l'ensemble de l'application, y compris lors du rendu serveur.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        {children}
      </CurrencyProvider>
    </LanguageProvider>
  );
}
