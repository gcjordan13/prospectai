
"use client";

import { useRef, useEffect } from 'react';
import { Bot, User, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useForm, SubmitHandler } from "react-hook-form";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onConfirmScope: (scope: string) => void;
  isProcessing: boolean;
  confirmedScope?: string;
}

type FormValues = {
  message: string;
};

export default function ChatInterface({ messages, onSendMessage, onConfirmScope, isProcessing, confirmedScope }: ChatInterfaceProps) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>();
  const scrollAreaViewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = scrollAreaViewport.current;
    if (viewport) {
      viewport.scrollTo({
        top: viewport.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);
  
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (data.message.trim()) {
      onSendMessage(data.message.trim());
      reset();
    }
  };

  const hasConfirmationPrompt = (messageContent: string) => {
    if (confirmedScope) return true;
    const lowerCaseContent = messageContent.toLowerCase();
    // A more flexible check
    return lowerCaseContent.includes("does this sound right?") ||
           lowerCaseContent.includes("here is a summary") ||
           lowerCaseContent.includes("confirm this scope") ||
           lowerCaseContent.includes("is this correct?");
  }

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-xl border-t-4 border-primary">
      <CardHeader className="border-b bg-muted/50">
        <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="text-primary"/>
            <span>AI Prospecting Assistant</span>
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[50vh]" viewportRef={scrollAreaViewport}>
          <div className="p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg p-3',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-muted shadow-sm'
                  )}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                   {message.role === 'assistant' && hasConfirmationPrompt(message.content) && confirmedScope && (
                     <Button 
                       size="sm" 
                       className="mt-3 w-full sm:w-auto" 
                       onClick={() => onConfirmScope(confirmedScope)}
                       disabled={isProcessing}
                     >
                       <CheckCircle className="mr-2 h-4 w-4" />
                       Confirm & Find Prospects
                     </Button>
                   )}
                </div>
                 {message.role === 'user' && (
                  <Avatar className="h-8 w-8 border-2 border-accent/50">
                    <AvatarFallback className="bg-accent text-accent-foreground">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isProcessing && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3 text-sm shadow-sm">
                      <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 bg-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 bg-foreground rounded-full animate-bounce"></div>
                      </div>
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t bg-muted/50">
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full items-center gap-2">
          <Textarea
            {...register("message", { required: true })}
            placeholder="Describe your ideal customer..."
            className="flex-1 resize-none bg-background shadow-inner"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit)();
              }
            }}
            disabled={isProcessing}
          />
          <Button type="submit" size="icon" disabled={isProcessing || isSubmitting}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
