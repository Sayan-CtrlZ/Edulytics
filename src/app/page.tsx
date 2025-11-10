
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { redirect } from 'next/navigation';
import Dashboard from '@/components/dashboard/dashboard';
import { useMemo, useState } from 'react';
import type { Mark } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, writeBatch, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Upload, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type ClassSection = {
  id: string;
  name: string;
  class: string;
  section: string;
};

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const schoolId = "school-1"; 
  
  const marksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, `schools/${schoolId}/marks`);
  }, [firestore, schoolId]);

  const { data: allMarks, isLoading: isMarksLoading, error } = useCollection<Mark>(marksQuery);

  const [activeTab, setActiveTab] = useState<string | undefined>();
  
  const classSections = useMemo(() => {
    if (!allMarks) return [];
    const uniqueClassSections = new Map<string, ClassSection>();
    allMarks.forEach(mark => {
      const classSectionId = `${mark.class}-${mark.section}`;
      if (!uniqueClassSections.has(classSectionId)) {
        uniqueClassSections.set(classSectionId, {
          id: classSectionId,
          name: `Class ${mark.class}-${mark.section}`,
          class: mark.class,
          section: mark.section,
        });
      }
    });
    const sections = Array.from(uniqueClassSections.values());
    if (sections.length > 0 && !activeTab) {
      setActiveTab(sections[0].id);
    } else if (sections.length === 0) {
      setActiveTab(undefined);
    }
    return sections;
  }, [allMarks, activeTab]);

  const marksByClassSection = useMemo(() => {
    const grouped: { [key: string]: Mark[] } = {};
    if (!allMarks) return grouped;
    classSections.forEach(cs => {
      grouped[cs.id] = allMarks.filter(mark => `${mark.class}-${mark.section}` === cs.id);
    });
    return grouped;
  }, [allMarks, classSections]);

  const handleDeleteClassReport = async (classToDelete: string, sectionToDelete: string) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot connect to database.' });
      return;
    }
    const marksCollectionRef = collection(firestore, `schools/${schoolId}/marks`);
    const q = query(marksCollectionRef, where("class", "==", classToDelete), where("section", "==", sectionToDelete));
    
    try {
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      toast({ title: 'Success', description: `Report for Class ${classToDelete}-${sectionToDelete} has been deleted.` });
    } catch (error) {
      console.error("Error deleting class report:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the class report.' });
    }
  };

  const handleDeleteStudentMark = async (markId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, `schools/${schoolId}/marks`, markId));
      toast({ title: 'Success', description: 'Student mark deleted.' });
    } catch (error) {
      console.error("Error deleting student mark:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the student mark.' });
    }
  };

  if (isUserLoading || isMarksLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect('/login');
  }

  if (error) {
    return <div>Error loading data. Please check console.</div>
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="relative">
            {classSections.map(cs => (
              <div key={cs.id} className="relative group pr-8">
                <TabsTrigger value={cs.id}>{cs.name}</TabsTrigger>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute top-1/2 right-1 -translate-y-1/2 h-6 w-6 opacity-50 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the entire report for {cs.name}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClassReport(cs.class, cs.section)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </TabsList>
          {classSections.map(cs => (
            <TabsContent key={cs.id} value={cs.id} className="mt-4">
              <Dashboard 
                studentData={marksByClassSection[cs.id] || []} 
                onDeleteStudent={handleDeleteStudentMark} 
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
