
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Car, ShieldCheck, MapPin, Gauge, Fuel, Users } from 'lucide-react';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';

export default function CarsPage() {
  const carCategories = [
    { name: 'Économique', image: 'https://picsum.photos/seed/car-eco/400/300', count: '124 véhicules' },
    { name: 'SUV & 4x4', image: 'https://picsum.photos/seed/car-suv/400/300', count: '85 véhicules' },
    { name: 'Berline', image: 'https://picsum.photos/seed/car-sedan/400/300', count: '56 véhicules' },
    { name: 'Luxe', image: 'https://picsum.photos/seed/car-luxury/400/300', count: '22 véhicules' },
  ];

  const popularCars = [
    { name: 'Dacia Duster 4x4', category: 'SUV', price: '7 500 DZD', rating: 4.8, image: 'https://picsum.photos/seed/car1/400/300' },
    { name: 'Toyota Hilux', category: '4x4', price: '12 000 DZD', rating: 4.9, image: 'https://picsum.photos/seed/car2/400/300' },
    { name: 'Renault Symbol', category: 'Économique', price: '4 500 DZD', rating: 4.5, image: 'https://picsum.photos/seed/car3/400/300' },
    { name: 'Volkswagen Golf 8', category: 'Berline', price: '9 000 DZD', rating: 4.7, image: 'https://picsum.photos/seed/car4/400/300' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5]">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search?type=accommodations" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Séjours</Link>
            <Link href="/cars" className="bg-white/20 px-3 py-2 rounded-md transition-colors font-bold">Voitures</Link>
            <Link href="/search?type=circuits" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Circuits</Link>
            <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary font-black transition-all" asChild>
              <Link href="/partners/join">Devenir partenaire</Link>
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </div>
        </div>
      </header>

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
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><ShieldCheck className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Assurance incluse</h3>
              <p className="text-sm text-slate-500">Roulez sereinement partout en Afrique.</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><MapPin className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Livraison flexible</h3>
              <p className="text-sm text-slate-500">À l'aéroport ou à votre hôtel.</p>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4 bg-white shadow-lg border-none">
            <div className="bg-primary/10 p-4 rounded-full text-primary"><Gauge className="h-8 w-8" /></div>
            <div>
              <h3 className="font-bold">Kilométrage illimité</h3>
              <p className="text-sm text-slate-500">Disponible sur une large sélection.</p>
            </div>
          </Card>
        </section>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-black mb-6 text-slate-900">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {carCategories.map((cat) => (
              <Link key={cat.name} href={`/search?type=cars&cat=${cat.name.toLowerCase()}`} className="group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 shadow-md border border-slate-200">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-sm text-slate-500">{cat.count}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Cars */}
        <section className="mb-16">
          <h2 className="text-2xl font-black mb-6 text-slate-900">Nos véhicules populaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {popularCars.map((car, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow border border-slate-100 group">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image src={car.image} alt={car.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded">{car.category}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 truncate">{car.name}</h3>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1"><Users className="h-3 w-3" /> 5 places</div>
                    <div className="flex items-center gap-1"><Fuel className="h-3 w-3" /> Diesel</div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-end">
                    <div>
                      <span className="text-xs text-slate-400">À partir de</span>
                      <p className="font-black text-primary">{car.price} <span className="text-[10px] text-slate-500">/jour</span></p>
                    </div>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-bold h-8">Réserver</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-primary text-white py-16 px-6 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div>
            <Link href="/" className="text-3xl font-bold mb-6 block">
              StayFloow<span className="text-secondary">.com</span>
            </Link>
            <p className="opacity-70">Le portail de voyage numéro 1 en Afrique.</p>
          </div>
          {['Support', 'Découvrir', 'Partenaires'].map((col) => (
            <div key={col}>
              <h4 className="font-bold text-lg mb-6">{col}</h4>
              <ul className="space-y-4 opacity-70">
                <li>Aide</li>
                <li>Confidentialité</li>
                <li>Conditions</li>
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center opacity-50">
          <p>© 2025 StayFloow.com. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
