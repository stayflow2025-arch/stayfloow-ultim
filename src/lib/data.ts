
/**
 * @fileOverview Données mockées pour les circuits et établissements de StayFloow.com
 */

export const properties = [
  { id: "prop-1", name: "Riad Dar Al-Andalus", rating: 9.8, location: "Fès, Maroc" },
  { id: "prop-2", name: "Desert Cave Hotel", rating: 9.5, location: "Ghardaïa, Algérie" },
  { id: "prop-3", name: "Villa Sahara Dream", rating: 8.8, location: "Ghardaïa, Algérie" },
  { id: "prop-4", name: "Nile Floating Palace", rating: 9.6, location: "Louxor, Égypte" }
];

export const cars = [
  { id: "car-1", brand: "Dacia", model: "Duster 4x4", rating: 4.8 },
  { id: "car-2", brand: "Toyota", model: "Hilux", rating: 4.9 },
  { id: "car-3", brand: "Renault", model: "Symbol", rating: 4.5 }
];

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
