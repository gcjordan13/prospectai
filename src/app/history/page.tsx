
'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, History as HistoryIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import UserNav from '@/components/auth/user-nav';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type ProspectingGoal = {
  id: string;
  goalDescription: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

export default function HistoryPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const goalsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'users', user.uid, 'prospectingGoals'), orderBy('createdAt', 'desc'));
  }, [firestore, user]);

  const { data: goals, isLoading } = useCollection<ProspectingGoal>(goalsQuery);

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
              <Link href="/" passHref>
                <div className="flex items-center gap-3 cursor-pointer">
                  <BrainCircuit className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    Prospector AI
                  </h1>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/history" passHref>
                <Button variant="ghost" className="text-primary bg-primary/10">
                  <HistoryIcon className="mr-2 h-4 w-4" />
                  History
                </Button>
              </Link>
              <UserNav />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Prospecting History</h2>
            <Link href="/" passHref>
                <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Search
                </Button>
            </Link>
        </div>
        {isLoading && <p>Loading history...</p>}
        {!isLoading && goals && goals.length === 0 && (
            <Card className="text-center py-12">
                <CardHeader>
                    <CardTitle>No History Found</CardTitle>
                    <CardDescription>You haven&apos;t performed any searches yet.</CardDescription>
                </CardHeader>
            </Card>
        )}
        <div className="grid gap-4">
            {goals?.map(goal => (
                <Link key={goal.id} href={`/history/${goal.id}`} passHref>
                    <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                        <CardContent className="p-4 flex justify-between items-center">
                            <p className="font-medium truncate pr-4">{goal.goalDescription}</p>
                            <p className="text-sm text-muted-foreground whitespace-nowrap">
                                {goal.createdAt ? format(new Date(goal.createdAt.seconds * 1000), 'MMM d, yyyy') : 'Date not available'}
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
