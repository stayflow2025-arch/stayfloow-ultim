"use client";

import { Providers } from "@/components/providers";
import React from "react";

/**
 * @fileOverview Wrapper client principal pour les fournisseurs de contexte.
 * Assure que tous les contextes (Langue, Devise) sont correctement injectés dans l'arbre des composants.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
