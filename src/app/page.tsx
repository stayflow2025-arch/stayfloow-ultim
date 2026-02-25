import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Calendar, Users, Building, Car, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-home');
  const categories = [
    { id: 'accommodations', name: 'Accommodations', icon: Building, description: 'Hotels, Riads, Villas', image: PlaceHolderImages[1] },
    { id: 'cars', name: 'Car Rentals', icon: Car, description: 'SUVs, Sedans, 4x4s', image: PlaceHolderImages[3] },
    { id: 'circuits', name: 'Circuits', icon: Compass, description: 'Desert Tours, Nile Cruises', image: PlaceHolderImages[2] },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            StayFloow<span className="text-secondary">.com</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/search?type=accommodations" className="hover:text-secondary transition-colors">Stays</Link>
            <Link href="/search?type=cars" className="hover:text-secondary transition-colors">Car Rentals</Link>
            <Link href="/search?type=circuits" className="hover:text-secondary transition-colors">Circuits</Link>
            <Button variant="outline" className="text-primary bg-white hover:bg-white/90 border-none" asChild>
              <Link href="/partners/join">List your property</Link>
            </Button>
            <Button variant="ghost" className="text-white hover:bg-white/10">Sign in</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <Image 
          src={heroImage?.imageUrl || ''} 
          alt={heroImage?.description || ''} 
          fill 
          className="object-cover"
          priority
          data-ai-hint={heroImage?.imageHint}
        />
        <div className="absolute inset-0 hero-gradient" />
        
        <div className="relative z-10 w-full max-w-5xl px-6">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 shadow-sm">
              Find your next stay in Africa
            </h1>
            <p className="text-xl text-white/90 shadow-sm">
              Search deals on hotels, homes, and much more...
            </p>
          </div>

          <div className="bg-orange-400 p-1 rounded-lg shadow-xl">
            <div className="bg-white rounded-md grid grid-cols-1 md:grid-cols-12 gap-0 divide-y md:divide-y-0 md:divide-x border border-orange-400 overflow-hidden">
              <div className="md:col-span-4 p-3 flex items-center">
                <MapPin className="text-muted-foreground mr-2 h-5 w-5 shrink-0" />
                <Input 
                  placeholder="Where are you going?" 
                  className="border-none focus-visible:ring-0 text-base"
                />
              </div>
              <div className="md:col-span-3 p-3 flex items-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Calendar className="text-muted-foreground mr-2 h-5 w-5 shrink-0" />
                <span className="text-muted-foreground text-sm">Check-in — Check-out</span>
              </div>
              <div className="md:col-span-3 p-3 flex items-center cursor-pointer hover:bg-muted/50 transition-colors">
                <Users className="text-muted-foreground mr-2 h-5 w-5 shrink-0" />
                <span className="text-muted-foreground text-sm">2 adults · 0 children · 1 room</span>
              </div>
              <div className="md:col-span-2 p-1">
                <Button className="w-full h-full bg-primary hover:bg-primary/90 text-lg rounded-sm py-4">
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Browse by property type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/search?type=${cat.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all border-none booking-card-shadow group cursor-pointer">
                  <div className="relative h-48">
                    <Image 
                      src={cat.image.imageUrl} 
                      alt={cat.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      data-ai-hint={cat.image.imageHint}
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center mb-1">
                      <cat.icon className="h-5 w-5 text-primary mr-2" />
                      <h3 className="font-bold text-lg">{cat.name}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{cat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Destinations */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Trending Destinations</h2>
          <p className="text-muted-foreground mb-6">Most popular choices for travelers in Algeria & Egypt</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { city: 'Algiers', country: 'Algeria', count: '1,240', image: 'https://picsum.photos/seed/algiers/400/250' },
              { city: 'Cairo', country: 'Egypt', count: '3,510', image: 'https://picsum.photos/seed/cairo/400/250' },
              { city: 'Oran', country: 'Algeria', count: '850', image: 'https://picsum.photos/seed/oran/400/250' },
            ].map((dest, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden group cursor-pointer h-60">
                <Image src={dest.image} alt={dest.city} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{dest.city}, {dest.country}</h3>
                  <p className="text-sm">{dest.count} properties</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="text-2xl font-bold text-primary mb-4 block">
              StayFloow
            </Link>
            <p className="text-sm text-muted-foreground">
              Your gateway to authentic African hospitality and adventure.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Customer Service</li>
              <li>Partner Help</li>
              <li>Privacy Policy</li>
              <li>Terms & Conditions</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Discover</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Mobile App</li>
              <li>Reward Points</li>
              <li>Travel Guides</li>
              <li>Car Rentals</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Partners</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Extranet Login</li>
              <li>Become a Partner</li>
              <li>Affiliate Program</li>
              <li>Promote Listing</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2025 StayFloow.com. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
