import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-03-25.dahlia'
  });

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquant' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn("WEBHOOK STRIPE : STRIPE_WEBHOOK_SECRET n'est pas configuré.");
    return NextResponse.json({ error: 'Webhook secret non configuré' }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (!bookingId) {
      return NextResponse.json({ result: 'Ignored, no bookingId' });
    }

    try {
      // Utilisation du SDK Admin pour outrepasser les Security Rules
      const { getAdminDb } = await import('@/firebase/admin');
      const { sendBookingConfirmationEmail } = await import('@/lib/mail');

      const db = getAdminDb();
      if (!db) throw new Error("Service Admin non disponible");

      const bookingRef = db.collection('bookings').doc(bookingId);
      const bookingDoc = await bookingRef.get();

      if (!bookingDoc.exists) {
        return NextResponse.json({ error: 'Booking non trouvé' }, { status: 404 });
      }

      const booking = bookingDoc.data()!;
      
      await bookingRef.update({
        status: 'approved',
        paymentIntentId: session.payment_intent as string | undefined,
        paidAt: new Date().toISOString()
      });

      await sendBookingConfirmationEmail({
        customerName: booking.customerName || "Client",
        customerEmail: booking.customerEmail || session.customer_details?.email || "N/A",
        reservationNumber: booking.reservationNumber || bookingId,
        itemName: booking.itemName || "Réservation StayFloow",
        itemType: booking.itemType || "hébergement",
        hostName: "Support StayFloow",
        hostEmail: "stayflow2025@gmail.com",
        hostPhone: "+213 550 00 00 00",
        bookingDetails: {
          startDate: booking.startDate,
          endDate: booking.endDate,
          nights: booking.nights,
          totalPrice: booking.totalPrice,
          depositAmount: booking.depositPaid,
          pickupLocation: booking.pickupLocation
        }
      });
      
    } catch (error) {
      console.error('Erreur Webhook:', error);
      return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
