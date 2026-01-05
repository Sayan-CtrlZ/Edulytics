"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Terminal, Check } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/firebase";

function ForgotPasswordDialogContent() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const auth = useAuth();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setEmail("");
      // Close dialog after 3 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email address.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else if (err.code === 'auth/too-many-requests') {
        setError("Too many requests. Please try again later.");
      } else {
        // Still show success message as email may have been sent
        // but log the error for debugging
        setSuccess(true);
        setEmail("");
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
        }, 3000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal">
          Forgot password?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleForgotPassword} className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-500 bg-green-50">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-900">Success</AlertTitle>
              <AlertDescription className="text-green-800">
                Check your email for a password reset link.
              </AlertDescription>
            </Alert>
          )}
          <div className="grid gap-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="teacher@school.edu"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || success}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || success || !email}
          >
            {isLoading ? "Sending..." : success ? "Email Sent!" : "Send Reset Link"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ForgotPasswordDialog() {
  return (
    <Suspense fallback={<Button variant="link" className="p-0 h-auto font-normal" disabled>Forgot password?</Button>}>
      <ForgotPasswordDialogContent />
    </Suspense>
  );
}
