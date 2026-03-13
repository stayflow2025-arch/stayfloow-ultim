# StayFloow.com - Plateforme de Réservation en Afrique

Ceci est l'application officielle de StayFloow.com, construite avec NextJS, React, et Firebase.

## Configuration du Domaine (Cloudflare)
Pour que le site fonctionne sur https://www.stayfloow.com, suivez ces étapes :

### 1. Nettoyage Firebase
Dans la console Firebase (Hosting ou App Hosting), supprimez tout domaine "Inactif" qui pointe vers `.pages.dev`. Recréez le domaine en choisissant **Héberger (Pointer vers le site)** et non Rediriger.

### 2. Records DNS dans Cloudflare
Configurez vos enregistrements DNS comme suit (Proxy : **Gris / DNS Only**) :

| Type | Nom | Valeur / Cible | Note |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `35.219.200.13` | IP Firebase App Hosting |
| **CNAME** | `www` | `stayfloow.com` | Lie le sous-domaine au domaine racine |
| **TXT** | `www` | `fah-claim=002-02-7224e988-9c8a-457f-8d2d-121f54080e8f` | Validation de propriété |
| **CNAME** | `_acme-challenge_4frcmtvf5fdmdejs` | `11ddb6dc-532b-4399-817d-4b0afb87c47b.18.authorize.certificatemanager.goog.` | Certificat SSL |

## Fonctionnalités
- Réservation d'hébergements (Hôtels, Riads, Villas)
- Location de voitures avec synchronisation des dates de recherche
- Circuits touristiques en Algérie et Égypte
- Support client assisté par Intelligence Artificielle (Genkit)
- Portail Partenaire pour la gestion des annonces
