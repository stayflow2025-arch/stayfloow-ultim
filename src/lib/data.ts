/**
 * @fileOverview Données mockées pour les circuits et établissements de StayFloow.com
 */

export type Property = {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  description: string;
  images: string[];
  amenities: string[];
  type: string;
  stars?: number;
  reviewsCount?: number;
  meals?: string[];
  isBoosted?: boolean;
  isWeekendOffer?: boolean;
  isHighDemand?: boolean;
};

export const properties: Property[] = [
  { 
    id: "prop-1", 
    name: "Riad Dar Al-Andalus", 
    rating: 9.8, 
    location: "Fès, Maroc",
    price: 12500,
    description: "Niché au cœur de la médina, ce riad historique offre une expérience immersive unique. Entièrement restauré par des artisans locaux.",
    images: ["https://picsum.photos/seed/riad1/800/600", "https://picsum.photos/seed/riad2/800/600"],
    amenities: ["WiFi gratuit", "Petit-déjeuner inclus", "Climatisation", "Navette aéroport"],
    type: "Riad",
    stars: 5,
    reviewsCount: 124,
    meals: ["Petit-déjeuner inclus"],
    isBoosted: true,
    isHighDemand: true
  },
  { 
    id: "prop-2", 
    name: "Desert Cave Hotel", 
    rating: 9.5, 
    location: "Ghardaïa, Algérie",
    price: 8500,
    description: "Un séjour insolite au flanc des collines du M'zab. Architecture troglodyte moderne avec tout le confort nécessaire.",
    images: ["https://picsum.photos/seed/cave1/800/600", "https://picsum.photos/seed/cave2/800/600"],
    amenities: ["Vue panoramique", "Restaurant", "WiFi gratuit"],
    type: "Hôtel Insolite",
    stars: 4,
    reviewsCount: 89,
    isWeekendOffer: true
  },
  { 
    id: "prop-3", 
    name: "Villa Sahara Dream", 
    rating: 8.8, 
    location: "Ghardaïa, Algérie",
    price: 22000,
    description: "Villa luxueuse avec piscine privée et jardin luxuriant aux portes du désert.",
    images: ["https://picsum.photos/seed/villa1/800/600"],
    amenities: ["Piscine privée", "Jardin", "Parking gratuit", "WiFi"],
    type: "Villa de Luxe",
    stars: 5,
    reviewsCount: 45
  },
  { 
    id: "prop-4", 
    name: "Nile Floating Palace", 
    rating: 9.6, 
    location: "Louxor, Égypte",
    price: 15000,
    description: "Dormez sur le Nil à bord d'un palais flottant traditionnel (Dahabiya).",
    images: ["https://picsum.photos/seed/nile1/800/600"],
    amenities: ["Pont soleil", "Cuisine locale", "Excursions guidées"],
    type: "Bateau-Hôtel",
    stars: 5,
    reviewsCount: 210,
    isBoosted: true
  }
];

export const cars = [
  { id: "car-1", brand: "Dacia", model: "Duster 4x4", rating: 4.8 },
  { id: "car-2", brand: "Toyota", model: "Hilux", rating: 4.9 },
  { id: "car-3", brand: "Renault", model: "Symbol", rating: 4.5 }
];

export const carTypes = ['Économique', 'SUV / 4x4', 'Van / Minibus', 'Luxe', 'Moto'];
export const fuelTypes = ['Essence', 'Diesel', 'Électrique', 'Hybride'];
export const carFeatures = ['Kilométrage illimité', 'Climatisation', 'Boîte Automatique', 'GPS intégré', 'Assurance incluse', 'Siège enfant'];

export const circuits = [
  {
    id: "circ-1",
    title: "Expédition Grand Sahara",
    location: "Timimoun, Algérie",
    pricePerPerson: 45000,
    images: ["https://picsum.photos/seed/sahara1/800/600"],
    guide: {
      name: "Ahmed Sahara",
      email: "ahmed@stayfloow.com",
      phone: "+213 661 00 00 00"
    }
  },
  {
    id: "circ-2",
    title: "Croisière Nil et Temples de Louxor",
    location: "Louxor, Égypte",
    pricePerPerson: 65000,
    images: ["https://picsum.photos/seed/nile1/800/600"],
    guide: {
      name: "Youssef Nile",
      email: "youssef@stayfloow.com",
      phone: "+20 100 000 0000"
    }
  }
];

export const pendingCircuits = [];
