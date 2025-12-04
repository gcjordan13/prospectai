
import AuthForm from '@/components/auth/auth-form';
import { BrainCircuit } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex items-center gap-3 mb-8">
        <BrainCircuit className="h-10 w-10 text-primary" />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Prospector AI
        </h1>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
