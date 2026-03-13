# StayFloow.com - Plateforme de Réservation en Afrique

Ceci est l'application officielle de StayFloow.com, construite avec NextJS, React, et Firebase.

## Configuration du Domaine
Le site est configuré pour fonctionner sur :
- **Domaine principal** : https://stayfloow.com
- **Sous-domaine** : https://www.stayfloow.com

## État du déploiement
- **Hébergement** : Firebase App Hosting
- **DNS & CDN** : Cloudflare (Configuré en DNS Only pour la validation SSL initiale)
- **Base de données** : Cloud Firestore
- **Authentification** : Firebase Auth

## Configuration DNS requise (Cloudflare)
Pour valider le domaine dans Firebase, les enregistrements suivants doivent être présents :

| Type | Nom | Valeur / Cible | Proxy |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `35.219.200.13` | Gris (DNS Only) |
| **CNAME** | `www` | `stayfloow.com` | Gris (DNS Only) |
| **TXT** | `www` | `fah-claim=002-02-7224e988-9c8a-457f-8d2d-121f54080e8f` | N/A |
| **CNAME** | `_acme-challenge_4frcmtvf5fdmdejs` | `11ddb6dc-532b-4399-817d-4b0afb87c47b.18.authorize.certificatemanager.goog.` | Gris (DNS Only) |

## Fonctionnalités
- Réservation d'hébergements (Hôtels, Riads, Villas)
- Location de voitures avec synchronisation des dates de recherche
- Circuits touristiques en Algérie et Égypte
- Support client assisté par Intelligence Artificielle (Genkit)
- Portail Partenaire pour la gestion des annonces
