import Link from 'next/link';
import PartnerOnboardingForm from '@/components/partners/PartnerOnboardingForm';

export default function PartnerJoinPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-white py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            StayFloow<span className="text-secondary">.com</span> Partner
          </Link>
          <div className="text-sm">
            Already a partner? <Link href="/login" className="underline font-medium">Sign in</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-primary mb-3">List your property on StayFloow</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Reach thousands of travelers in Algeria, Egypt and beyond. Registration is free and takes only 5 minutes.
            </p>
          </div>

          <PartnerOnboardingForm />
        </div>
      </main>

      <footer className="bg-white border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2025 StayFloow Partner Program. Secure and Reliable.
      </footer>
    </div>
  );
}
