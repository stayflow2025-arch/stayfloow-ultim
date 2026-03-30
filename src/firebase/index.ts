import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase Singleton ultra-robuste.
 * Compatible Client et Serveur (API Routes).
 */

export function initializeFirebase() {
  // Chemin Client (Navigateur)
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

  // Chemin Serveur (SSR / API Routes)
  if (!firebaseConfig.apiKey) {
    return {
      firebaseApp: null as any,
      auth: null as any,
      firestore: null as any,
    };
  }

  // Utiliser un cache global pour le serveur aussi pour éviter les réinitialisations multiples
  const gssr = globalThis as any;
  if (!gssr.__STAYFLOOW_SERVER_FIREBASE__) {
    const ssrApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    gssr.__STAYFLOOW_SERVER_FIREBASE__ = {
      app: ssrApp,
      auth: getAuthInstance(ssrApp),
      firestore: getFirestoreInstance(ssrApp),
    };
  }

  return {
    firebaseApp: gssr.__STAYFLOOW_SERVER_FIREBASE__.app,
    auth: gssr.__STAYFLOOW_SERVER_FIREBASE__.auth,
    firestore: gssr.__STAYFLOOW_SERVER_FIREBASE__.firestore,
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
