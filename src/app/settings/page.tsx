
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage your application preferences and settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8 border-2 border-dashed rounded-lg">
            <h3 className="text-lg font-medium text-muted-foreground">
              Settings are coming soon.
            </h3>
            <p className="text-sm text-muted-foreground">
              You will be able to manage theme, notifications, and other preferences here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
