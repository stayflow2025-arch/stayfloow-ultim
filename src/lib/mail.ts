
/**
 * @fileOverview Simulateur d'envoi d'emails pour les réservations StayFloow.com
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
  console.log("SIMULATION EMAIL ENVOYÉ À:", data.customerEmail);
  console.log("DÉTAILS DE LA RÉSERVATION:", data);
  // Simule un délai réseau
  return new Promise((resolve) => setTimeout(resolve, 800));
}
