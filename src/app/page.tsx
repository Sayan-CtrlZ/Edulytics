
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/dashboard/dashboard';
import { useMemo } from 'react';
import type { Mark } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload } from 'lucide-react';

type ClassSection = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const schoolId = "school-1"; // Hardcoded for now
  
  const marksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, `schools/${schoolId}/marks`);
  }, [firestore, schoolId]);

  const { data: allMarks, isLoading: isMarksLoading } = useCollection<Mark>(marksQuery);

  const classSections = useMemo(() => {
    if (!allMarks) return [];
    const uniqueClassSections = new Map<string, ClassSection>();
    allMarks.forEach(mark => {
      const classSectionId = `${mark.class}-${mark.section}`;
      if (!uniqueClassSections.has(classSectionId)) {
        uniqueClassSections.set(classSectionId, {
          id: classSectionId,
          name: `Class ${mark.class}-${mark.section}`
        });
      }
    });
    return Array.from(uniqueClassSections.values());
  }, [allMarks]);

  const marksByClassSection = useMemo(() => {
    const grouped: { [key: string]: Mark[] } = {};
    if (!allMarks) return grouped;
    classSections.forEach(cs => {
      grouped[cs.id] = allMarks.filter(mark => `${mark.class}-${mark.section}` === cs.id);
    });
    return grouped;
  }, [allMarks, classSections]);

  if (isUserLoading || isMarksLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect('/login');
  }

  if (!allMarks || allMarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Card className="w-full max-w-md">
              <CardHeader>
                  <CardTitle>No Reports Found</CardTitle>
                  <CardDescription>
                      It looks like you haven't uploaded any student data yet. Upload a data file to generate and view reports.
                  </CardDescription>
              </CardHeader>
              <CardContent>
                  <Button asChild>
                      <Link href="/upload">
                          <Upload className="mr-2 h-4 w-4" /> Go to Upload Page
                      </Link>
                  </Button>
              </CardContent>
          </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      {classSections.length > 0 && (
        <Tabs defaultValue={classSections[0].id}>
          <TabsList>
            {classSections.map(cs => (
              <TabsTrigger key={cs.id} value={cs.id}>{cs.name}</TabsTrigger>
            ))}
          </TabsList>
          {classSections.map(cs => (
            <TabsContent key={cs.id} value={cs.id} className="mt-4">
              <Dashboard studentData={marksByClassSection[cs.id] || []} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
