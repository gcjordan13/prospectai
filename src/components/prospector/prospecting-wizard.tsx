
"use client";

import { useState, useTransition } from 'react';
import { getAiResponse, findCompanies } from '@/app/actions';
import ChatInterface from './chat-interface';
import ResultsDisplay from './results-display';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type CompanyData = {
  companies: string[];
  websites: string[];
};

type Contact = {
  name: string;
  title: string;
  company: string;
  email: string;
};

type Stage = 'chat' | 'identifying' | 'scraping' | 'results';

const mockContacts: Contact[] = [
  { name: 'Alex Johnson', title: 'CEO', company: 'Innovatech Solutions', email: 'alex.j@example.com' },
  { name: 'Brenda Smith', title: 'VP of Marketing', company: 'Quantum Leap Inc.', email: 'brenda.s@example.com' },
  { name: 'Charles Davis', title: 'CTO', company: 'Synergy Systems', email: 'charles.d@example.com' },
  { name: 'Diana Miller', title: 'Head of Sales', company: 'Apex Digital', email: 'diana.m@example.com' },
  { name: 'Edward Wilson', title: 'Product Manager', company: 'NextGen Apps', email: 'edward.w@example.com' },
];

export default function ProspectingWizard() {
  const [stage, setStage] = useState<Stage>('chat');
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      role: 'assistant',
      content: "Hello! Please describe your ideal customer profile. For example, you could say 'I'm looking for software companies in California with 50-200 employees.'",
    },
  ]);
  const [confirmedScope, setConfirmedScope] = useState<string | undefined>();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const handleSendMessage = (message: string) => {
    const newConversation: ConversationMessage[] = [
      ...conversation,
      { role: 'user', content: message },
    ];
    setConversation(newConversation);
    setConfirmedScope(undefined); // Clear previous confirmed scope

    startTransition(async () => {
      try {
        const aiResult = await getAiResponse({
          userInput: message,
          conversationHistory: newConversation, 
        });
        
        setConversation(prev => [...prev, { role: 'assistant', content: aiResult.assistantResponse }]);
        
        if (aiResult.confirmedScope) {
          setConfirmedScope(aiResult.confirmedScope);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Failed to get a response from the AI. Please try again.",
        })
        setConversation(prev => [...prev, { role: 'assistant', content: "I'm sorry, something went wrong. Please try again." }]);
      }
    });
  };

  const handleConfirmScope = (scope: string) => {
    if (!user || !firestore) return;
    if (!scope) {
      toast({
        variant: "destructive",
        title: "Cannot proceed",
        description: "The prospecting scope has not been confirmed yet.",
      });
      return;
    }

    setStage('identifying');
    startTransition(async () => {
      try {
        const companiesResult = await findCompanies({ prospectingGoals: scope });
        
        // Save to Firestore using non-blocking functions
        const goalsCollectionRef = collection(firestore, 'users', user.uid, 'prospectingGoals');
        const goalRefPromise = addDocumentNonBlocking(goalsCollectionRef, {
            goalDescription: scope,
            createdAt: serverTimestamp(),
            userId: user.uid,
        });

        // The addDocumentNonBlocking function returns a promise that resolves with the new doc reference
        goalRefPromise.then(goalRef => {
            if (goalRef) {
                const prospectsRef = collection(goalRef, 'prospects');
                for (let i = 0; i < companiesResult.companies.length; i++) {
                    addDocumentNonBlocking(prospectsRef, {
                        companyName: companiesResult.companies[i],
                        websiteUrl: companiesResult.websites[i] || '',
                        prospectingGoalId: goalRef.id
                    });
                }
            }
        });
        
        setCompanyData(companiesResult);
        setStage('scraping');
        
        // Simulate ethical scraping delay
        setTimeout(() => {
          setContacts(mockContacts);
          setStage('results');
        }, 2500);
      } catch (error) {
        console.error("Error confirming scope:", error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: "Failed to identify and save companies. Please try again.",
        })
        setStage('chat'); // Go back to chat on error
      }
    });
  };

  const handleReset = () => {
    setStage('chat');
    setConversation([
      {
        role: 'assistant',
        content: "Let's start a new search. What kind of prospects are you looking for?",
      },
    ]);
    setConfirmedScope(undefined);
    setCompanyData(null);
    setContacts(null);
  };

  const LoadingIndicator = ({ text }: { text: string }) => (
    <Card className="w-full max-w-md mx-auto my-8 shadow-lg">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-semibold text-foreground">{text}</p>
        </div>
      </CardContent>
    </Card>
  );
  
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {stage === 'chat' && (
        <ChatInterface
          messages={conversation}
          onSendMessage={handleSendMessage}
          onConfirmScope={handleConfirmScope}
          isProcessing={isPending}
          confirmedScope={confirmedScope}
        />
      )}
      {(stage === 'identifying' || stage === 'scraping') && (
        <LoadingIndicator
            text={stage === 'identifying' ? 'Identifying relevant companies...' : 'Ethically gathering public contacts...'}
        />
      )}
      {stage === 'results' && companyData && contacts && (
        <ResultsDisplay
          companyData={companyData}
          contacts={contacts}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
