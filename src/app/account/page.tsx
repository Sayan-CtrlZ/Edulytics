
'use client';

import { useUser, useAuth } from '@/firebase';
import { redirect, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
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

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user is currently signed in.",
      });
      return;
    }
    try {
      await deleteUser(auth.currentUser);
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error Deleting Account",
        description: error.message || "Failed to delete account. Please try again.",
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
           <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-4">
            <div>
              <Label className="text-base text-destructive">Delete Account</Label>
               <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount}>
                        Continue
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
