/**
 * @fileOverview Données mockées des réservations pour l'historique des utilisateurs de StayFloow.com.
 */

export type UserBooking = {
  id: string;
  itemType: 'Hébergement' | 'Véhicule' | 'Circuit';
  itemId: string;
  itemName: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  totalAmount: number;
  status: 'Confirmé' | 'Annulé';
};

const now = new Date();

export const userBookings: UserBooking[] = [
  {
    id: 'ST2024-8451',
    itemType: 'Hébergement',
    itemId: 'prop-1',
    itemName: 'Riad Dar Al-Andalus',
    startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 13).toISOString(),
    totalAmount: 37500,
    status: 'Confirmé',
  },
  {
    id: 'ST2024-7319',
    itemType: 'Véhicule',
    itemId: 'car-1',
    itemName: 'Dacia Duster 4x4',
    startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 25).toISOString(),
    totalAmount: 37500,
    status: 'Confirmé',
  },
  {
    id: 'ST2024-4001',
    itemType: 'Hébergement',
    itemId: 'prop-3',
    itemName: 'Villa Sahara Dream',
    startDate: new Date(now.getFullYear(), now.getMonth() + 1, 5).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 10).toISOString(),
    totalAmount: 110000,
    status: 'Confirmé',
  },
  {
    id: 'ST2024-1122',
    itemType: 'Hébergement',
    itemId: 'prop-2',
    itemName: 'Desert Cave Hotel',
    startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() - 2, 3).toISOString(),
    totalAmount: 17000,
    status: 'Confirmé',
  },
  {
    id: 'ST2024-5114',
    itemType: 'Hébergement',
    itemId: 'prop-6',
    itemName: 'Marrakech Serenity Riad',
    startDate: new Date(now.getFullYear(), now.getMonth() - 1, 15).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() - 1, 19).toISOString(),
    totalAmount: 56000,
    status: 'Confirmé',
  },
  {
    id: 'ST2024-4823',
    itemType: 'Hébergement',
    itemId: 'prop-8',
    itemName: 'Tamanrasset Desert Camp',
    startDate: new Date(now.getFullYear(), now.getMonth() - 3, 12).toISOString(),
    endDate: new Date(now.getFullYear(), now.getMonth() - 3, 19).toISOString(),
    totalAmount: 77000,
    status: 'Annulé',
  },
];
