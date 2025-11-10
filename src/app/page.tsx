
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/dashboard/dashboard';
import { useEffect, useState, useMemo } from 'react';
import type { Mark } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const schoolId = "school-1"; // Hardcoded for now
  
  const marksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, `schools/${schoolId}/marks`);
  }, [firestore, schoolId]);

  const { data: allMarks, isLoading: isMarksLoading } = useCollection<Mark>(marksQuery);

  const students10A = useMemo(() => allMarks?.filter(s => s.class === '10' && s.section === 'A') || [], [allMarks]);
  const students10B = useMemo(() => allMarks?.filter(s => s.class === '10' && s.section === 'B') || [], [allMarks]);

  if (isUserLoading || isMarksLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <Tabs defaultValue="class-10a">
        <TabsList>
          <TabsTrigger value="class-10a">Class 10-A</TabsTrigger>
          <TabsTrigger value="class-10b">Class 10-B</TabsTrigger>
        </TabsList>
        <TabsContent value="class-10a" className="mt-4">
          <Dashboard studentData={students10A} />
        </TabsContent>
        <TabsContent value="class-10b" className="mt-4">
          <Dashboard studentData={students10B} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
