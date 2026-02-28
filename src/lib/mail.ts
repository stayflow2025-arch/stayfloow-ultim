'use server';

/**
 * @fileOverview Système d'envoi d'emails StayFloow.
 * Simulation fiable pour environnement local et build sans erreurs.
 */

const simulateEmailSend = async (to: string, subject: string, body: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log("-----------------------------------------");
  console.log(`[SIMULATED EMAIL] To: ${to}`);
  console.log(`[SUBJECT]: ${subject}`);
  console.log("-----------------------------------------");
  return { success: true, data: { id: `sim_${Date.now()}` } };
};

export const sendWelcomeEmail = async ({
  hostName,
  submissionType,
  submissionName,
  hostEmail,
  referenceNumber,
}: any) => {
  const { getEmailTemplate } = await import("./email-templates");
  const setupToken = `partner-setup-${Date.now()}`;
  const setupLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}/auth/reset-password?token=${setupToken}`;

  const { subject, body } = await getEmailTemplate("partnerWelcome", {
    hostName,
    submissionType,
    submissionName,
    referenceNumber,
    setupLink,
  });

  return simulateEmailSend(hostEmail, subject, body);
};

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
  const { getEmailTemplate } = await import("./email-templates");

  let detailsHtml = "";
  if (bookingDetails.startDate) {
    detailsHtml += `<p><strong>Début :</strong> ${new Date(bookingDetails.startDate).toLocaleDateString("fr-FR")}</p>`;
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
    itemType,
  });

  return simulateEmailSend(customerEmail, subject, body);
};

export const sendPasswordResetEmail = async ({
  userEmail,
  userType,
}: { userEmail: string; userType: string }) => {
  const { getEmailTemplate } = await import("./email-templates");
  const resetToken = "reset-" + Math.random().toString(36).substring(7);
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9002"}/auth/reset-password?token=${resetToken}`;

  const { subject, body } = await getEmailTemplate("passwordReset", { resetLink });
  return simulateEmailSend(userEmail, subject, body);
};
