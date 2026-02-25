import Link from 'next/link';
import Image from 'next/image';
import { Filter, Star, MapPin, ChevronDown, Heart, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

export default function SearchPage() {
  const mockResults = [
    {
      id: 1,
      name: 'Riad Dar El Kenz',
      location: 'Casbah, Algiers',
      rating: 8.9,
      ratingText: 'Fabulous',
      reviews: 342,
      price: '8,500',
      type: 'Entire Riad',
      image: 'https://picsum.photos/seed/riad1/400/300',
      badge: 'Bestseller',
      perks: ['Free cancellation', 'Breakfast included']
    },
    {
      id: 2,
      name: 'Nile Palace Cairo',
      location: 'Zamalek, Cairo',
      rating: 9.2,
      ratingText: 'Superb',
      reviews: 1205,
      price: '12,400',
      type: '5-star Hotel',
      image: 'https://picsum.photos/seed/hotel1/400/300',
      badge: 'Top Rated',
      perks: ['Pay later', 'River view']
    },
    {
      id: 3,
      name: 'Sahara Expedition SUV',
      location: 'Adrar, Algeria',
      rating: 8.5,
      ratingText: 'Very Good',
      reviews: 89,
      price: '15,000',
      type: 'Car Rental',
      image: 'https://picsum.photos/seed/suv1/400/300',
      badge: 'Popular',
      perks: ['Unlimited mileage', 'Insurance included']
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Search Bar */}
      <div className="bg-primary py-3 px-6 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-2 items-center">
          <Link href="/" className="text-xl font-bold text-white shrink-0 mr-4">StayFloow</Link>
          <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-10 gap-1 bg-orange-400 p-0.5 rounded-sm overflow-hidden">
            <div className="md:col-span-4 bg-white p-2 flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <Input placeholder="Search destination..." className="border-none h-auto p-0 focus-visible:ring-0 text-sm" />
            </div>
            <div className="md:col-span-3 bg-white p-2 flex items-center border-l">
              <span className="text-xs text-muted-foreground truncate">Jan 20 — Jan 25</span>
            </div>
            <div className="md:col-span-2 bg-white p-2 flex items-center border-l">
              <span className="text-xs text-muted-foreground truncate">2 adults · 1 room</span>
            </div>
            <div className="md:col-span-1">
              <Button className="w-full h-full rounded-none bg-primary">Search</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="p-4 bg-white rounded-md border booking-card-shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filter by:
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold mb-3">Popular filters</h4>
                <div className="space-y-2">
                  {['Free cancellation', 'Riad', 'Breakfast included', '4 stars'].map(f => (
                    <div key={f} className="flex items-center space-x-2">
                      <Checkbox id={f} />
                      <label htmlFor={f} className="text-sm leading-none">{f}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-bold mb-3">Your budget (per night)</h4>
                <div className="space-y-2">
                  {['0 - 5,000 DZD', '5,000 - 10,000 DZD', '10,000+ DZD'].map(f => (
                    <div key={f} className="flex items-center space-x-2">
                      <Checkbox id={f} />
                      <label htmlFor={f} className="text-sm leading-none">{f}</label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-bold mb-3">Star rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2].map(s => (
                    <div key={s} className="flex items-center space-x-2">
                      <Checkbox id={`star-${s}`} />
                      <label htmlFor={`star-${s}`} className="text-sm leading-none flex items-center gap-1">
                        {s} stars <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Results List */}
        <main className="flex-grow space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Search results: {mockResults.length} properties found</h2>
            <Button variant="outline" size="sm" className="gap-2">
              Sort by: Recommended <ChevronDown className="h-4 w-4" />
            </Button>
          </div>

          {mockResults.map((item) => (
            <Card key={item.id} className="overflow-hidden border booking-card-shadow group">
              <div className="flex flex-col md:flex-row">
                <div className="relative w-full md:w-72 h-48 md:h-auto shrink-0">
                  <Image 
                    src={item.image} 
                    alt={item.name} 
                    fill 
                    className="object-cover"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full text-primary"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-grow p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-primary hover:underline cursor-pointer">{item.name}</h3>
                        <div className="flex">
                          {[1, 2, 3, 4].map(i => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-primary underline mb-2 cursor-pointer">
                        <MapPin className="h-3 w-3 mr-1" /> {item.location}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {item.type}
                      </div>
                      <div className="space-y-1">
                        {item.perks.map(p => (
                          <div key={p} className="text-green-600 text-xs font-bold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> {p}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-sm">{item.ratingText}</div>
                            <div className="text-[10px] text-muted-foreground">{item.reviews} reviews</div>
                          </div>
                          <div className="bg-primary text-white font-bold p-2 rounded-sm rounded-bl-none text-lg">
                            {item.rating}
                          </div>
                        </div>
                        {item.badge && (
                          <Badge variant="secondary" className="bg-yellow-400 text-yellow-950 font-bold text-[10px] border-none">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end items-end mt-4">
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground mb-1">5 nights, 2 adults</div>
                      <div className="text-2xl font-bold mb-2">DZD {item.price}</div>
                      <p className="text-[10px] text-muted-foreground mb-2 italic">+ DZD 250 taxes and charges</p>
                      <Button className="bg-primary hover:bg-primary/90 rounded-sm font-bold gap-2">
                        See availability <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          <div className="bg-accent/30 rounded-lg p-6 border border-dashed border-primary/20 flex items-center gap-4">
            <TrendingUp className="h-10 w-10 text-primary" />
            <div>
              <h4 className="font-bold">Want more deals?</h4>
              <p className="text-sm text-muted-foreground">Sign in to save up to 15% with AfricaPoints rewards.</p>
            </div>
            <Button variant="outline" className="ml-auto border-primary text-primary">Sign in</Button>
          </div>
        </main>
      </div>
    </div>
  );
}

function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
