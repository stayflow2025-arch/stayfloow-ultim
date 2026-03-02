
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * Interface pour le cache global permettant de survivre au Hot Module Replacement (HMR)
 * durant le développement Next.js.
 */
interface GlobalFirebase {
  __firebaseApp?: FirebaseApp;
  __firebaseAuth?: Auth;
  __firebaseFirestore?: Firestore;
}

const globalWithFirebase = globalThis as unknown as GlobalFirebase;

/**
 * Initialise Firebase de manière stable et unique.
 * Utilise globalThis pour garantir qu'une seule instance de chaque service existe,
 * même lors des rechargements à chaud (HMR), évitant ainsi l'erreur "Unexpected state (ID: ca9)".
 */
export function initializeFirebase() {
  // 1. Vérification du cache global (Client-side uniquement)
  if (typeof window !== 'undefined') {
    if (
      globalWithFirebase.__firebaseApp &&
      globalWithFirebase.__firebaseAuth &&
      globalWithFirebase.__firebaseFirestore
    ) {
      return {
        firebaseApp: globalWithFirebase.__firebaseApp,
        auth: globalWithFirebase.__firebaseAuth,
        firestore: globalWithFirebase.__firebaseFirestore,
      };
    }
  }

  // 2. Initialisation ou récupération de l'App
  let app: FirebaseApp;
  const apps = getApps();
  if (apps.length > 0) {
    app = apps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  // 3. Initialisation des services
  const auth = getAuthInstance(app);
  const firestore = getFirestoreInstance(app);

  // 4. Mise en cache pour les futurs appels sur le client
  if (typeof window !== 'undefined') {
    globalWithFirebase.__firebaseApp = app;
    globalWithFirebase.__firebaseAuth = auth;
    globalWithFirebase.__firebaseFirestore = firestore;
  }

  return { firebaseApp: app, auth, firestore };
}

/**
 * Helpers pour obtenir les instances de manière sécurisée.
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
