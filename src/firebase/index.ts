
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase Singleton ultra-robuste.
 * Utilise un cache global nommé pour garantir qu'aucune instance n'est recréée,
 * éliminant définitivement l'erreur INTERNAL ASSERTION FAILED (ID: ca9).
 */

export function initializeFirebase() {
  // Gestion du Singleton côté client via globalThis pour persister entre les rechargements HMR
  if (typeof window !== 'undefined') {
    const g = globalThis as any;
    
    if (!g.__STAYFLOOW_FIREBASE_INSTANCE__) {
      try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        g.__STAYFLOOW_FIREBASE_INSTANCE__ = {
          app,
          auth: getAuthInstance(app),
          firestore: getFirestoreInstance(app),
        };
      } catch (e) {
        // Fallback de sécurité en cas d'initialisation concurrente
        const app = getApp();
        g.__STAYFLOOW_FIREBASE_INSTANCE__ = {
          app,
          auth: getAuthInstance(app),
          firestore: getFirestoreInstance(app),
        };
      }
    }
    
    return {
      firebaseApp: g.__STAYFLOOW_FIREBASE_INSTANCE__.app,
      auth: g.__STAYFLOOW_FIREBASE_INSTANCE__.auth,
      firestore: g.__STAYFLOOW_FIREBASE_INSTANCE__.firestore,
    };
  }

  // SSR Path (Initialisation simple pour le rendu serveur)
  const ssrApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  return {
    firebaseApp: ssrApp,
    auth: getAuthInstance(ssrApp),
    firestore: getFirestoreInstance(ssrApp),
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
