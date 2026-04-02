
import { collection } from 'firebase/firestore';
import { initializeFirebase, addDocumentNonBlocking } from '@/firebase';
import { getEmailTemplate, type EmailTemplateName } from './email-templates';

/**
 * @fileOverview Système d'envoi d'emails StayFloow via l'extension Trigger Email de Firebase.
 * Synchronisé avec les paramètres SMTP Gmail (port 465).
 */

const triggerEmail = async (to: string, subject: string, body: string) => {
  try {
    // 1. Détection de l'environnement serveur
    const isServer = typeof window === 'undefined';
    
    if (isServer) {
      const { adminDb } = await import('@/firebase/admin');
      await adminDb.collection('mail').add({
        to: to,
        message: {
          subject: subject,
          html: body,
        },
      });
      console.log(`[STAYFLOOW SERVER MAIL] Demande envoyée via ADMIN SDK pour : ${to}`);
    } else {
      // Logic Client existante
      const { firestore } = initializeFirebase();
      if (!firestore) return;
      const { collection } = await import('firebase/firestore');
      const mailCol = collection(firestore, 'mail');
      addDocumentNonBlocking(mailCol, {
        to: to,
        message: {
          subject: subject,
          html: body,
        },
      });
      console.log(`[STAYFLOOW CLIENT MAIL] Demande générée pour : ${to}`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("[STAYFLOOW MAIL] Erreur lors de l'envoi:", error);
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
 * Envoie une confirmation de réservation au client, au partenaire et à l'admin.
 */
export const sendBookingConfirmationEmail = async ({
  customerName,
  customerEmail,
  customerPhone,
  reservationNumber,
  itemName,
  itemType,
  hostName,
  hostEmail,
  hostPhone,
  bookingDetails,
}: any) => {
  const adminEmail = "stayflow2025@gmail.com";

  // 1. Formater les détails pour le HTML
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

  // 2. Générer le lien Google Calendar
  const formatDateForCalendar = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
  };

  const startCal = formatDateForCalendar(bookingDetails.startDate);
  // Pour le calendrier, si c'est la même journée, on ajoute 1h, sinon on prend l'endDate
  const endCal = bookingDetails.endDate 
    ? formatDateForCalendar(bookingDetails.endDate) 
    : formatDateForCalendar(new Date(new Date(bookingDetails.startDate).getTime() + 3600000).toISOString());
  
  const calendarLink = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Réservation StayFloow: ${itemName}`)}&dates=${startCal}/${endCal}&details=${encodeURIComponent(`Référence: ${reservationNumber}\nType: ${itemType}`)}`;

  // --- ENVOI CLIENT ---
  const clientTpl = await getEmailTemplate("bookingConfirmation", {
    customerName,
    reservationNumber,
    itemName,
    detailsHtml,
    hostName,
    hostEmail,
    hostPhone,
    itemType,
    calendarLink,
    addressObj: bookingDetails.pickupLocation || itemName // On utilise le nom de l'item ou le lieu de prise en charge
  });
  await triggerEmail(customerEmail, clientTpl.subject, clientTpl.body);

  // --- ENVOI PARTENAIRE ---
  const partnerTpl = await getEmailTemplate("partnerBookingNotification", {
    hostName,
    itemName,
    customerName,
    customerPhone: customerPhone || "Non renseigné",
    customerEmail,
    reservationNumber,
    detailsHtml,
    calendarLink
  });
  // Si hostEmail est contact@stayfloow.com ou fleet@..., on envoie au mail configuré par défaut ou fourni
  await triggerEmail(hostEmail, partnerTpl.subject, partnerTpl.body);

  // --- ENVOI ADMIN ---
  const adminTpl = await getEmailTemplate("adminBookingNotification", {
    reservationNumber,
    itemName,
    itemType,
    hostName,
    hostEmail,
    customerName,
    customerEmail,
    detailsHtml
  });
  await triggerEmail(adminEmail, adminTpl.subject, adminTpl.body);

  return { success: true };
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

/**
 * Envoie un email d'invitation à un prospect (Outbound B2B).
 */
export const sendProspectEmail = async ({ prospectName, prospectEmail, sourcePlatform }: { prospectName: string, prospectEmail: string, sourcePlatform: string }) => {
  const { subject, body } = await getEmailTemplate("prospectInvitation", { prospectName, sourcePlatform });
  return triggerEmail(prospectEmail, subject, body);
};

/**
 * Prévient l'admin (stayflow2025@gmail.com) d'une nouvelle annonce.
 */
export const sendAdminNewListingNotification = async (data: any) => {
  const adminEmail = "stayflow2025@gmail.com";
  const { subject, body } = await getEmailTemplate("adminListingNotification", data);
  return triggerEmail(adminEmail, subject, body);
};

/**
 * Informe le partenaire du résultat de la validation de son annonce.
 */
export const sendPartnerListingStatusUpdate = async (data: any) => {
  const statusLabels: Record<string, string> = {
    'approved': 'Approuvée (En ligne) ✅',
    'rejected': 'Refusée ❌',
    'on_hold': 'En attente de modifications 📝'
  };

  const { subject, body } = await getEmailTemplate("partnerListingUpdate", {
    ...data,
    statusLabel: statusLabels[data.status] || data.status
  });

  return triggerEmail(data.hostEmail, subject, body);
};

