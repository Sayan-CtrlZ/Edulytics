
"use server";

import { redirect } from "next/navigation";
import { login as authLogin, logout as authLogout } from "@/lib/auth";
import type { ZodError } from 'zod';

export type FormState = {
  message: string;
  fields?: Record<string, string>;
  issues?: string[];
  stats?: {
    mean: number;
    median: number;
    mode: number;
    max: number;
    min: number;
  } | null;
}

export async function login(prevState: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  const result = await authLogin(email, password);

  if (!result.success) {
    return { message: result.error };
  }

  redirect("/");
}

export async function logout() {
  await authLogout();
  redirect("/login");
}

export async function uploadFile(prevState: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get('file') as File;

  if (!file || file.size === 0 || !file.name) {
    return { message: 'Please select a valid file to upload.' };
  }
  
  // In a real application, you would parse the file here using a library like 'papaparse' for CSV or 'xlsx' for Excel.
  // The result would be used to calculate statistics and store data in Firestore.
  // The file itself would be uploaded to a service like Cloudinary.
  
  // For this demonstration, we will simulate the process and return mock statistics.
  console.log(`Simulating upload and analysis for: ${file.name}`);
  
  const mockStats = {
    mean: Math.round(Math.random() * 20 + 75),
    median: Math.round(Math.random() * 20 + 75),
    mode: Math.round(Math.random() * 20 + 75),
    max: 100,
    min: Math.round(Math.random() * 20 + 40),
  };

  return { message: `File "${file.name}" uploaded and analyzed successfully!`, stats: mockStats };
}
