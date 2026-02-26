
/**
 * @fileOverview Simulateur d'envoi d'emails pour StayFloow.com
 */

export async function sendBookingConfirmationEmail(data: {
  customerName: string;
  customerEmail: string;
  reservationNumber: string;
  itemName: string;
  itemType: string;
  hostName: string;
  hostEmail: string;
  hostPhone: string;
  bookingDetails: any;
}) {
  console.log("SIMULATION EMAIL DE RÉSERVATION ENVOYÉ À:", data.customerEmail);
  return new Promise((resolve) => setTimeout(resolve, 800));
}

export async function sendPasswordResetEmail(data: { userEmail: string; userType: string }) {
  console.log("SIMULATION EMAIL RÉINITIALISATION ENVOYÉ À:", data.userEmail);
  return new Promise((resolve) => setTimeout(resolve, 800));
}

export async function sendFavoriteReminderEmail(data: { customerName: string; customerEmail: string; property: any }) {
  console.log("SIMULATION EMAIL FAVORIS ENVOYÉ À:", data.userEmail);
  console.log("BIEN CONCERNÉ:", data.property.name);
  return new Promise((resolve) => setTimeout(resolve, 800));
}
