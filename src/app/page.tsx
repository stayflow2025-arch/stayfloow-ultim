
import Link from 'next/link';
import Image from 'next/image';
import { Building, Car, Compass, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AdvancedSearchBar from '@/components/search/AdvancedSearchBar';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-home');
  
  const propertyTypes = [
    { name: 'Hôtels', image: 'https://picsum.photos/seed/hotel/400/300', count: '820,412' },
    { name: 'Appartements', image: 'https://picsum.photos/seed/apt/400/300', count: '915,234' },
    { name: 'Complexes hôteliers', image: 'https://picsum.photos/seed/resort/400/300', count: '145,098' },
    { name: 'Villas', image: 'https://picsum.photos/seed/villa/400/300', count: '450,123' },
  ];

  const uniqueStays = [
    { name: 'Riad Dar Al-Andalus', location: 'Fès, Maroc', rating: 9.8, price: '120 €', image: 'https://picsum.photos/seed/unique1/400/500' },
    { name: 'Desert Cave Hotel', location: 'Ghardaïa, Algérie', rating: 9.5, price: '85 €', image: 'https://picsum.photos/seed/unique2/400/500' },
    { name: 'Nile Floating Palace', location: 'Louxor, Égypte', rating: 9.6, price: '150 €', image: 'https://picsum.photos/seed/unique3/400/500' },
    { name: 'Royal Algerian Tent', location: 'Timimoun, Algérie', rating: 9.7, price: '110 €', image: 'https://picsum.photos/seed/unique4/400/500' },
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
            <Link href="/search?type=cars" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Voitures</Link>
            <Link href="/search?type=circuits" className="hover:bg-white/10 px-3 py-2 rounded-md transition-colors font-medium">Circuits</Link>
            <Button variant="outline" className="text-white border-white hover:bg-white/10 font-bold" asChild>
              <Link href="/partners/join">Devenir partenaire</Link>
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10">Se connecter</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-primary pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl font-black text-white mb-4 leading-tight">
            Trouvez votre prochain séjour
          </h1>
          <p className="text-2xl text-white opacity-90 mb-12">
            Des offres incroyables sur les hôtels, riads et bien plus encore...
          </p>
          <AdvancedSearchBar />
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 -mt-10 pb-20 w-full z-20">
        
        {/* Promotion Banner */}
        <section className="mb-16 bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 flex flex-col md:flex-row items-center p-8 gap-8">
          <div className="flex-1">
            <span className="text-sm font-bold text-slate-500 mb-2 block">Offres Début 2026</span>
            <h2 className="text-3xl font-black mb-4">-15 % minimum</h2>
            <p className="text-slate-600 mb-6">Offres Début 2026 : réservez maintenant et économisez sur votre prochain séjour avant le 1er avril 2026.</p>
            <Button className="bg-[#006ce4] hover:bg-[#0057b8] text-white px-8 py-6 text-lg font-bold">
              Découvrir les offres
            </Button>
          </div>
          <div className="w-full md:w-64 h-48 relative rounded-lg overflow-hidden shrink-0 shadow-md">
            <Image src="https://picsum.photos/seed/promo/600/400" alt="Promotion" fill className="object-cover" />
          </div>
        </section>

        {/* Property Types */}
        <section className="mb-16">
          <h2 className="text-2xl font-black mb-6 text-slate-900">Rechercher par type d'hébergement</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <Link key={type.name} href={`/search?type=${type.name.toLowerCase()}`} className="group">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-3 shadow-md">
                  <Image src={type.image} alt={type.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{type.name}</h3>
                <p className="text-sm text-slate-500">{type.count} {type.name.toLowerCase()}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Unique Stays */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900">Séjournez dans nos hébergements uniques les mieux notés</h2>
            <p className="text-slate-500">Des châteaux aux villas, des bateaux aux igloos, nous avons tout ce qu'il vous faut</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {uniqueStays.map((stay, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden mb-4 shadow-lg">
                  <Image src={stay.image} alt={stay.name} fill className="object-cover" />
                </div>
                <h3 className="font-black text-lg text-slate-900 truncate">{stay.name}</h3>
                <p className="text-sm text-slate-500 mb-2">{stay.location}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-primary text-white text-xs font-bold px-1.5 py-1 rounded">
                    {stay.rating}
                  </div>
                  <span className="text-sm font-bold text-slate-800">Exceptionnel</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Dès </span>
                  <span className="font-black text-lg text-slate-900">{stay.price}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="bg-primary text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div>
            <Link href="/" className="text-3xl font-bold mb-6 block">
              StayFloow<span className="text-secondary">.com</span>
            </Link>
          </div>
          {['Support', 'Découvrir', 'Partenaires'].map((col) => (
            <div key={col}>
              <h4 className="font-bold text-lg mb-6">{col}</h4>
              <ul className="space-y-4 opacity-70">
                {col === 'Partenaires' ? (
                  <>
                    <li><Link href="/partners/join">Devenir partenaire</Link></li>
                    <li>Extranet</li>
                  </>
                ) : (
                  <>
                    <li>Aide</li>
                    <li>Confidentialité</li>
                    <li>Conditions</li>
                  </>
                )}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
