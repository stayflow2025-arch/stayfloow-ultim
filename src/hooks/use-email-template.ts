"use client";

import { useState, useEffect, useCallback } from 'react';
import { defaultTemplates, type EmailTemplate, type EmailTemplateName } from '@/lib/email-templates';

const STORAGE_KEY_PREFIX = 'emailTemplate_';

/**
 * Hook personnalisé pour gérer les modèles d'e-mails.
 * Permet de récupérer les modèles par défaut ou personnalisés depuis le localStorage.
 */
export function useEmailTemplate(name: EmailTemplateName) {
    const [template, setTemplate] = useState<EmailTemplate>(defaultTemplates[name]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${name}`);
            if (saved) {
                setTemplate(JSON.parse(saved));
            }
        } catch (error) {
            console.error(`Could not parse email template '${name}' from localStorage`, error);
        } finally {
            setIsLoading(false);
        }
    }, [name]);

    const saveTemplate = useCallback(async (newTemplate: EmailTemplate): Promise<void> => {
        try {
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${name}`, JSON.stringify(newTemplate));
            setTemplate(newTemplate);
        } catch (error) {
            console.error(`Could not save email template '${name}' to localStorage`, error);
            throw new Error("Failed to save template.");
        }
    }, [name]);

    return { template, isLoading, saveTemplate };
}
