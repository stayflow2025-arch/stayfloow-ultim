"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function EmailRetargetingCard() {
  const { t } = useLanguage();

  return (
    <Card className="bg-primary/5 border-primary/20 shadow-xl rounded-3xl overflow-hidden group">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3 text-primary font-black text-lg">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:scale-110 transition-transform">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          {t("email_retargeting_title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 pt-2">
        <p className="text-xs font-medium text-slate-500 leading-relaxed">
          {t("email_retargeting_description")}
        </p>

        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl shadow-lg shadow-primary/10 flex items-center justify-center gap-2 group-hover:scale-[1.02] transition-transform">
          {t("email_retargeting_cta")}
          <Sparkles className="h-4 w-4 text-secondary" />
        </Button>
      </CardContent>
    </Card>
  );
}
