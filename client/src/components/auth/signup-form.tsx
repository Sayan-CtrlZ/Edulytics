
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useAuth, useFirestore, FirestorePermissionError, errorEmitter } from "@/firebase";
import { doc, setDoc } from 'firebase/firestore';

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [instituteAddress, setInstituteAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) {
      setError("Cannot connect to the database.");
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Now create the user profile document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      const profileData = {
        instituteName: instituteName,
        instituteAddress: instituteAddress
      };
      
      // We are not awaiting this, but we are catching errors
      setDoc(userDocRef, profileData)
        .catch(err => {
           const permissionError = new FirestorePermissionError({
                path: userDocRef.path,
                operation: 'create',
                requestResourceData: profileData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });

      router.push("/");
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (err.code === 'auth/weak-password') {
        setError("The password is too weak. Please use at least 6 characters.");
      }
      else {
        setError("An unexpected error occurred during sign up. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSignup} className="grid gap-4">
      {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="teacher@school.edu"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
       <div className="grid gap-2">
        <Label htmlFor="instituteName">Institute Name</Label>
        <Input
          id="instituteName"
          name="instituteName"
          type="text"
          placeholder="e.g., Edulytics University"
          required
          value={instituteName}
          onChange={(e) => setInstituteName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="instituteAddress">Institute Address</Label>
        <Input
          id="instituteAddress"
          name="instituteAddress"
          type="text"
          placeholder="e.g., 123 Learning Lane"
          required
          value={instituteAddress}
          onChange={(e) => setInstituteAddress(e.target.value)}
        />
      </div>
      <div className="grid gap-2 relative">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-6 h-8 w-8"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          <span className="sr-only">
            {showPassword ? "Hide password" : "Show password"}
          </span>
        </Button>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Account..." : "Sign Up"}
      </Button>
    </form>
  );
}
