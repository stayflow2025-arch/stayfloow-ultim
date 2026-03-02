'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation stable de Firebase pour Next.js.
 * Utilise globalThis pour persister les instances entre les rechargements HMR en développement,
 * évitant ainsi les erreurs d'assertion interne de Firestore (ID: ca9).
 */

declare global {
  var __firebaseApp: FirebaseApp | undefined;
  var __firebaseAuth: Auth | undefined;
  var __firebaseFirestore: Firestore | undefined;
}

export function initializeFirebase() {
  // Côté serveur (SSR), on ne met rien en cache globale pour éviter les fuites de mémoire
  if (typeof window === 'undefined') {
    const apps = getApps();
    const app = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuthInstance(app),
      firestore: getFirestoreInstance(app),
    };
  }

  // Côté client avec protection HMR stricte via globalThis
  // Cela garantit qu'une seule instance de chaque service existe par cycle de vie de la page
  if (!globalThis.__firebaseApp) {
    const apps = getApps();
    globalThis.__firebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);
  }

  if (!globalThis.__firebaseAuth) {
    globalThis.__firebaseAuth = getAuthInstance(globalThis.__firebaseApp);
  }

  if (!globalThis.__firebaseFirestore) {
    globalThis.__firebaseFirestore = getFirestoreInstance(globalThis.__firebaseApp);
  }

  return {
    firebaseApp: globalThis.__firebaseApp,
    auth: globalThis.__firebaseAuth,
    firestore: globalThis.__firebaseFirestore,
  };
}

/**
 * Helpers pour obtenir les instances de manière sécurisée et stable.
 */
export function getAuth(): Auth {
  return initializeFirebase().auth;
}

export function getFirestore(): Firestore {
  return initializeFirebase().firestore;
}

// Ré-exports des utilitaires et hooks
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
