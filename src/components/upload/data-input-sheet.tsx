
'use client';

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, FileCheck, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import * as XLSX from 'xlsx';
import { useFirestore, useUser, FirestorePermissionError, errorEmitter } from "@/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  
  const clearAllRows = () => {
    setData([]);
    setNextId(1);
    toast({
        title: "Sheet Cleared",
        description: "All rows have been removed.",
    });
  };

  const processParsedData = (parsedData: any[]) => {
      const formattedData = parsedData
        .map((row, index) => {
          const studentName = row.studentName;
          const marks = row.marks;

          if (studentName && marks) {
            return {
              id: `file-${nextId + index}`,
              studentName: String(studentName),
              marks: String(marks),
            };
          }
          return null;
        })
        .filter((row): row is StudentMark => row !== null && !!row.studentName && !!row.marks);

      if (formattedData.length === 0) {
          toast({
              variant: "destructive",
              title: "Parsing Error",
              description: "Could not parse valid 'studentName' and 'marks' columns from the file. Please check the file and column headers.",
          });
          return;
      }

      setData(currentData => [...currentData, ...formattedData]);
      setNextId(prevId => prevId + formattedData.length);
      toast({
        title: "Upload Successful",
        description: `${formattedData.length} rows have been added from the file.`,
      });
  }

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

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
          const text = e.target?.result;
          Papa.parse<any>(text as string, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              processParsedData(results.data);
            },
            error: (error) => {
              toast({
                variant: "destructive",
                title: "CSV Parsing Error",
                description: error.message,
              });
            },
          });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                processParsedData(json);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Excel Parsing Error",
                    description: error.message || "Failed to parse the Excel file.",
                });
            }
        };
        reader.readAsArrayBuffer(file);
    } else {
        toast({
            variant: "destructive",
            title: "Unsupported File Type",
            description: "Please upload a .csv or .xlsx file.",
        });
    }

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
            let markId;
            // If the ID is from an existing document being edited, use it. Otherwise, generate a new one.
            if (typeof row.id === 'string' && !row.id.startsWith('new-') && !row.id.startsWith('csv-') && !row.id.startsWith('file-')) {
              markId = row.id;
            } else {
              markId = doc(marksCollection).id;
            }
            
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

  const downloadTemplate = () => {
    const csvHeader = "studentName,marks\n";
    const csvRows = [
      "Amelia Johnson,88",
      "Benjamin Carter,92",
      "Chloe Davis,78",
      "Daniel Evans,85",
      "Evelyn Foster,95",
      "Finn Garcia,81",
      "Grace Hall,89",
      "Henry Irving,76",
      "Isabella Jackson,99",
      "Jack King,83",
    ];
    const csvContent = csvHeader + csvRows.join("\n") + "\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "student_marks_template.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Entry Sheet</CardTitle>
        <CardDescription>
          Specify the class, section, and subject, then add student records or upload a CSV/XLSX file with 'studentName' and 'marks' columns.
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
        <div className="flex justify-between items-center mb-4">
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
                accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            />
            <Button onClick={triggerFileUpload} size="sm" variant="default" className="bg-violet-600 hover:bg-violet-700">
                <Upload className="mr-2" />
                Upload File
            </Button>
            {data.length > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive">
                            <XCircle className="mr-2" />
                            Clear All
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action will permanently remove all rows from the sheet. This cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={clearAllRows}>Clear</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
          </div>
          <Button onClick={downloadTemplate} size="sm" variant="link">
              Download CSV Template
          </Button>
        </div>
        <div className="overflow-auto rounded-md border" style={{maxHeight: '40vh'}}>
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
                <p>The table is empty. Click "Add Row" or "Upload File" to get started.</p>
            </div>
        )}
        <div className="mt-8">
            <h3 className="text-lg font-medium mb-2">File Upload Format Example</h3>
            <div className="border rounded-md p-4 bg-muted/50 w-full max-w-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold text-foreground">studentName</TableHead>
                            <TableHead className="font-semibold text-foreground">marks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>John Doe</TableCell>
                            <TableCell>95</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Jane Smith</TableCell>
                            <TableCell>88</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    