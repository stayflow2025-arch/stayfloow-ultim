'use server';

import { Resend } from "resend";
import { getEmailTemplate } from "./email-templates";

/**
 * @fileOverview Système d'envoi d'emails StayFloow via Resend API.
 * Géré via Server Actions pour éviter les erreurs de bundle côté client.
 */

// ------------------------------
// LAZY INITIALIZATION (ANTI-CRASH)
// ------------------------------
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  // Empêche le crash pendant le build si la clé est absente
  return new Resend(apiKey || "re_dummy_key_for_build");
};

// ------------------------------
// HELPERS
// ------------------------------
const getSenderDetails = () => {
  return { 
    senderName: "StayFloow.com", 
    senderEmail: "onboarding@resend.dev" // À remplacer par contact@stayfloow.com après validation du domaine
  };
};

/**
 * Redirige tous les emails vers l'adresse de test en mode développement
 * conformément à la demande de l'utilisateur.
 */
const getRecipientEmail = (intendedRecipient: string) => {
  console.log(`[MAIL] Originally intended for ${intendedRecipient}. Redirecting to admin for testing.`);
  return "stayflow2025@gmail.com";
};

// ------------------------------
// 1. WELCOME EMAIL (Onboarding Partenaire)
// ------------------------------
interface WelcomeEmailProps {
  hostName: string;
  submissionType: "propriété" | "véhicule" | "circuit";
  submissionName: string;
  hostEmail: string;
  referenceNumber: string;
  cleaningServiceRequested?: boolean;
}

export const sendWelcomeEmail = async ({
  hostName,
  submissionType,
  submissionName,
  hostEmail,
  referenceNumber,
  cleaningServiceRequested,
}: WelcomeEmailProps) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <${senderEmail}>`;

  const setupToken = `partner-setup-${Date.now()}`;
  const setupLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}/auth/reset-password?token=${setupToken}`;

  const { subject, body } = await getEmailTemplate("partnerWelcome", {
    hostName,
    submissionType: submissionType === "circuit" ? "circuit / activité" : submissionType,
    submissionName,
    referenceNumber,
    setupLink,
    cleaningServiceRequested: !!cleaningServiceRequested,
  });

  const toAddress = getRecipientEmail(hostEmail);

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      html: body,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};

