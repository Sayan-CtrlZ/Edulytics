
"use server";

import { redirect } from "next/navigation";
import type { ZodError } from 'zod';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

export async function uploadFile(prevState: FormState, formData: FormData): Promise<FormState> {
  const file = formData.get('file') as File;

  if (!file || file.size === 0 || !file.name) {
    return { message: 'Please select a valid file to upload.' };
  }

  if (!process.env.CLOUDINARY_API_SECRET) {
    return { message: "Cloudinary is not configured correctly. Cannot upload file." };
  }
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const results: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
            // The preset is not needed for backend uploads with api_secret
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    if (!results || !results.secure_url) {
      throw new Error('Cloudinary did not return a secure URL.');
    }

    return { message: 'File uploaded successfully', fields: { photoURL: results.secure_url } };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { message: `Upload failed: ${errorMessage}` };
  }
}
