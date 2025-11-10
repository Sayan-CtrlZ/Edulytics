
'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { uploadFile } from '@/lib/actions';
import { Camera } from 'lucide-react';

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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? '');
      setPhotoPreview(user.photoURL);
    }
    if (userData) {
      setInstituteName((userData as any).instituteName ?? '');
    }
  }, [user, userData]);

  if (isUserLoading || isUserDataLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!auth.currentUser || !firestore) return;
    setIsSaving(true);
    try {
      let photoURL = user.photoURL;

      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const result = await uploadFile({ message: '' }, formData);
        if (result.fields?.photoURL) {
          photoURL = result.fields.photoURL;
        } else {
          throw new Error(result.message || 'Failed to upload photo.');
        }
      }

      await updateProfile(auth.currentUser, { displayName, photoURL });
      
      const userDocRef = doc(firestore, `users/${user.uid}`);
      await setDoc(userDocRef, { instituteName }, { merge: true });

      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      setPhotoFile(null); // Clear file after successful upload
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
      setPhotoPreview(user.photoURL);
      setPhotoFile(null);
    }
    if (userData) {
      setInstituteName((userData as any).instituteName ?? '');
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
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoPreview ?? ''} alt="User Avatar" />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change photo</span>
              </Button>
              <Input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handlePhotoChange} 
              />
            </div>
            <div className="grid gap-1.5">
                <h2 className="text-2xl font-semibold">{displayName || user.displayName || "No display name"}</h2>
                <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="instituteName">Institute Name</Label>
                <Input id="instituteName" value={instituteName} onChange={(e) => setInstituteName(e.target.value)} />
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
