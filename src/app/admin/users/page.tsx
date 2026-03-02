
"use client";

import React, { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import { 
  Users, Search, Shield, ShieldAlert, ArrowLeft, 
  Loader2, MoreVertical, Ban, CheckCircle, Mail, Calendar, User as UserIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const ADMIN_EMAILS = ["stayflow2025@gmail.com", "kiosque.du.passage@gmail.com"];

export default function AdminUsersPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: adminUser, isUserLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = useMemo(() => adminUser && ADMIN_EMAILS.includes(adminUser.email || ""), [adminUser]);

  const usersRef = useMemoFirebase(() => {
    if (!isAdmin) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"));
  }, [db, isAdmin]);
  const { data: users, isLoading } = useCollection(usersRef);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    await updateDoc(doc(db, "users", id), { status: newStatus });
  };

  if (isUserLoading || isLoading) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

  if (!adminUser || !isAdmin) {
    router.replace("/");
    return null;
  }

  const filteredUsers = users?.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-slate-800 text-white py-8 px-8 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin')} className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight">Gestion Utilisateurs</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{filteredUsers.length} membres enregistrés</p>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary border-none font-black text-[10px]">AUTH REAL-TIME</Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 space-y-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Rechercher par email, nom..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl font-bold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user: any) => (
            <Card key={user.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white hover:shadow-xl transition-all">
              <CardContent className="p-0">
                <div className="p-6 flex items-start justify-between border-b border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <UserIcon className="h-6 w-6 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 leading-tight">{user.firstName} {user.lastName}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role || 'Client'}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-none shadow-2xl">
                      <DropdownMenuItem onClick={() => handleStatusUpdate(user.id, user.status === 'suspended' ? 'active' : 'suspended')} className="font-bold py-3 rounded-xl">
                        {user.status === 'suspended' ? (
                          <><CheckCircle className="h-4 w-4 mr-3 text-green-500" /> Réactiver le compte</>
                        ) : (
                          <><Ban className="h-4 w-4 mr-3 text-red-500" /> Suspendre le compte</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Mail className="h-4 w-4 text-primary" /> {user.email}
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                    <Calendar className="h-4 w-4 text-primary" /> Inscrit le {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '...'}
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <Badge className={cn(
                      "font-black text-[9px] uppercase",
                      user.status === 'suspended' ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                    )}>
                      {user.status || 'Actif'}
                    </Badge>
                    <Button variant="ghost" className="text-[10px] font-black uppercase text-primary p-0 h-auto" onClick={() => router.push(`/admin/bookings?userId=${user.id}`)}>
                      Voir Réservations
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
