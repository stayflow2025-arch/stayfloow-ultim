
import CircuitsResultsClient from './CircuitsResultsClient';
import { Metadata } from 'next';
import { getTranslationServer } from '@/lib/i18n-server';

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const t = await getTranslationServer();
  const params = await searchParams;
  const destination = params.dest || '';
  
  return {
    title: destination ? `Circuits et Activités à ${destination} | StayFloow` : `Circuits & Excursions | StayFloow`,
    description: `Découvrez les meilleurs circuits touristiques, excursions et activités à ${destination || 'votre destination'} sur StayFloow.com. Vivez une expérience authentique.`,
  };
}

export default async function CircuitsResultsPage() {
  return <CircuitsResultsClient />;
}
