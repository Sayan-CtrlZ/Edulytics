
"use server";

import { redirect } from "next/navigation";
import { login as authLogin, logout as authLogout } from "@/lib/auth";
import type { ZodError } from 'zod';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

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

  if (!process.env.CLOUDINARY_API_SECRET) {
    return { message: "Cloudinary API secret is not configured. Cannot upload file." };
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const results = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { 
          resource_type: 'raw',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      ).end(buffer);
    });

    console.log('Cloudinary upload result:', results);

    // For this demonstration, we will simulate the analysis and return mock statistics.
    const mockStats = {
      mean: Math.round(Math.random() * 20 + 75),
      median: Math.round(Math.random() * 20 + 75),
      mode: Math.round(Math.random() * 20 + 75),
      max: 100,
      min: Math.round(Math.random() * 20 + 40),
    };

    return { message: `File "${file.name}" uploaded successfully!`, stats: mockStats };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Upload failed: ${errorMessage}` };
  }
}
