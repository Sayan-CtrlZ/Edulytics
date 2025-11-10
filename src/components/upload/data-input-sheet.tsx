
'use client';

import { useState, useRef, ChangeEvent } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

type StudentMark = {
  id: number;
  studentName: string;
  subject: string;
  marks: string;
};

export function DataInputSheet() {
  const [data, setData] = useState<StudentMark[]>([
    { id: 1, studentName: "Alice Johnson", subject: "Mathematics", marks: "88" },
  ]);
  const [nextId, setNextId] = useState(2);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleInputChange = (id: number, field: keyof StudentMark, value: string) => {
    setData(currentData =>
      currentData.map(row => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setData(currentData => [
      ...currentData,
      { id: nextId, studentName: "", subject: "", marks: "" },
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
            const subject = row.subject || row.Subject;
            const marks = row.marks || row.Marks || row.score || row.Score;

            if (studentName && subject && marks) {
              return {
                id: nextId + index,
                studentName: String(studentName),
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

  const handleSave = () => {
    // Here you would typically send the data to your backend/server action
    console.log("Saving data:", data);
    toast({
      title: "Data Saved",
      description: "The student data has been successfully saved.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Entry Sheet</CardTitle>
        <CardDescription>
          Manually add student records or upload a CSV with columns: studentName, subject, marks.
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
                <TableHead className="w-[40%]">Student Name</TableHead>
                <TableHead className="w-[30%]">Subject</TableHead>
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
