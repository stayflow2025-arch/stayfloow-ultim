
/**
 * @fileOverview Templates HTML premium pour StayFloow.com
 * Design épuré, mobile-responsive et aux couleurs de la marque.
 */

export type EmailTemplateName = 
  | 'partnerWelcome' 
  | 'registrationWelcome'
  | 'bookingConfirmation' 
  | 'newBookingNotification' 
  | 'passwordReset';

const BRAND_COLOR = "#10B981";
const ACCENT_COLOR = "#39FF14";

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155; margin: 0; padding: 0; background-color: #f8fafc; }
    .wrapper { width: 100%; table-layout: fixed; background-color: #f8fafc; padding-bottom: 40px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; margin-top: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { padding: 40px 20px; text-align: center; background-color: ${BRAND_COLOR}; }
    .content { padding: 40px; }
    .footer { text-align: center; padding: 30px; font-size: 12px; color: #94a3b8; }
    .btn { display: inline-block; padding: 16px 40px; background-color: ${BRAND_COLOR}; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 800; margin: 30px 0; text-transform: uppercase; font-size: 14px; letter-spacing: 0.5px; }
    .card { background: #f1f5f9; border-radius: 16px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0; }
    h1 { color: #0f172a; font-size: 24px; font-weight: 800; margin-bottom: 20px; letter-spacing: -0.5px; }
    p { margin-bottom: 15px; font-size: 16px; color: #475569; }
    strong { color: #0f172a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h2 style="color: #ffffff; font-weight: 900; letter-spacing: -1.5px; font-size: 32px; margin: 0;">StayFloow<span style="color: ${ACCENT_COLOR}">.com</span></h2>
      </div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        <p style="margin-bottom: 5px;">&copy; ${new Date().getFullYear()} StayFloow.com — Votre partenaire voyage en Afrique.</p>
        <p>Service Client • Hydra, Alger, Algérie</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const getEmailTemplate = async (name: EmailTemplateName, data: any): Promise<{ subject: string; body: string }> => {
  switch (name) {
    case 'registrationWelcome':
      return {
        subject: `Bienvenue chez StayFloow, ${data.userName} ! 🌍`,
        body: baseLayout(`
          <h1>Bienvenue dans l'aventure ! 😍</h1>
          <p>Bonjour <strong>${data.userName}</strong>,</p>
          <p>Nous sommes ravis de vous compter parmi nos nouveaux membres. StayFloow est conçu pour vous offrir les meilleures expériences de voyage en Algérie, au Maroc et en Égypte.</p>
          <div class="card">
            <p style="margin-bottom: 10px;"><strong>Ce que vous pouvez faire maintenant :</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Réserver des Riads et Villas d'exception.</li>
              <li>Louer un véhicule pour vos déplacements.</li>
              <li>Participer à des circuits guidés inoubliables.</li>
            </ul>
          </div>
          <div style="text-align: center;">
            <a href="https://www.stayfloow.com" class="btn">Explorer les offres</a>
          </div>
          <p>À très bientôt sur notre plateforme !</p>
          <p>L'équipe StayFloow 🌍</p>
        `)
      };

    case 'partnerWelcome':
      return {
        subject: `Dossier reçu ! Bienvenue chez StayFloow Pro 🚀 [Réf: ${data.referenceNumber}]`,
        body: baseLayout(`
          <h1>Bienvenue à bord, ${data.hostName} ! 🤝</h1>
          <p>Votre demande d'enregistrement pour <strong>${data.submissionName}</strong> (${data.submissionType}) a bien été réceptionnée.</p>
          
          <div class="card">
            <p><strong>Prochaine étape :</strong> Nos experts vérifient votre annonce pour garantir une qualité optimale à nos voyageurs. Vous recevrez une notification dès que votre offre sera en ligne.</p>
            <p>En attendant, vous pouvez compléter votre profil sur votre tableau de bord.</p>
          </div>

          <div style="text-align: center;">
            <a href="${data.setupLink}" class="btn">Mon Espace Partenaire</a>
          </div>

          <p>Merci de votre confiance.</p>
          <p>L'équipe StayFloow Business 🌍</p>
        `)
      };

    case 'bookingConfirmation':
      return {
        subject: `Réservation Confirmée ! ✅ - ${data.itemName}`,
        body: baseLayout(`
          <h1>C'est confirmé, préparez vos valises ! ✈️</h1>
          <p>Bonjour ${data.customerName}, votre réservation pour <strong>${data.itemName}</strong> est validée.</p>
          
          <div class="card">
            <p style="margin-bottom: 5px;"><strong>Référence :</strong> #${data.reservationNumber}</p>
            ${data.detailsHtml}
          </div>

          <p><strong>Contact de votre hôte :</strong></p>
          <p style="font-size: 14px; color: #64748b;">
            ${data.hostName}<br>
            📞 ${data.hostPhone}<br>
            ✉️ ${data.hostEmail}
          </p>

          <p style="margin-top: 20px;">Retrouvez tous les détails de votre voyage dans votre espace client.</p>
          <div style="text-align: center;">
            <a href="https://www.stayfloow.com/profile/bookings" class="btn">Mes Réservations</a>
          </div>
        `)
      };

    case 'passwordReset':
      return {
        subject: `Réinitialisation de votre mot de passe StayFloow 🔐`,
        body: baseLayout(`
          <h1>Besoin d'un nouveau mot de passe ?</h1>
          <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte StayFloow.com.</p>
          <p>Cliquez sur le bouton ci-dessous pour en choisir un nouveau. Ce lien est valable pendant 1 heure.</p>
          <div style="text-align: center;">
            <a href="${data.resetLink}" class="btn">Réinitialiser mon mot de passe</a>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
        `)
      };

    default:
      return { subject: "Message de StayFloow.com", body: "Contenu non disponible." };
  }
};
