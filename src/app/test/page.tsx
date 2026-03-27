import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
      <div className="bg-white p-12 rounded-[2rem] shadow-2xl space-y-6 max-w-md">
        <div className="bg-green-100 text-green-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h1 className="text-3xl font-black text-slate-900">TEST OK !</h1>
        <p className="text-slate-500 font-medium">La navigation fonctionne parfaitement sur StayFloow.</p>
        <Button className="w-full h-12 bg-primary font-black rounded-xl" asChild>
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </div>
  );
}