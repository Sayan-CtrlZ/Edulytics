
'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

export default function SupportPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!subject || !message) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill out both the subject and message fields.',
      });
      return;
    }
    
    setIsSending(true);

    // Simulate sending a support request
    setTimeout(() => {
      toast({
        title: 'Request Sent!',
        description: 'Your support request has been sent. We will get back to you shortly.',
      });
      setSubject('');
      setMessage('');
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Contact Support</CardTitle>
          <CardDescription>
            Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g., Issue with data upload"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Please describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="min-h-[150px]"
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSending}>
                {isSending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
