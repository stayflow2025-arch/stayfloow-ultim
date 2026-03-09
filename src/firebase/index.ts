'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase Singleton robuste utilisant globalThis.
 * Empêche les erreurs d'assertion interne (ca9) dans Next.js en garantissant 
 * qu'une seule instance de chaque service est créée par session.
 */

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuthInstance(app),
      firestore: getFirestoreInstance(app),
    };
  }

  const g = globalThis as any;

  if (!g._firebaseApp) {
    g._firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!g._firebaseAuth) {
    g._firebaseAuth = getAuthInstance(g._firebaseApp);
  }

  if (!g._firebaseFirestore) {
    g._firebaseFirestore = getFirestoreInstance(g._firebaseApp);
  }

  return {
    firebaseApp: g._firebaseApp,
    auth: g._firebaseAuth,
    firestore: g._firebaseFirestore,
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
