
import Image from "next/image";
import Link from "next/link";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SignupForm } from "@/components/auth/signup-form";
import { GraduationCap } from "lucide-react";

export default function SignupPage() {
  const loginImage = PlaceHolderImages.find((img) => img.id === "login-hero");

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <SignupForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-primary-foreground">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-8 w-8" />
            <h2 className="text-2xl font-bold">Student Insights Hub</h2>
          </div>
          <p className="max-w-prose">
            Unlock powerful analytics to drive student success. Our platform provides intuitive tools for educators to understand performance trends and make data-driven decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
