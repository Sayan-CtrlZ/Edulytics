"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import type { Mark } from "@/lib/data";

type ChartView = "students" | "subjects";

interface StudentsChartProps {
  data: Mark[];
}

export default function StudentsChart({ data }: StudentsChartProps) {
  const [view, setView] = useState<ChartView>("students");

  const chartData = useMemo(() => {
    if (view === "students") {
      return data.map((s) => ({ name: s.studentName, value: s.marks, type: "Marks" }));
    } else { // view === 'subjects'
      const subjectData: { [key: string]: { total: number; count: number } } = {};
      data.forEach(item => {
        if (!subjectData[item.subject]) {
          subjectData[item.subject] = { total: 0, count: 0 };
        }
        subjectData[item.subject].total += item.marks;
        subjectData[item.subject].count += 1;
      });
      return Object.entries(subjectData).map(([subject, { total, count }]) => ({
        name: subject,
        value: parseFloat((total / count).toFixed(2)),
        type: "Average"
      }));
    }
  }, [data, view]);

  const chartConfig = {
    value: {
      label: view === "students" ? "Marks" : "Average Marks",
      color: "hsl(var(--primary))",
    },
  };

  const description = view === 'students' 
    ? 'A bar chart showing marks for each student.'
    : 'A bar chart showing the average mark for each subject.';
    
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant={view === 'students' ? 'default' : 'outline'} size="sm" onClick={() => setView('students')}>
                    By Student
                </Button>
                <Button variant={view === 'subjects' ? 'default' : 'outline'} size="sm" onClick={() => setView('subjects')}>
                    By Subject
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => view === 'students' ? value.slice(0, 3) : value}
            />
            <YAxis />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name, props) => {
                  return (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold">{props.payload.name}</span>
                      <span>{props.payload.type}: {value}</span>
                    </div>
                  )
                }}
                indicator="dot" 
                hideLabel
              />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
