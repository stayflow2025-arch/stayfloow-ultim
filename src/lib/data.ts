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
    amenities: ["Wi-Fi gratuit", "Petit-déjeuner inclus", "Climatisation", "Réception 24h/24", "Salle de bain privée"],
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
    amenities: ["Wi-Fi gratuit", "Restaurant sur place", "Climatisation", "Terrasse / balcon / vue"],
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
    amenities: ["Wi-Fi gratuit", "Piscine", "Parking gratuit", "Cuisine / coin cuisine", "Climatisation"],
    type: "Villa",
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
    amenities: ["Wi-Fi gratuit", "Restaurant sur place", "Climatisation", "Réception 24h/24"],
    type: "Bateau-Hôtel",
    stars: 5,
    reviewsCount: 210,
    isBoosted: true
  },
  { 
    id: "prop-5", 
    name: "Algeria Business Tower", 
    rating: 8.5, 
    location: "Alger, Algérie",
    price: 18000,
    description: "Appartement de standing au coeur du centre d'affaires d'Alger.",
    images: ["https://picsum.photos/seed/tower1/800/600"],
    amenities: ["Wi-Fi gratuit", "Ascenseur", "Climatisation", "Parking gratuit", "Réception 24h/24"],
    type: "Appartement",
    stars: 4,
    reviewsCount: 67
  },
  { 
    id: "prop-6", 
    name: "Marrakech Serenity Riad", 
    rating: 9.9, 
    location: "Marrakech, Maroc",
    price: 14000,
    description: "Un havre de paix absolu à quelques minutes de la place Jemaa el-Fna.",
    images: ["https://picsum.photos/seed/marrakech1/800/600"],
    amenities: ["Wi-Fi gratuit", "Piscine", "Restaurant sur place", "Climatisation", "Petit-déjeuner inclus"],
    type: "Riad",
    stars: 5,
    reviewsCount: 342,
    isBoosted: true
  },
  { 
    id: "prop-7", 
    name: "Alexandria Sea View", 
    rating: 8.9, 
    location: "Alexandrie, Égypte",
    price: 9500,
    description: "Réveillez-vous avec le bruit des vagues de la Méditerranée.",
    images: ["https://picsum.photos/seed/alex1/800/600"],
    amenities: ["Wi-Fi gratuit", "Terrasse / balcon / vue", "Climatisation", "Salle de bain privée"],
    type: "Hôtel ★★★★",
    stars: 4,
    reviewsCount: 156
  },
  { 
    id: "prop-8", 
    name: "Tamanrasset Desert Camp", 
    rating: 9.2, 
    location: "Tamanrasset, Algérie",
    price: 11000,
    description: "Une expérience de camping de luxe sous les étoiles du Hoggar.",
    images: ["https://picsum.photos/seed/camp1/800/600"],
    amenities: ["Wi-Fi gratuit", "Restaurant sur place", "Animaux domestiques acceptés", "Parking gratuit"],
    type: "Glamping",
    stars: 3,
    reviewsCount: 42
  }
];

export const cars = [
  { 
    id: "car-1", 
    brand: "Dacia", 
    name: "Duster 4x4 Sahara", 
    rating: 4.8, 
    image: "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800", 
    pricePerDay: 7500, 
    transmission: "Manuelle", 
    fuel: "Diesel", 
    seats: 5, 
    category: "SUV & 4x4",
    isBoosted: true
  },
  { 
    id: "car-2", 
    brand: "Volkswagen", 
    name: "Golf 8 GTI Performance", 
    rating: 4.9, 
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", 
    pricePerDay: 12000, 
    transmission: "Automatique", 
    fuel: "Essence", 
    seats: 5, 
    category: "Luxe" 
  },
  { 
    id: "car-3", 
    brand: "Renault", 
    name: "Symbol Elegance", 
    rating: 4.5, 
    image: "https://picsum.photos/seed/car3/400/300", 
    pricePerDay: 4500, 
    transmission: "Manuelle", 
    fuel: "Essence", 
    seats: 5, 
    category: "Économique" 
  },
  { 
    id: "car-4", 
    brand: "Toyota", 
    name: "Hilux Adventure", 
    rating: 4.7, 
    image: "https://picsum.photos/seed/car2/400/300", 
    pricePerDay: 11500, 
    transmission: "Manuelle", 
    fuel: "Diesel", 
    seats: 5, 
    category: "SUV & 4x4" 
  },
];

export const carTypes = ['Économique', 'SUV & 4x4', 'Berline', 'Luxe', 'Moto'];
export const fuelTypes = ['Essence', 'Diesel', 'Électrique', 'Hybride'];
export const carFeatures = ['Kilométrage illimité', 'Climatisation', 'Transmission automatique', 'GPS intégré', 'Assurance incluse', 'Siège enfant'];

export interface TicketType {
  id: string;
  name: string;
  ageRange?: string;
  price: number;
}

