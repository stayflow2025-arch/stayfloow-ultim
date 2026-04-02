'use server';

import { adminDb } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * @fileOverview Server Action pour la création d'annonces par les partenaires.
 * Utilise le SDK Admin pour bypasser les Security Rules (nécessaire pour les guests).
 */

interface ListingData {
  id: string;
  ownerId: string;
  category: string;
  status: string;
  partnerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  location: { address: string };
  details: any;
  price: number;
  currency: string;
  photos: string[];
  rating: number;
  isBoosted?: boolean;
  useOccupancyPricing?: boolean;
  occupancyPrices?: Record<string, number>;
  createdAt: string;
}

/**
 * Crée une nouvelle annonce dans Firestore via le SDK Admin.
 * @param data Les données de l'annonce à créer.
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function createListingAction(data: ListingData) {
  try {
    if (!data.id) throw new Error("ID de l'annonce manquant");

    // Référence au document dans la collection 'listings'
    const docRef = adminDb.collection('listings').doc(data.id);

    // Enregistrement des données
    await docRef.set({
      ...data,
      serverTimestamp: FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error creating listing via Admin SDK:", error);
    return { 
      success: false, 
      error: error.message || "Erreur interne lors de la création de l'annonce" 
    };
  }
}
