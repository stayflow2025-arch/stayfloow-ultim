/**
 * @fileOverview Modèles d'e-mails par défaut et types pour StayFloow.com
 */

export type EmailTemplateName = 'booking_confirmation' | 'password_reset' | 'favorite_reminder';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export const defaultTemplates: Record<EmailTemplateName, EmailTemplate> = {
  booking_confirmation: {
    subject: "Confirmation de votre réservation sur StayFloow.com",
    body: "Bonjour {{customerName}},\n\nNous avons le plaisir de vous confirmer votre réservation n° {{reservationNumber}} pour l'établissement : {{itemName}}.\n\nType : {{itemType}}\nDétails : {{bookingDetails}}\n\nVotre hôte {{hostName}} est disponible au {{hostPhone}}.\n\nMerci d'avoir choisi StayFloow !"
  },
  password_reset: {
    subject: "Réinitialisation de votre mot de passe - StayFloow",
    body: "Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe StayFloow.com. Veuillez cliquer sur le lien ci-dessous :\n\n{{resetLink}}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail."
  },
  favorite_reminder: {
    subject: "Votre coup de cœur vous attend sur StayFloow !",
    body: "Bonjour {{customerName}},\n\nVous avez ajouté {{itemName}} à vos favoris il y a quelques jours. C'est l'un de nos établissements les plus demandés à {{location}}.\n\nNe manquez pas l'occasion de réserver votre séjour au meilleur prix sur StayFloow.com !"
  }
};
