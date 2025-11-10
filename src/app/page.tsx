
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase, errorEmitter, FirestorePermissionError } from '@/firebase';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';

type ReportStructure = {
  [className: string]: {
    [section: string]: {
      [subject: string]: Mark[];
    };
  };
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

  const [activeClassTab, setActiveClassTab] = useState<string | undefined>();

  const { reportData, classes } = useMemo(() => {
    if (!allMarks) return { reportData: {}, classes: [] };
    
    const data: ReportStructure = {};
    allMarks.forEach(mark => {
      const { class: className, section, subject } = mark;
      if (!data[className]) {
        data[className] = {};
      }
      if (!data[className][section]) {
        data[className][section] = {};
      }
      if (!data[className][section][subject]) {
        data[className][section][subject] = [];
      }
      data[className][section][subject].push(mark);
    });

    const classNames = Object.keys(data).sort();
    if (classNames.length > 0 && (!activeClassTab || !classNames.includes(activeClassTab))) {
      setActiveClassTab(classNames[0]);
    } else if (classNames.length === 0) {
      setActiveClassTab(undefined);
    }
    
    return { reportData: data, classes: classNames };
  }, [allMarks, activeClassTab]);

  const handleDeleteClassReport = async (classToDelete: string) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Cannot connect to database.' });
      return;
    }
    const marksCollectionRef = collection(firestore, `schools/${schoolId}/marks`);
    const q = query(marksCollectionRef, where("class", "==", classToDelete));
    
    try {
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        toast({ title: 'Info', description: 'No documents found to delete.' });
        return;
      }
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();

      toast({ title: 'Success', description: `All reports for Class ${classToDelete} have been deleted.` });
    } catch (error) {
       const permissionError = new FirestorePermissionError({
        path: `schools/${schoolId}/marks`,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    }
  };

  const handleDeleteStudentMark = async (markId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, `schools/${schoolId}/marks`, markId);
    deleteDoc(docRef)
      .catch((error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (isUserLoading || isMarksLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    redirect('/login');
  }

  if (error) {
    return null;
  }

  if (!allMarks || allMarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
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
      
      {classes.length > 0 && (
        <Tabs value={activeClassTab} onValueChange={setActiveClassTab}>
          <TabsList className="relative flex flex-wrap h-auto justify-start">
            {classes.map(className => (
              <div key={className} className="relative group pr-8">
                <TabsTrigger value={className}>{`Class ${className}`}</TabsTrigger>
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
                        This will permanently delete all reports for {`Class ${className}`}. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteClassReport(className)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </TabsList>
          {classes.map(className => (
            <TabsContent key={className} value={className} className="mt-4">
              <Accordion type="single" collapsible className="w-full">
                {Object.keys(reportData[className]).sort().map(section => (
                  <AccordionItem key={section} value={section}>
                    <AccordionTrigger className="text-xl font-semibold">{`Section ${section}`}</AccordionTrigger>
                    <AccordionContent className="pl-4">
                      {Object.keys(reportData[className][section]).sort().map(subject => (
                        <div key={subject} className="mb-8">
                          <h3 className="text-2xl font-bold tracking-tight mb-4">{subject}</h3>
                          <Dashboard 
                            studentData={reportData[className][section][subject] || []} 
                            onDeleteStudent={handleDeleteStudentMark} 
                          />
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
