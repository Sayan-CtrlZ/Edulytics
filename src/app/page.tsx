
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
import { getStudentData } from '@/lib/data';
import Dashboard from '@/components/dashboard/dashboard';
import { useEffect, useState, useMemo } from 'react';
import type { Student } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function fetchData() {
      const studentData = await getStudentData();
      setAllStudents(studentData);
    }
    fetchData();
  }, []);

  const students10A = useMemo(() => allStudents.filter(s => s.class === '10' && s.section === 'A'), [allStudents]);
  const students10B = useMemo(() => allStudents.filter(s => s.class === '10' && s.section === 'B'), [allStudents]);

  if (isUserLoading || allStudents.length === 0) {
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
