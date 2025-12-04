
'use client';

import { BrainCircuit, History } from 'lucide-react';
import ProspectingWizard from '@/components/prospector/prospecting-wizard';
import Footer from '@/components/footer';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import UserNav from '@/components/auth/user-nav';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-8 w-8 text-primary animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 w-full bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Prospector AI
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/history" passHref>
                <Button variant="ghost">
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow">
        <ProspectingWizard />
      </main>
      <Footer />
    </div>
  );
}
