
'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useFirestore, useUser, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type StudentMark = {
  id: string; // Use string for IDs coming from edit mode
  studentName: string;
  marks: string;
};

const classOptions = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const sectionOptions = ["A", "B", "C", "D", "E", "F"];
const subjectOptions = [
  "Mathematics", "Science", "English", "Social Studies", "History", "Geography", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Hindi", "Art", 
  "Music", "Physical Education"
];


export function DataInputSheet() {
  const [data, setData] = useState<StudentMark[]>([]);
  const [nextId, setNextId] = useState(1);
  const [classValue, setClassValue] = useState("");
  const [sectionValue, setSectionValue] = useState("");
  const [subjectValue, setSubjectValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Check for edit state in localStorage on component mount
    const editDataString = localStorage.getItem('editReportData');
    if (editDataString) {
      try {
        const editData = JSON.parse(editDataString);
        setClassValue(editData.classValue || "");
        setSectionValue(editData.sectionValue || "");
        setSubjectValue(editData.subjectValue || "");
        setData(editData.data.map((d: any, i: number) => ({...d, id: d.id || `edit-${i}`})) || []);
        setNextId((editData.data?.length || 0) + 1);
        toast({ title: "Editing Mode", description: "You are editing an existing report. Save your changes to update it." });
      } catch (e) {
        console.error("Failed to parse edit data from localStorage", e);
      } finally {
        // Clear the data from localStorage after loading it
        localStorage.removeItem('editReportData');
      }
    }
  }, [toast]);


  const handleInputChange = (id: string | number, field: 'studentName' | 'marks', value: string) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    const newId = `new-${nextId}`;
    setData(currentData => [
      ...currentData,
      { id: newId, studentName: "", marks: "" },
    ]);
    setNextId(prevId => prevId + 1);
  };

  const removeRow = (id: string | number) => {
    setData(currentData => currentData.filter(row => row.id !== id));
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast({
        variant: "destructive",
        title: "File Error",
        description: "No file selected.",
      });
      return;
    }

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data
          .map((row, index) => {
            const studentName = row.studentName || row.StudentName || row.name || row.Name;
            const marks = row.marks || row.Marks || row.score || row.Score;

            if (studentName && marks) {
              return {
                id: `csv-${nextId + index}`,
                studentName: String(studentName),
                marks: String(marks),
              };
            }
            return null;
          })
          .filter((row): row is StudentMark => row !== null && !!row.studentName && !!row.marks);

        if (parsedData.length === 0) {
            toast({
                variant: "destructive",
                title: "Parsing Error",
                description: "Could not parse valid 'studentName' and 'marks' columns from the CSV. Please check the file.",
            });
            return;
        }

        setData(currentData => [...currentData, ...parsedData]);
        setNextId(prevId => prevId + parsedData.length);
        toast({
          title: "Upload Successful",
          description: `${parsedData.length} rows have been added from the CSV.`,
        });
      },
      error: (error) => {
        toast({
          variant: "destructive",
          title: "CSV Parsing Error",
          description: error.message,
        });
      },
    });

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!firestore || !user) {
      toast({ variant: "destructive", title: "Error", description: "Could not connect to the database." });
      return;
    }
    if (!classValue || !sectionValue || !subjectValue) {
      toast({ variant: "destructive", title: "Validation Error", description: "Please provide a class, section, and subject." });
      return;
    }
    if(data.length === 0) {
      toast({ variant: "destructive", title: "No Data", description: "There is no data to save." });
      return;
    }

    const schoolId = "school-1";
    const marksCollection = collection(firestore, `schools/${schoolId}/marks`);
    const batch = writeBatch(firestore);
    
    let hasValidData = false;
    data.forEach(row => {
        if (row.studentName && row.marks) {
            hasValidData = true;
            const markId = typeof row.id === 'string' && row.id.startsWith('edit-') ? row.id.substring(5) : doc(marksCollection).id;
            const docRef = doc(marksCollection, markId);
            const markData = {
                id: markId,
                schoolId: schoolId,
                studentId: `${schoolId}-${classValue}-${sectionValue}-${row.studentName.toLowerCase().replace(/\s+/g, '-')}`,
                studentName: row.studentName,
                class: classValue,
                section: sectionValue,
                subject: subjectValue,
                marks: Number(row.marks),
                dateTaken: new Date().toISOString(),
            };
            batch.set(docRef, markData, { merge: true });
        }
    });

    if (!hasValidData) {
        toast({ variant: "destructive", title: "No Data", description: "No valid rows to save." });
        return;
    }

    try {
        await batch.commit();
        toast({
            title: "Data Saved",
            description: "The student data has been successfully saved.",
        });
        setData([]);
        setNextId(1);
        handleViewReport();
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
          path: `schools/${schoolId}/marks`,
          operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };
  
  const handleViewReport = () => {
      router.push('/');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Entry Sheet</CardTitle>
        <CardDescription>
          Specify the class, section, and subject, then add student records or upload a CSV with 'studentName' and 'marks' columns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex flex-wrap gap-2 items-center">
                <Select value={classValue} onValueChange={setClassValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={sectionValue} onValueChange={setSectionValue}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={subjectValue} onValueChange={setSubjectValue}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleSave} size="sm" className="bg-primary text-primary-foreground shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <FileCheck className="mr-2" />
                    Generate Report
                </Button>
                <Button onClick={handleViewReport} size="sm" variant="outline">
                    View Dashboard
                </Button>
          </div>
        </div>
        <div className="flex justify-start items-center mb-4">
          <div className="flex gap-2">
            <Button onClick={addRow} size="sm" variant="default" className="bg-violet-600 hover:bg-violet-700">
              <PlusCircle className="mr-2" />
              Add Row
            </Button>
            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileUpload}
                accept=".csv"
            />
            <Button onClick={triggerFileUpload} size="sm" variant="default" className="bg-violet-600 hover:bg-violet-700">
                <Upload className="mr-2" />
                Upload CSV
            </Button>
          </div>
        </div>
        <div className="overflow-auto rounded-md border" style={{maxHeight: '60vh'}}>
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50">
              <TableRow>
                <TableHead className="w-[70%]">Student Name</TableHead>
                <TableHead className="w-[20%]">Marks</TableHead>
                <TableHead className="w-[10%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(row => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Input
                      value={row.studentName}
                      onChange={e => handleInputChange(row.id, "studentName", e.target.value)}
                      placeholder="e.g. John Doe"
                      className="border-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={row.marks}
                      onChange={e => handleInputChange(row.id, "marks", e.target.value)}
                      placeholder="e.g. 95"
                      className="border-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRow(row.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                      <span className="sr-only">Remove row</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
         {data.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                <p>The table is empty. Click "Add Row" or "Upload CSV" to get started.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
