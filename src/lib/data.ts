
/**
 * @fileOverview Données mockées pour les circuits et établissements de StayFloow.com
 */

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
