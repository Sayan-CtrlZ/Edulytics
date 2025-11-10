
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { UploadForm } from "@/components/upload/upload-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UploadPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Upload Student Data</h1>
      <Card className="max-w-2xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Select an Excel (.xlsx) or CSV (.csv) file containing student data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm />
        </CardContent>
      </Card>
    </div>
  );
}
