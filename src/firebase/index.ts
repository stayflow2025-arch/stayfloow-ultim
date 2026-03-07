'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Initialisation Firebase Singleton ultra-résiliente.
 * Utilise globalThis pour s'assurer que les instances persistent entre les cycles HMR
 * en développement, évitant l'erreur "INTERNAL ASSERTION FAILED (ID: ca9)".
 */

const _global = (typeof window !== 'undefined' ? window : global) as any;

export function initializeFirebase() {
  // Côté serveur : on retourne des instances fraîches ou l'app existante
  if (typeof window === 'undefined') {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    return {
      firebaseApp: app,
      auth: getAuthInstance(app),
      firestore: getFirestoreInstance(app),
    };
  }

  // Côté client : Gestion du singleton via l'objet global
  if (!_global.__FIREBASE_APP__) {
    if (getApps().length > 0) {
      _global.__FIREBASE_APP__ = getApp();
    } else {
      _global.__FIREBASE_APP__ = initializeApp(firebaseConfig);
    }
  }

  if (!_global.__FIREBASE_AUTH__) {
    _global.__FIREBASE_AUTH__ = getAuthInstance(_global.__FIREBASE_APP__);
  }

  if (!_global.__FIREBASE_FIRESTORE__) {
    _global.__FIREBASE_FIRESTORE__ = getFirestoreInstance(_global.__FIREBASE_APP__);
  }

  return {
    firebaseApp: _global.__FIREBASE_APP__ as FirebaseApp,
    auth: _global.__FIREBASE_AUTH__ as Auth,
    firestore: _global.__FIREBASE_FIRESTORE__ as Firestore,
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
