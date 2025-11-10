
'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { GraduationCap } from 'lucide-react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);

  const { data: userData, isLoading: isUserDataLoading } = useDoc(userDocRef);

  const [displayName, setDisplayName] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [instituteAddress, setInstituteAddress] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
    }
    if (userData) {
      setInstituteName((userData as any).instituteName ?? '');
      setInstituteAddress((userData as any).instituteAddress ?? '');
    }
  }, [user, userData]);

  if (isUserLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }
  
  const handleSaveChanges = async () => {
    if (!auth.currentUser || !firestore) return;
    setIsSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName });
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      const profileData = { instituteName, instituteAddress };
      
      setDoc(userDocRef, profileData, { merge: true }).catch((err) => {
        const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: profileData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setDisplayName(user.displayName ?? '');
    }
    if (userData) {
      setInstituteName((userData as any).instituteName ?? '');
      setInstituteAddress((userData as any).instituteAddress ?? '');
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>View and manage your profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted border">
                <GraduationCap className="h-12 w-12 text-muted-foreground" />
              </div>
            </div>
            <div className="grid gap-1.5">
                <h2 className="text-2xl font-semibold">{instituteName || "Your Institute"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input id="instituteName" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="instituteAddress">Institute Address</Label>
                <Input id="instituteAddress" value={instituteAddress} onChange={(e) => setInstituteAddress(e.target.value)} />
            </div>
            <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={user.email ?? ''} readOnly disabled />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isSaving}>Reset</Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
