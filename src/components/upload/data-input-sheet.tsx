
'use client';

import { useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, Save, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useFirestore, useUser, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";

type StudentMark = {
  id: number;
  studentName: string;
  marks: string;
};

export function DataInputSheet() {
  const [data, setData] = useState<StudentMark[]>([]);
  const [nextId, setNextId] = useState(1);
  const [classValue, setClassValue] = useState("");
  const [sectionValue, setSectionValue] = useState("");
  const [subjectValue, setSubjectValue] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const router = useRouter();


  const handleInputChange = (id: number, field: 'studentName' | 'marks', value: string) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
    setIsSaved(false);
  };

  const addRow = () => {
    setData(currentData => [
      ...currentData,
      { id: nextId, studentName: "", marks: "" },
    ]);
    setNextId(prevId => prevId + 1);
    setIsSaved(false);
  };

  const removeRow = (id: number) => {
    setData(currentData => currentData.filter(row => row.id !== id));
    setIsSaved(false);
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
                id: nextId + index,
                studentName: String(studentName),
                marks: String(marks),
              };
            }
            return null;
          })
          .filter((row): row is StudentMark => row !== null);

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
        setIsSaved(false);
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
            const newMarkRef = doc(marksCollection);
            const markData = {
                id: newMarkRef.id,
                schoolId: schoolId,
                studentId: `${schoolId}-${classValue}-${sectionValue}-${row.studentName.toLowerCase().replace(/\s+/g, '-')}`,
                studentName: row.studentName,
                class: classValue,
                section: sectionValue,
                subject: subjectValue,
                marks: Number(row.marks),
                dateTaken: new Date().toISOString(),
            };
            batch.set(newMarkRef, markData);
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
        setIsSaved(true);
        setData([]);
        setNextId(1);
    } catch (error: any) {
        const permissionError = new FirestorePermissionError({
          path: `schools/${schoolId}/marks`,
          operation: 'create',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
  };
  
  const handleGenerateReport = () => {
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
                <Input
                    value={classValue}
                    onChange={e => { setClassValue(e.target.value); setIsSaved(false); }}
                    placeholder="Class (e.g., 10)"
                    className="w-32"
                />
                <Input
                    value={sectionValue}
                    onChange={e => { setSectionValue(e.target.value); setIsSaved(false); }}
                    placeholder="Section (e.g., A)"
                    className="w-32"
                />
                 <Input
                    value={subjectValue}
                    onChange={e => { setSubjectValue(e.target.value); setIsSaved(false); }}
                    placeholder="Subject (e.g., Mathematics)"
                    className="w-48"
                />
            </div>
            <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                    <Save className="mr-2" />
                    Save Data
                </Button>
                <Button onClick={handleGenerateReport} size="sm" variant="default">
                    <FileCheck className="mr-2" />
                    View Report
                </Button>
          </div>
        </div>
        <div className="flex justify-start items-center mb-4">
          <div className="flex gap-2">
            <Button onClick={addRow} size="sm" variant="default" className="bg-primary hover:bg-primary/90">
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
            <Button onClick={triggerFileUpload} size="sm" variant="default" className="bg-primary hover:bg-primary/90">
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
