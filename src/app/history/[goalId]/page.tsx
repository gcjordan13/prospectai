
'use client';

import { useFirebase, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Building, Users, Globe, ArrowLeft, BrainCircuit, History, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserNav from '@/components/auth/user-nav';
import { useEffect } from 'react';


type Prospect = {
  id: string;
  companyName: string;
  websiteUrl: string;
};

type ProspectingGoal = {
  id: string;
  goalDescription: string;
};

export default function GoalDetailPage() {
  const { firestore, user, isUserLoading } = useFirebase();
  const params = useParams();
  const router = useRouter();
  const goalId = params.goalId as string;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const goalRef = useMemoFirebase(() => {
    if (!firestore || !user || !goalId) return null;
    return doc(firestore, 'users', user.uid, 'prospectingGoals', goalId);
  }, [firestore, user, goalId]);

  const prospectsQuery = useMemoFirebase(() => {
    if (!goalRef) return null;
    return collection(goalRef, 'prospects');
  }, [goalRef]);
  
  const { data: goal, isLoading: isGoalLoading } = useDoc<ProspectingGoal>(goalRef);
  const { data: prospects, isLoading: areProspectsLoading } = useCollection<Prospect>(prospectsQuery);

  const handleExport = () => {
    if (!prospects) return;
    const csvHeader = "CompanyName,WebsiteURL\n";
    const csvRows = prospects.map(p => `${p.companyName},${p.websiteUrl}`).join("\n");
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `prospects_${goalId}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Prospecting Results</h2>
                {isGoalLoading ? (
                  <p className="text-muted-foreground mt-1">Loading goal...</p>
                ) : (
                   <p className="text-muted-foreground mt-1 max-w-2xl">{goal?.goalDescription}</p>
                )}
            </div>
            <div className="flex gap-2">
              <Link href="/history" passHref>
                  <Button variant="outline">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to History
                  </Button>
              </Link>
               <Button onClick={handleExport} disabled={!prospects || prospects.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
              </Button>
            </div>
        </div>
        
        {areProspectsLoading && <p>Loading prospects...</p>}

        <div className="grid gap-8 md:grid-cols-3">
            <Card className="md:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Building className="text-primary" />
                Companies
                </CardTitle>
                <CardDescription>
                Found {prospects?.length || 0} relevant companies.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh]">
                <ul className="space-y-3 pr-4">
                    {prospects?.map((prospect) => (
                    <li key={prospect.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <span className="font-medium text-sm">{prospect.companyName}</span>
                        {prospect.websiteUrl && (
                        <Button variant="ghost" size="sm" asChild>
                            <a
                            href={prospect.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-accent hover:text-accent-foreground"
                            >
                            <Globe size={14} />
                            Website
                            </a>
                        </Button>
                        )}
                    </li>
                    ))}
                </ul>
                </ScrollArea>
            </CardContent>
            </Card>
            <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Users className="text-primary" />
                Potential Contacts
                </CardTitle>
                <CardDescription>
                Publicly available contact information from ethical sources. (Mock data)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[60vh] border rounded-lg">
                    <Table>
                    <TableHeader className="sticky top-0 bg-muted">
                        <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Email</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {/* This is still mock data */}
                        {[
                            { name: 'Alex Johnson', title: 'CEO', company: 'Innovatech Solutions', email: 'alex.j@example.com' },
                            { name: 'Brenda Smith', title: 'VP of Marketing', company: 'Quantum Leap Inc.', email: 'brenda.s@example.com' },
                        ].map((contact, index) => (
                        <TableRow key={index}>
                            <TableCell className="font-medium">{contact.name}</TableCell>
                            <TableCell>{contact.title}</TableCell>
                            <TableCell>{contact.company}</TableCell>
                            <TableCell>
                            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                {contact.email}
                            </a>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
