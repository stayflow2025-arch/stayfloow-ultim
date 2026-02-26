
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { properties, cars } from "@/lib/data";
import { bookings } from "@/lib/bookings-data";
import { useCurrency } from "@/context/currency-context";
import {
  CircleDollarSign,
  Eye,
  Percent,
  Calendar,
  MessageSquare,
  Building,
  Car as CarIcon,
  Compass,
  Star,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const partnerListings = [
  ...properties.slice(1, 3).map((p) => ({ ...p, itemType: "Hébergement" })),
  ...cars.slice(0, 1).map((c) => ({
    ...c,
    id: c.id,
    itemType: "Véhicule",
    name: `${c.brand} ${c.model}`,
    rating: c.rating
  }))
];

const partnerBookings = bookings.slice(0, 3);

const totalEarnings = partnerBookings.reduce(
  (acc, booking) => acc + booking.totalAmount * 0.85,
  0
);

const totalViews = 12500;
const totalBookingsCount = partnerBookings.length;
const conversionRate = ((totalBookingsCount / totalViews) * 100).toFixed(2);

export default function PartnerDashboardPage() {
  const { formatPrice } = useCurrency();

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-primary text-white py-12 px-8 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Tableau de Bord Partenaire</h1>
            <p className="text-white/80 font-medium">Gérez votre activité et suivez vos performances sur StayFloow.com</p>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary font-black" asChild>
                <Link href="/partners/join">Ajouter une offre</Link>
             </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        {/* Statistiques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Gains Nets" 
            value={formatPrice(totalEarnings)} 
            desc="Après commission StayFloow" 
            icon={<CircleDollarSign className="h-5 w-5 text-primary" />} 
          />
          <StatCard 
            title="Vues (30j)" 
            value={totalViews.toLocaleString()} 
            desc="+15.2% ce mois" 
            icon={<Eye className="h-5 w-5 text-primary" />} 
          />
          <StatCard 
            title="Réservations" 
            value={`+${totalBookingsCount}`} 
            desc="30 derniers jours" 
            icon={<Calendar className="h-5 w-5 text-primary" />} 
          />
          <StatCard 
            title="Conversion" 
            value={`${conversionRate}%`} 
            desc="Vues / Réservations" 
            icon={<TrendingUp className="h-5 w-5 text-primary" />} 
          />
        </div>

        {/* Annonces + Réservations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Annonces */}
          <Card className="lg:col-span-2 border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">Vos Annonces</CardTitle>
                  <CardDescription>Aperçu de vos services listés.</CardDescription>
                </div>
                <Button variant="ghost" className="text-primary font-black gap-2">
                  Tout voir <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="font-bold pl-6">Annonce</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="text-right font-bold pr-6">Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partnerListings.map((listing) => (
                    <TableRow key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-bold text-slate-700 pl-6">{listing.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center gap-2 w-fit bg-primary/5 text-primary border-primary/10 px-3 py-1">
                          {listing.itemType === "Hébergement" && <Building className="h-3 w-3" />}
                          {listing.itemType === "Véhicule" && <CarIcon className="h-3 w-3" />}
                          {listing.itemType === "Circuit" && <Compass className="h-3 w-3" />}
                          {listing.itemType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5 font-black text-slate-900">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <span>{listing.rating}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Réservations */}
          <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-xl font-black text-slate-900">Récentes</CardTitle>
              <CardDescription>Dernières demandes de réservation.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {partnerBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{booking.itemName}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {booking.customer.name} • {booking.dates}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="shrink-0 text-primary hover:bg-primary/10 rounded-full">
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-xl">
                Gérer les réservations
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, desc, icon }: { title: string; value: string; desc: string; icon: any }) {
  return (
    <Card className="border-none shadow-lg rounded-3xl bg-white p-6 flex flex-col gap-4">
      <div className="bg-primary/5 w-12 h-12 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
        <p className="text-[10px] text-slate-500 font-medium mt-1">{desc}</p>
      </div>
    </Card>
  );
}