// ------------------------------
// 2. BOOKING CONFIRMATION (Pour le Client)
// ------------------------------
interface BookingConfirmationEmailProps {
  customerName: string;
  customerEmail: string;
  reservationNumber: string;
  itemName: string;
  itemType: "hébergement" | "véhicule" | "circuit";
  hostName: string;
  hostEmail: string;
  hostPhone: string;
  bookingDetails: {
    startDate?: string | null;
    endDate?: string | null;
    duration?: number;
    participants?: number;
    totalPrice?: number;
  };
}

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
}: BookingConfirmationEmailProps) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <booking@resend.dev>`;

  const toAddress = getRecipientEmail(customerEmail);

  let detailsHtml = "";
  if (bookingDetails.startDate) {
    const label = itemType === "circuit" ? "Date de départ" : "Arrivée";
    detailsHtml += `<p><strong>${label} :</strong> ${new Date(bookingDetails.startDate).toLocaleDateString("fr-FR")}</p>`;
  }
  if (bookingDetails.endDate) {
    detailsHtml += `<p><strong>Fin/Départ :</strong> ${new Date(bookingDetails.endDate).toLocaleDateString("fr-FR")}</p>`;
  }
  if (bookingDetails.participants) {
    detailsHtml += `<p><strong>Nombre de personnes :</strong> ${bookingDetails.participants}</p>`;
  }
  if (bookingDetails.totalPrice) {
    detailsHtml += `<p><strong>Montant Total :</strong> ${bookingDetails.totalPrice.toLocaleString('fr-DZ')} DZD</p>`;
  }

  const { subject, body } = await getEmailTemplate("bookingConfirmation", {
    customerName,
    reservationNumber,
    itemName,
    detailsHtml,
    hostName,
    hostEmail,
    hostPhone,
    itemType: itemType === "hébergement" ? "hôte" : itemType === "véhicule" ? "loueur" : "guide",
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: subject.replace("{{reservationNumber}}", reservationNumber),
      html: body,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};

// ------------------------------
// 3. NEW BOOKING NOTIFICATION (Pour le Partenaire)
// ------------------------------
interface NewBookingNotificationProps {
  partnerName: string;
  partnerEmail: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationNumber: string;
  itemName: string;
  bookingDetails: {
    startDate: string | null;
    endDate: string | null;
    duration?: number;
    participants?: number;
  };
}

export const sendNewBookingNotificationEmail = async ({
  partnerName,
  partnerEmail,
  customerName,
  customerEmail,
  customerPhone,
  reservationNumber,
  itemName,
  bookingDetails,
}: NewBookingNotificationProps) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <partners@resend.dev>`;

  const toAddress = getRecipientEmail(partnerEmail);

  // Génération du fichier ICS pour le calendrier
  const formatForICS = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  let attachments: any[] = [];
  let detailsHtml = "";

  if (bookingDetails.startDate) {
    const calendarStartDate = formatForICS(bookingDetails.startDate);
    const calendarEndDate = bookingDetails.endDate ? formatForICS(bookingDetails.endDate) : calendarStartDate;

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//StayFloow//Booking Calendar//FR",
      "BEGIN:VEVENT",
      `UID:${reservationNumber}@stayfloow.com`,
      `DTSTAMP:${formatForICS(new Date().toISOString())}`,
      `DTSTART;VALUE=DATE:${calendarStartDate.substring(0, 8)}`,
      `DTEND;VALUE=DATE:${calendarEndDate.substring(0, 8)}`,
      `SUMMARY:StayFloow: ${customerName} - ${itemName}`,
      `DESCRIPTION:Réservation #${reservationNumber}\\nClient: ${customerName}\\nContact: ${customerEmail}.`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    attachments.push({
      filename: `reservation-${reservationNumber}.ics`,
      content: Buffer.from(icsContent).toString('base64'),
    });

    detailsHtml += `<p><strong>Période :</strong> du ${new Date(bookingDetails.startDate).toLocaleDateString("fr-FR")}`;
    if (bookingDetails.endDate) detailsHtml += ` au ${new Date(bookingDetails.endDate).toLocaleDateString("fr-FR")}`;
    detailsHtml += `</p>`;
  }

  const { subject, body } = await getEmailTemplate("newBookingNotification", {
    partnerName,
    itemName,
    reservationNumber,
    detailsHtml,
    customerName,
    customerEmail,
    customerPhone,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject: subject.replace("{{itemName}}", itemName).replace("{{reservationNumber}}", reservationNumber),
      html: body,
      attachments,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};

// ------------------------------
// 4. FAVORITE REMINDER (Retargeting)
// ------------------------------
export const sendFavoriteReminderEmail = async ({
  customerName,
  customerEmail,
  property,
}: { customerName: string; customerEmail: string; property: any }) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <reminders@resend.dev>`;

  const toAddress = getRecipientEmail(customerEmail);

  const { subject, body } = await getEmailTemplate("favoriteReminder", {
    customerName,
    propertyName: property.name,
    propertyDescription: property.description,
    propertyImage: property.images?.[0] || "https://picsum.photos/seed/stay/800/600",
    propertyUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}/properties/${property.id}`,
  });

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      html: body,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};

// ------------------------------
// 5. ADMIN NOTIFICATION
// ------------------------------
export const sendNewSubmissionAdminNotification = async (data: any) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <alerts@resend.dev>`;

  const toAddress = "stayflow2025@gmail.com";
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}/admin/validate`;

  const { subject, body } = await getEmailTemplate("newSubmissionAdminNotification", {
    ...data,
    adminUrl,
  });

  try {
    const { data: res, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      html: body,
    });

    if (error) return { success: false, error };
    return { success: true, data: res };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};

// ------------------------------
// 6. PASSWORD RESET
// ------------------------------
export const sendPasswordResetEmail = async ({
  userEmail,
  userType,
}: { userEmail: string; userType: "admin" | "partner" | "customer" }) => {
  const resend = getResend();
  const { senderName, senderEmail } = getSenderDetails();
  const fromAddress = `${senderName} <security@resend.dev>`;

  const resetToken = "reset-" + Math.random().toString(36).substring(7);
  const page = userType === "customer" ? "/auth/reset-password" : "/auth/reset-password"; // Adapté au projet

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}${page}?token=${resetToken}`;

  const { subject, body } = await getEmailTemplate("passwordReset", { resetLink });

  const toAddress = getRecipientEmail(userEmail);

  try {
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      subject,
      html: body,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (error) {
    return { success: false, error: { message: (error as Error).message } };
  }
};