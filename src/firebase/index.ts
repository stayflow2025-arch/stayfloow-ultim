'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase Singleton résiliente.
 * Utilise une approche de mise en cache pour éviter les erreurs d'assertion interne (ca9)
 * courantes dans les environnements de développement Next.js avec HMR.
 */

let cachedApp: FirebaseApp | undefined;
let cachedAuth: Auth | undefined;
let cachedFirestore: Firestore | undefined;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuthInstance(app),
      firestore: getFirestoreInstance(app),
    };
  }

  if (!cachedApp) {
    if (getApps().length > 0) {
      cachedApp = getApp();
    } else {
      cachedApp = initializeApp(firebaseConfig);
    }
  }

  if (!cachedAuth) {
    cachedAuth = getAuthInstance(cachedApp);
  }

  if (!cachedFirestore) {
    cachedFirestore = getFirestoreInstance(cachedApp);
  }

  return {
    firebaseApp: cachedApp,
    auth: cachedAuth,
    firestore: cachedFirestore,
  };
}

export function getAuth(): Auth {
  return initializeFirebase().auth;
}

export function getFirestore(): Firestore {
  return initializeFirebase().firestore;
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
