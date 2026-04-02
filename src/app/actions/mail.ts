"use server";

import * as mail from "@/lib/mail";

/**
 * @fileOverview Server Actions pour l'envoi d'emails.
 * Ces fonctions peuvent être appelées depuis des composants clients ("use client").
 */

export async function sendRegistrationWelcomeEmailAction(params: { userName: string, userEmail: string }) {
  return await mail.sendRegistrationWelcomeEmail(params);
}

export async function sendWelcomeEmailAction(params: any) {
  return await mail.sendWelcomeEmail(params);
}

export async function sendBookingConfirmationEmailAction(params: any) {
  return await mail.sendBookingConfirmationEmail(params);
}

export async function sendPasswordResetEmailAction(params: { userEmail: string; userType?: string }) {
  return await mail.sendPasswordResetEmail(params);
}

export async function sendProspectEmailAction(params: { prospectName: string, prospectEmail: string, sourcePlatform: string }) {
  return await mail.sendProspectEmail(params);
}

export async function sendAdminNewListingNotificationAction(params: any) {
  return await mail.sendAdminNewListingNotification(params);
}

export async function sendPartnerListingStatusUpdateAction(params: any) {
  return await mail.sendPartnerListingStatusUpdate(params);
}
