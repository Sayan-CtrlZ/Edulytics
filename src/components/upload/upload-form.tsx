
"use client";

import { useActionState, useFormStatus } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadFile, type FormState } from "@/lib/actions";
import { CheckCircle, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Uploading & Analyzing..." : "Upload File"}
    </Button>
  );
}

export function UploadForm() {
  const initialState: FormState = { message: "" };
  const [state, dispatch] = useActionState(uploadFile, initialState);

  return (
    <div className="space-y-6">
      <form action={dispatch} className="space-y-4">
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="file">Student Data File</Label>
          <Input id="file" name="file" type="file" required accept=".csv,.xlsx" />
        </div>
        <SubmitButton />
      </form>

      {state.message && (
        <Alert variant={state.stats ? "default" : "destructive"} className={state.stats ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" : ""}>
          {state.stats ? <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" /> : <Terminal className="h-4 w-4" />}
          <AlertTitle className={state.stats ? "text-green-800 dark:text-green-300": ""}>{state.stats ? "Success" : "Upload Error"}</AlertTitle>
          <AlertDescription className={state.stats ? "text-green-700 dark:text-green-400": ""}>{state.message}</AlertDescription>
        </Alert>
      )}

      {state.stats && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mean</span>
              <span className="font-medium">{state.stats.mean}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Median</span>
              <span className="font-medium">{state.stats.median}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium">{state.stats.mode}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Max Score</span>
              <span className="font-medium">{state.stats.max}</span>
            </div>
            <Separator />
             <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Min Score</span>
              <span className="font-medium">{state.stats.min}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
