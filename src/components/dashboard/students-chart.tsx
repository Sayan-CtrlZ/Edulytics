
"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
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
import type { Mark } from "@/lib/data";
import { useTheme } from "next-themes";

interface StudentsChartProps {
  data: Mark[];
}

export default function StudentsChart({ data }: StudentsChartProps) {
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    return data.map((s) => ({ name: s.studentName, value: s.marks, type: "Marks" }));
  }, [data]);
  
  const chartConfig = {
    value: {
      label: "Marks",
      color: "hsl(var(--primary))",
    },
  };

  const description = 'A bar chart showing marks for each student.';
    
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Student Performance</CardTitle>
                <CardDescription>{description}</CardDescription>
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
              tickFormatter={(value) => value.slice(0, 3)}
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
            <Legend />
            <Bar dataKey="value" fill={theme === 'dark' ? "hsl(var(--chart-1))" : "hsl(var(--primary))"} radius={4} name="Marks" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

    