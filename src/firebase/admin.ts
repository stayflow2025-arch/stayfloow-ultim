import 'server-only';
import * as admin from 'firebase-admin';
import { getApps, initializeApp as adminInitializeApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * @fileOverview Initialisation du SDK Admin Firebase pour bypasser les Security Rules en SSR/API.
 */

let adminApp: App;

if (getApps().length === 0) {
  adminApp = adminInitializeApp({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "studio-6933176808-a0512",
  });
} else {
  adminApp = getApps()[0];
}

let adminDb: any = null;
let adminAuth: any = null;

try {
  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
} catch (error) {
  console.error("Firebase Admin SDK initialization error:", error);
}

export { adminDb, adminAuth, adminApp };
