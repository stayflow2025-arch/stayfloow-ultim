import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldCheck, MapPin, Gauge } from 'lucide-react';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';
import { cars } from '@/lib/data';
import { CarCard } from '@/components/car-card';

export default function CarsPage() {
  const carCategories = [
    { name: 'Économique', image: 'https://picsum.photos/seed/car-eco/400/300', count: '124 véhicules' },
    { name: 'SUV & 4x4', image: 'https://picsum.photos/seed/car-suv/400/300', count: '85 véhicules' },
    { name: 'Berline', image: 'https://picsum.photos/seed/car-sedan/400/300', count: '56 véhicules' },
    { name: 'Luxe', image: 'https://picsum.photos/seed/car-luxury/400/300', count: '22 véhicules' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Hero Section */}
      <section className="bg-primary pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Louez la voiture idéale pour votre aventure
          </h1>
          <p className="text-2xl text-white opacity-90 mb-12">
            Des berlines citadines aux 4x4 robustes pour le désert...
          </p>
          <AdvancedSearchBar />
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 -mt-10 pb-20 w-full z-20">
        
        {/* Why us */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none rounded-3xl">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><ShieldCheck className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Assurance incluse</h3>
              <p className="text-sm text-slate-500">Roulez sereinement partout en Afrique.</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none rounded-3xl">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><MapPin className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Livraison flexible</h3>
              <p className="text-sm text-slate-500">À l'aéroport ou à votre hôtel.</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none rounded-3xl">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><Gauge className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Kilométrage illimité</h3>
              <p className="text-sm text-slate-500">Disponible sur une large sélection.</p>
            </div>
          </Card>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {carCategories.map((cat) => (
              <Link key={cat.name} href={`/search?type=cars&cat=${cat.name.toLowerCase()}`} className="group">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden mb-4 shadow-xl border-4 border-white transition-all group-hover:shadow-2xl group-hover:-translate-y-1">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <h3 className="font-black text-xl group-hover:text-primary transition-colors text-slate-900">{cat.name}</h3>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">{cat.count}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Cars */}
        <section className="mb-16">
          <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Nos véhicules populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
