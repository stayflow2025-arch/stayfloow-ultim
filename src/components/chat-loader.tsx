"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

/**
 * Chargeur dynamique pour le composant de support client.
 * Évite les erreurs d'hydratation en désactivant le SSR pour le widget de chat.
 */
const CustomerSupportChat = dynamic(
  () =>
    import("@/components/customer-support-chat").then(
      (mod) => mod.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          className="rounded-full shadow-2xl w-16 h-16 flex items-center justify-center bg-primary text-white border-4 border-white animate-pulse"
        >
          <MessageSquare className="h-8 w-8" />
        </Button>
      </div>
    ),
  }
);

export function ChatLoader() {
  return <CustomerSupportChat />;
}
