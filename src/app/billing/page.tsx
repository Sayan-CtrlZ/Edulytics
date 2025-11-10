
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BillingPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
      <Card>
        <CardHeader>
          <CardTitle>Billing & Subscriptions</CardTitle>
          <CardDescription>
            Manage your subscription and view your payment history.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium text-muted-foreground">
              Billing features are coming soon.
            </h3>
            <p className="text-sm text-muted-foreground">
              You are currently on the Free plan.
            </p>
          </div>
           <div className="mt-6 flex justify-end">
             <Button disabled>Upgrade Plan</Button>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
