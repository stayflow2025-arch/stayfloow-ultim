'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase robuste pour Next.js (Singleton Pattern).
 * Utilise globalThis pour persister les instances entre les rechargements HMR en développement,
 * ce qui résout définitivement l'erreur assertion failed (ID: ca9).
 */

declare global {
  var __firebaseApp: FirebaseApp | undefined;
  var __firebaseAuth: Auth | undefined;
  var __firebaseFirestore: Firestore | undefined;
}

export function initializeFirebase() {
  // Initialisation SSR (Serveur)
  if (typeof window === 'undefined') {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuthInstance(app),
      firestore: getFirestoreInstance(app),
    };
  }

  // Initialisation Client (Singleton stable)
  // On utilise un cache global pour éviter de recréer les instances Firestore lors du HMR
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
