# StayFloow.com - Plateforme de Réservation en Afrique

Ceci est l'application officielle de StayFloow.com, construite avec NextJS, React, et Firebase.

## Configuration du Domaine (Cloudflare)
Pour que le site fonctionne sur https://www.stayfloow.com, configurez vos enregistrements DNS dans Cloudflare comme suit (Proxy : **Gris / DNS Only**) :

### Records DNS Actuels (Firebase App Hosting)

| Type | Nom | Valeur / Cible | Note |
| :--- | :--- | :--- | :--- |
| **A** | `www` | `35.219.200.6` | IP Firebase App Hosting (OK) |
| **CNAME** | `_acme-challenge_ch6d4t7ytio3ccze.www` | `8ab470c1-fa77-4130-a395-84ab396ec8be.16.authorize.certificatemanager.goog.` | Certificat SSL (HTTPS) |

### Étapes à suivre dans Cloudflare :
1. Allez dans l'onglet **DNS** de votre domaine `stayfloow.com`.
2. Assurez-vous qu'il n'y a pas d'autre record `www`.
3. Ajoutez le record **A** pour `www` pointant vers `35.219.200.6`.
4. Ajoutez le record **CNAME** pour le challenge SSL ACME.
5. **IMPORTANT** : Vérifiez que les nuages sont **GRIS** (DNS Only) pour ces deux enregistrements.
6. Cliquez sur **"Valider les enregistrements"** dans la console Firebase.

*Note : Ignorez les suggestions de Cloudflare Pages (stayfloow.pages.dev), nous utilisons Firebase App Hosting.*

## Fonctionnalités
- Réservation d'hébergements (Hôtels, Riads, Villas)
- Location de voitures avec synchronisation des dates de recherche
- Circuits touristiques en Algérie et Égypte
- Support client assisté par Intelligence Artificielle (Genkit)
- Portail Partenaire pour la gestion des annonces
