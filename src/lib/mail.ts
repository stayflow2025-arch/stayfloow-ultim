
import { collection } from 'firebase/firestore';
import { initializeFirebase, addDocumentNonBlocking } from '@/firebase';
import { getEmailTemplate, type EmailTemplateName } from './email-templates';

/**
 * @fileOverview Système d'envoi d'emails StayFloow via l'extension Trigger Email de Firebase.
 * Synchronisé avec les paramètres SMTP Gmail (port 465).
 */

const triggerEmail = async (to: string, subject: string, body: string) => {
  try {
    const { firestore } = initializeFirebase();
    if (!firestore) return;

    // La collection 'mail' est celle configurée dans l'extension
    const mailCol = collection(firestore, 'mail');
    
    // Structure requise par l'extension Firebase Trigger Email
    addDocumentNonBlocking(mailCol, {
      to: to,
      message: {
        subject: subject,
        html: body,
      },
    });
    
    console.log(`[STAYFLOOW MAIL] Demande d'envoi générée pour : ${to}`);
    return { success: true };
  } catch (error) {
    console.error("[STAYFLOOW MAIL] Erreur lors de la génération de la demande:", error);
    return { success: false, error };
  }
};

/**
 * Envoie un email de bienvenue après l'inscription d'un nouveau client.
 */
export const sendRegistrationWelcomeEmail = async ({ userName, userEmail }: { userName: string, userEmail: string }) => {
  const { subject, body } = await getEmailTemplate("registrationWelcome", { userName });
  return triggerEmail(userEmail, subject, body);
};

/**
 * Envoie un email de bienvenue à un nouveau partenaire après sa soumission.
 */
export const sendWelcomeEmail = async ({
  hostName,
  submissionType,
  submissionName,
  hostEmail,
  referenceNumber,
}: any) => {
  const { subject, body } = await getEmailTemplate("partnerWelcome", {
    hostName,
    submissionType,
    submissionName,
    referenceNumber,
    setupLink: "https://www.stayfloow.com/partners/dashboard",
  });

  return triggerEmail(hostEmail, subject, body);
};

/**
 * Envoie une confirmation de réservation au client.
 */
export const sendBookingConfirmationEmail = async ({
  customerName,
  customerEmail,
  reservationNumber,
  itemName,
  itemType,
  hostName,
  hostEmail,
  hostPhone,
  bookingDetails,
}: any) => {
  let detailsHtml = `<div style="margin: 20px 0; padding: 20px; background: #f1f5f9; border-radius: 12px;">`;
  if (bookingDetails.startDate) {
    detailsHtml += `<p style="margin: 5px 0;"><strong>📅 Début :</strong> ${new Date(bookingDetails.startDate).toLocaleDateString("fr-FR")}</p>`;
  }
  if (bookingDetails.endDate) {
    detailsHtml += `<p style="margin: 5px 0;"><strong>🏁 Fin :</strong> ${new Date(bookingDetails.endDate).toLocaleDateString("fr-FR")}</p>`;
  }
  if (bookingDetails.totalPrice) {
    detailsHtml += `<p style="margin: 5px 0; color: #10B981; font-size: 18px;"><strong>💰 Total :</strong> ${bookingDetails.totalPrice.toLocaleString('fr-DZ')} DZD</p>`;
  }
  detailsHtml += `</div>`;

  const { subject, body } = await getEmailTemplate("bookingConfirmation", {
    customerName,
    reservationNumber,
    itemName,
    detailsHtml,
    hostName,
    hostEmail,
    hostPhone,
    itemType,
  });

  return triggerEmail(customerEmail, subject, body);
};

/**
 * Envoie un lien de réinitialisation de mot de passe.
 */
export const sendPasswordResetEmail = async ({
  userEmail,
}: { userEmail: string; userType?: string }) => {
  const resetToken = "reset-" + Math.random().toString(36).substring(7);
  const resetLink = `https://www.stayfloow.com/auth/reset-password?token=${resetToken}`;

  const { subject, body } = await getEmailTemplate("passwordReset", { resetLink });
  return triggerEmail(userEmail, subject, body);
};
