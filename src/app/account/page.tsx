
'use client';

import { useUser, useAuth } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No email address associated with this account.",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Password Reset Email Sent",
        description: `An email has been sent to ${user.email} with instructions to reset your password.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Sending Email",
        description: error.message || "Failed to send password reset email.",
      });
    }
  };

  if (isUserLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base">Change Password</Label>
              <p className="text-sm text-muted-foreground">
                Update your account password via email link.
              </p>
            </div>
            <Button variant="outline" onClick={handleChangePassword}>Change Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