export interface Circuit {
  id: string;
  title: string;
  location: string;
  pricePerPerson: number;
  rating: number;
  reviewsCount: number;
  duration: string;
  description: string;
  longDescription?: string;
  images: string[];
  languages: string[];
  inclusions: string[];
  exclusions?: string[];
  restrictions: string[];
  highlights: string[];
  ticketTypes: TicketType[];
  guide: {
    name: string;
    email: string;
    phone: string;
  };
}

export const circuits: Circuit[] = [
  {
    id: "circ-1",
    title: "Expédition Grand Sahara - Djanet & Tassili",
    location: "Djanet, Algérie",
    pricePerPerson: 45000,
    rating: 4.9,
    reviewsCount: 337,
    duration: "4 jours, 3 nuits",
    description: "Une aventure inoubliable au cœur du Tassili n'Ajjer. Découvrez les gravures rupestres millénaires et les dunes géantes de l'Assekrem.",
    longDescription: "Plongez dans le silence mystique du Sahara. Ce circuit vous emmène à travers les paysages lunaires de Djanet, où vous dormirez sous un ciel étoilé incomparable. Accompagnés de guides Touaregs experts, vous explorerez des canyons cachés et des arches naturelles sculptées par le vent.",
    images: ["https://picsum.photos/seed/sahara1/800/600", "https://picsum.photos/seed/sahara2/800/600"],
    languages: ["Français", "Arabe", "Anglais"],
    highlights: ["Gravures rupestres classées UNESCO", "Coucher de soleil sur les dunes de sable rouge", "Bivouac traditionnel touareg", "Thé traditionnel au feu de bois"],
    inclusions: ["Transport 4x4", "Tous les repas (halal)", "Équipement de camping", "Guide local certifié"],
    restrictions: ["Non accessible aux fauteuils roulants", "Déconseillé aux femmes enceintes", "Âge minimum : 6 ans"],
    ticketTypes: [
      { id: "adult", name: "Adulte", price: 45000 },
      { id: "child", name: "Enfant (6-15 ans)", price: 25000 },
      { id: "infant", name: "Jeune enfant (0-5 ans)", price: 0 }
    ],
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
    rating: 4.8,
    reviewsCount: 128,
    duration: "3 jours, 2 nuits",
    description: "Naviguez sur le Nil à bord d'une Dahabiya traditionnelle et explorez la Vallée des Rois et le Temple de Karnak.",
    longDescription: "Vivez l'Égypte comme les pharaons. Ce circuit combine une croisière relaxante sur le Nil et des visites guidées approfondies des sites archéologiques les plus célèbres au monde. Guide égyptologue inclus pour des explications historiques fascinantes.",
    images: ["https://picsum.photos/seed/nile1/800/600", "https://picsum.photos/seed/nile2/800/600"],
    languages: ["Anglais", "Arabe", "Espagnol"],
    highlights: ["Visite de la Vallée des Rois", "Temple de Karnak au lever du soleil", "Croisière privée sur Dahabiya", "Dîner de gala égyptien"],
    inclusions: ["Croisière en pension complète", "Billets d'entrée aux sites", "Guide égyptologue", "Transferts aéroport"],
    restrictions: ["Non accessible aux fauteuils roulants"],
    ticketTypes: [
      { id: "adult", name: "Adulte", price: 65000 },
      { id: "child", name: "Enfant (6-12 ans)", price: 35000 }
    ],
    guide: {
      name: "Youssef Nile",
      email: "youssef@stayfloow.com",
      phone: "+20 100 000 0000"
    }
  }
];

export const pendingCircuits = [];

export const popularFilters = ["Wi-Fi gratuit", "Piscine", "Petit-déjeuner inclus", "Parking gratuit", "Climatisation", "Vue mer", "Cuisine équipée"];
export const propertyTypesList = ["Hôtel ★★★", "Hôtel ★★★★", "Hôtel ★★★★★", "Riad", "Villa", "Appartement", "Studio", "Glamping"];
export const circuitThemes = ["Désert", "Culturel", "Nature", "Aventure", "Gastronomie"];

export const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  "Alger": { lat: 36.7538, lon: 3.0588 },
  "Oran": { lat: 35.6971, lon: -0.6308 },
  "Constantine": { lat: 36.365, lon: 6.6147 },
  "Annaba": { lat: 36.9, lon: 7.7667 },
  "Ghardaïa": { lat: 32.4909, lon: 3.6735 },
  "Timimoun": { lat: 29.2639, lon: 0.2306 },
  "Tamanrasset": { lat: 22.785, lon: 5.5228 },
  "Béjaïa": { lat: 36.7511, lon: 5.0567 },
  "Sétif": { lat: 36.19, lon: 5.41 },
  "Tlemcen": { lat: 34.8783, lon: -1.315 },
  "Marrakech": { lat: 31.6295, lon: -7.9811 },
  "Fès": { lat: 34.0333, lon: -5.0000 },
  "Le Caire": { lat: 30.0444, lon: 31.2357 },
  "Louxor": { lat: 25.6872, lon: 32.6396 },
  "Alexandrie": { lat: 31.2001, lon: 29.9187 }
};
