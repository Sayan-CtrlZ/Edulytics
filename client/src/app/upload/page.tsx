
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { DataInputSheet } from "@/components/upload/data-input-sheet";

export default function UploadPage() {
  const { user, isUserLoading } = useUser();

  if (isUserLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Student Data Input</h1>
        <p className="text-muted-foreground">
          Manually enter student data or upload a CSV/XLSX file to populate the table.
        </p>
      </div>
      <DataInputSheet />
    </div>
  );
}

    