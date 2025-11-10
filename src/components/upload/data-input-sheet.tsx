
'use client';

import { useState, useRef, ChangeEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { useFirestore, useUser } from "@/firebase";
import { collection, writeBatch, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

type StudentMark = {
  id: number;
  studentName: string;
  class: string;
  section: string;
  subject: string;
  marks: string;
};

export function DataInputSheet() {
  const [data, setData] = useState<StudentMark[]>([
    { id: 1, studentName: "Alice Johnson", class: "10", section: "A", subject: "Mathematics", marks: "88" },
  ]);
  const [nextId, setNextId] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const handleInputChange = (id: number, field: keyof StudentMark, value: string) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setData(currentData => [
      ...currentData,
      { id: nextId, studentName: "", class: "", section: "", subject: "", marks: "" },
    ]);
    setNextId(prevId => prevId + 1);
  };

  const removeRow = (id: number) => {
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
            // Basic validation for common header names
            const studentName = row.studentName || row.StudentName || row.name || row.Name;
            const studentClass = row.class || row.Class;
            const section = row.section || row.Section;
            const subject = row.subject || row.Subject;
            const marks = row.marks || row.Marks || row.score || row.Score;

            if (studentName && subject && marks && studentClass && section) {
              return {
                id: nextId + index,
                studentName: String(studentName),
                class: String(studentClass),
                section: String(section),
                subject: String(subject),
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
                description: "Could not parse student data from the CSV. Please check the file format and headers.",
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

    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!firestore || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not connect to the database. Please try again.",
      });
      return;
    }

    const schoolId = "school-1"; // Hardcoded for now
    const marksCollection = collection(firestore, `schools/${schoolId}/marks`);
    const batch = writeBatch(firestore);

    data.forEach(row => {
        if (row.studentName && row.subject && row.marks) {
            const newMarkRef = doc(marksCollection);
            const markData = {
                id: newMarkRef.id,
                schoolId: schoolId,
                studentId: row.studentName.toLowerCase().replace(/\s+/g, '-'), // simple ID generation
                studentName: row.studentName,
                class: row.class,
                section: row.section,
                subject: row.subject,
                marks: Number(row.marks),
                dateTaken: new Date().toISOString(),
            };
            batch.set(newMarkRef, markData);
        }
    });

    try {
        await batch.commit();
        toast({
            title: "Data Saved",
            description: "The student data has been successfully saved.",
        });
        // Optionally clear the table after saving
        setData([]);
        setNextId(1);

    } catch (error: any) {
        console.error("Error saving data:", error);
        toast({
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: "Could not save the data. Please try again.",
        });
    }
};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Entry Sheet</CardTitle>
        <CardDescription>
          Manually add student records or upload a CSV with columns: studentName, class, section, subject, marks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button onClick={addRow} size="sm">
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
            <Button onClick={triggerFileUpload} size="sm" variant="outline">
                <Upload className="mr-2" />
                Upload CSV
            </Button>
          </div>
          <Button onClick={handleSave} size="sm" variant="default">
            <Save className="mr-2" />
            Save Data
          </Button>
        </div>
        <div className="overflow-auto rounded-md border" style={{maxHeight: '60vh'}}>
          <Table>
            <TableHeader className="sticky top-0 bg-muted/50">
              <TableRow>
                <TableHead className="w-[30%]">Student Name</TableHead>
                <TableHead className="w-[15%]">Class</TableHead>
                <TableHead className="w-[15%]">Section</TableHead>
                <TableHead className="w-[20%]">Subject</TableHead>
                <TableHead className="w-[10%]">Marks</TableHead>
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
                      value={row.class}
                      onChange={e => handleInputChange(row.id, "class", e.target.value)}
                      placeholder="e.g. 10"
                      className="border-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.section}
                      onChange={e => handleInputChange(row.id, "section", e.target.value)}
                      placeholder="e.g. A"
                      className="border-none focus-visible:ring-1"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={row.subject}
                      onChange={e => handleInputChange(row.id, "subject", e.target.value)}
                      placeholder="e.g. Science"
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
