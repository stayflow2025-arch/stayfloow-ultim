'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * Interface pour le cache global permettant de survivre au Hot Module Replacement (HMR)
 * durant le développement Next.js et de garantir des singletons.
 */
interface GlobalFirebase {
  __firebaseApp?: FirebaseApp;
  __firebaseAuth?: Auth;
  __firebaseFirestore?: Firestore;
}

// Accès sécurisé au cache global sur le client
const getGlobalStore = (): GlobalFirebase => {
  if (typeof window !== 'undefined') {
    return window as any;
  }
  return {} as any;
};

/**
 * Initialise les services Firebase de manière stable et unique.
 * Utilise un cache global pour empêcher la double initialisation lors du HMR.
 */
export function initializeFirebase() {
  const store = getGlobalStore();

  // 1. Retourner les instances si déjà présentes dans le cache global (Client-side)
  if (store.__firebaseApp && store.__firebaseAuth && store.__firebaseFirestore) {
    return {
      firebaseApp: store.__firebaseApp,
      auth: store.__firebaseAuth,
      firestore: store.__firebaseFirestore,
    };
  }

  // 2. Initialisation ou récupération de l'App
  const apps = getApps();
  const firebaseApp = apps.length > 0 ? apps[0] : initializeApp(firebaseConfig);

  // 3. Initialisation des services
  const auth = getAuthInstance(firebaseApp);
  const firestore = getFirestoreInstance(firebaseApp);

  // 4. Mise en cache pour les futurs appels sur le client
  if (typeof window !== 'undefined') {
    store.__firebaseApp = firebaseApp;
    store.__firebaseAuth = auth;
    store.__firebaseFirestore = firestore;
  }

  return { firebaseApp, auth, firestore };
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
