/**
 * @fileOverview Données mockées robustes pour la version locale de StayFloow.com.
 * Inclut les circuits demandés en Algérie et Égypte ainsi que les nouvelles caractéristiques (salons, jardins).
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
  // Nouveaux champs de composition
  roomsCount?: number;
  bathroomsCount?: number;
  livingRoomsCount?: number;
  gardensCount?: number;
  // Champs spécifiques hôtels
  singleRoomsCount?: number;
  parentalSuitesCount?: number;
  doubleRoomsCount?: number;
};

export const properties: Property[] = [
  { 
    id: "hyatt-regency-algiers", 
    name: "Hyatt Regency Algiers Airport", 
    rating: 9.4, 
    location: "Houari Boumediene Airport, Alger, Algérie",
    price: 155,
    description: "Hôtel 5 étoiles contemporain situé face au nouveau terminal de l'aéroport international Houari Boumediene. Idéal pour les voyageurs d'affaires.",
    images: ["/images/listings/hyatt-regency.png"],
    amenities: ["Wi-Fi gratuit", "Piscine", "Fitness", "Navette Aéroport", "Restaurant", "Business Center"],
    type: "Hôtel ★★★★★",
    stars: 5,
    reviewsCount: 128,
    isBoosted: true,
    doubleRoomsCount: 320
  },
  { 
    id: "hotel-el-aurassi", 
    name: "Hôtel El Aurassi", 
    rating: 9.1, 
    location: "2 Boulevard Frantz Fanon, Alger, Algérie",
    price: 130,
    description: "Icône de l'hôtellerie algérienne perché sur les hauteurs d'Alger, offrant une vue imprenable sur la baie. Service de prestige.",
    images: ["/images/listings/el-aurassi.png"],
    amenities: ["Vue sur mer", "Piscine extérieure", "Tennis", "Parking gratuit", "Restaurants gastronomiques", "Salles de conférence"],
    type: "Hôtel ★★★★★ (Palace)",
    stars: 5,
    reviewsCount: 245,
    parentalSuitesCount: 15
  },
  { 
    id: "prop-3", 
    name: "Villa Sahara Dream", 
    rating: 8.8, 
    location: "Ghardaïa, Algérie",
    price: 150,
    description: "Villa luxueuse avec piscine privée, 2 grands salons marocains et 2 jardins luxuriants aux portes du désert.",
    images: ["https://picsum.photos/seed/villa1/800/600"],
    amenities: ["Wi-Fi gratuit", "Piscine", "Parking gratuit", "Cuisine / coin cuisine", "Climatisation"],
    type: "Villa",
    stars: 5,
    reviewsCount: 45,
    roomsCount: 4,
    livingRoomsCount: 2,
    gardensCount: 2
  },

  { 
    id: "prop-5", 
    name: "Algeria Business Tower", 
    rating: 8.5, 
    location: "Alger, Algérie",
    price: 120,
    description: "Appartement de standing au coeur du centre d'affaires d'Alger. Idéal pour les professionnels.",
    images: ["https://picsum.photos/seed/tower1/800/600"],
    amenities: ["Wi-Fi gratuit", "Ascenseur", "Climatisation", "Parking gratuit", "Réception 24h/24"],
    type: "Appartement",
    stars: 4,
    reviewsCount: 67,
    livingRoomsCount: 1
  },
  { 
    id: "prop-6", 
    name: "Marrakech Serenity Riad", 
    rating: 9.9, 
    location: "Marrakech, Maroc",
    price: 95,
    description: "Un havre de paix absolu à quelques minutes de la place Jemaa el-Fna avec piscine et jardin intérieur.",
    images: ["https://picsum.photos/seed/marrakech1/800/600"],
    amenities: ["Wi-Fi gratuit", "Piscine", "Restaurant sur place", "Climatisation", "Petit-déjeuner inclus"],
    type: "Riad",
    stars: 5,
    reviewsCount: 342,
    isBoosted: true,
    gardensCount: 1
  },
  { 
    id: "prop-7", 
    name: "Alexandria Sea View", 
    rating: 8.9, 
    location: "Alexandrie, Égypte",
    price: 65,
    description: "Hôtel moderne avec vue imprenable sur la Méditerranée. Chambres doubles confortables.",
    images: ["https://picsum.photos/seed/alex1/800/600"],
    amenities: ["Wi-Fi gratuit", "Terrasse / balcon / vue", "Climatisation", "Salle de bain privée"],
    type: "Hôtel ★★★★",
    stars: 4,
    reviewsCount: 156,
    doubleRoomsCount: 45
  },
  { 
    id: "prop-8", 
    name: "Tamanrasset Desert Camp", 
    rating: 9.2, 
    location: "Tamanrasset, Algérie",
    price: 75,
    description: "Une expérience de camping de luxe sous les étoiles du Hoggar. Grands espaces extérieurs.",
    images: ["https://picsum.photos/seed/camp1/800/600"],
    amenities: ["Wi-Fi gratuit", "Restaurant sur place", "Animaux domestiques acceptés", "Parking gratuit"],
    type: "Glamping",
    stars: 3,
    reviewsCount: 42,
    gardensCount: 5
  }
];

export const cars = [
  { 
    id: "car-1", 
    brand: "Dacia", 
    name: "Duster 4x4 Sahara", 
    rating: 9.2, 
    image: "https://images.unsplash.com/photo-1761320296536-38a4e068b37d?w=800", 
    pricePerDay: 50, 
    transmission: "Manuelle", 
    fuel: "Diesel", 
    seats: 5, 
    luggage: 3,
    category: "SUV & 4x4",
    isBoosted: true,
    reviewsCount: 342
  },
  { 
    id: "car-2", 
    brand: "Volkswagen", 
    name: "Golf 8 GTI Performance", 
    rating: 9.8, 
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800", 
    pricePerDay: 85, 
    transmission: "Automatique", 
    fuel: "Essence", 
    seats: 5, 
    luggage: 2,
    category: "Luxe",
    reviewsCount: 156
  },
  { 
    id: "car-3", 
    brand: "Mercedes-Benz", 
    name: "Classe C", 
    rating: 9.5, 
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800", 
    pricePerDay: 120, 
    transmission: "Automatique", 
    fuel: "Diesel", 
    seats: 5, 
    luggage: 3,
    category: "Berline",
    reviewsCount: 89
  },
  { 
    id: "car-4", 
    brand: "Renault", 
    name: "Clio 5", 
    rating: 8.9, 
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800", 
    pricePerDay: 35, 
    transmission: "Manuelle", 
    fuel: "Essence", 
    seats: 5, 
    luggage: 2,
    category: "Économique",
    reviewsCount: 210
  }
];

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
  amenities: string[];
}

export const circuits: Circuit[] = [
  {
    id: "circ-algeria-taghit",
    title: "Magie de Taghit - L'Enchanteresse du Désert",
    location: "Taghit, Algérie",
    pricePerPerson: 260,
    rating: 9.6,
    reviewsCount: 184,
    duration: "3 jours, 2 nuits",
    description: "Explorez l'oasis de Taghit, surnommée l'enchanteresse. Ascension des plus hautes dunes d'Algérie et visite du vieux Ksar.",
    longDescription: "Une immersion totale dans le Grand Erg Occidental. Vous découvrirez l'architecture ancestrale des ksours et profiterez de bivouacs magiques sous les étoiles.",
    images: ["https://images.unsplash.com/photo-1674109739254-c0c425a1975d?w=1200", "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200"],
    languages: ["Français", "Arabe"],
    highlights: ["Vieille ville de Taghit", "Dîner sous les étoiles", "Balade à dos de chameau"],
    inclusions: ["Transport 4x4", "Hébergement en maison d'hôte", "Pension complète", "Guide inclus (local arabe/français)"],
    restrictions: ["Bonne condition physique requise"],
    ticketTypes: [{ id: "adult", name: "Adulte", price: 260 }, { id: "child", name: "Enfant", price: 140 }],
    guide: { name: "Mustapha Taghit", email: "musta@stayfloow.com", phone: "+213 555 12 34 56" },
    amenities: ["Guide inclus (local arabe/français)", "Transport 4x4 (désert)", "Repas inclus (halal)", "Thème désert/Sahara"]
  },
  {
    id: "circ-egypt-pyramids",
    title: "Les Mystères de Gizeh - Pyramides & Sphinx",
    location: "Le Caire, Égypte",
    pricePerPerson: 80,
    rating: 9.8,
    reviewsCount: 1250,
    duration: "1 jour",
    description: "Une journée complète pour explorer les merveilles du monde antique. Guide égyptologue certifié et déjeuner local inclus.",
    longDescription: "Marchez sur les traces des pharaons. Cette visite exclusive vous emmène au pied des pyramides de Khéops, Khéphren et Mykérinos, suivie d'une rencontre avec le Grand Sphinx.",
    images: ["https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200", "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=1200"],
    languages: ["Français", "Anglais", "Arabe"],
    highlights: ["Grande Pyramide de Khéops", "Le Sphinx", "Musée du Caire"],
    inclusions: ["Guide égyptologue", "Tickets d'entrée", "Repas de midi", "Annulation gratuite"],
    restrictions: ["Accès limité pour PMR"],
    ticketTypes: [{ id: "adult", name: "Adulte", price: 80 }, { id: "child", name: "Enfant", price: 40 }],
    guide: { name: "Dr. Khaled", email: "khaled@stayfloow.com", phone: "+20 100 123 4567" },
    amenities: ["Guide inclus (local arabe/français)", "Annulation gratuite", "Thème culturel/historique (pyramides, ruines)", "Repas inclus (halal)"]
  },
  {
    id: "circ-egypt-redsea",
    title: "Trésors de la Mer Rouge - Hurghada & Corail",
    location: "Hurghada, Égypte",
    pricePerPerson: 125,
    rating: 9.4,
    reviewsCount: 442,
    duration: "1 jour",
    description: "Sortie en bateau privé pour découvrir les fonds marins exceptionnels. Snorkeling guidé et buffet de fruits de mer.",
    longDescription: "Une journée de détente absolue sur les eaux turquoise. Explorez les récifs coralliens préservés, nagez avec les poissons tropicaux et savourez un buffet de fruits de mer frais.",
    images: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200", "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=1200"],
    languages: ["Français", "Anglais", "Espagnol"],
    highlights: ["Récifs coralliens", "Île Giftun", "Dauphins en liberté"],
    inclusions: ["Équipement snorkeling", "Boissons à volonté", "Transfert hôtel"],
    restrictions: ["Savoir nager"],
    ticketTypes: [{ id: "adult", name: "Adulte", price: 125 }],
    guide: { name: "Captain Sam", email: "sam@stayfloow.com", phone: "+20 111 987 6543" },
    amenities: ["Repas inclus (halal)", "Annulation gratuite", "Groupe petit (max 10 pers)"]
  }
];

export const carTypes = ['Économique', 'SUV & 4x4', 'Berline', 'Luxe', 'Moto'];
export const fuelTypes = ['Essence', 'Diesel', 'Électrique', 'Hybride'];
export const carFeatures = ['Kilométrage illimité', 'Climatisation', 'Transmission automatique', 'GPS intégré', 'Assurance incluse', 'Siège enfant'];
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
  "Marrakech": { lat: 31.6295, lon: -7.9811 },
  "Fès": { lat: 34.0333, lon: -5.0000 },
  "Le Caire": { lat: 30.0444, lon: 31.2357 },
  "Louxor": { lat: 25.6872, lon: 32.6396 },
  "Alexandrie": { lat: 31.2001, lon: 29.9187 },
  "Hurghada": { lat: 27.2579, lon: 33.8116 },
  "Taghit": { lat: 30.9231, lon: -2.0303 }
};
