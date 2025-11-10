
'use client';

import { getStudentData, calculateStatistics } from '@/lib/data';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import StudentsChart from '@/components/dashboard/students-chart';
import StudentsTable from '@/components/dashboard/students-table';
import { useEffect, useState } from 'react';
import type { Student } from '@/lib/data';

type Stats = {
  mean: number;
  median: number;
  mode: number | null;
  max: number;
  min: number;
};

interface DashboardProps {
  studentData: Student[];
}

export default function Dashboard({ studentData }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<{ name: string; marks: number }[]>([]);

  useEffect(() => {
    if (studentData) {
      const calculatedStats = calculateStatistics(studentData);
      const newChartData = studentData.map(s => ({ name: s.name, marks: s.marks }));
      
      setStats(calculatedStats);
      setChartData(newChartData);
    }
  }, [studentData]);

  if (!stats) {
    return <div>Loading dashboard data...</div>; // Or a spinner
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StudentsChart data={chartData} />
        </div>
        <div>
          <StudentsTable data={studentData} />
        </div>
      </div>
    </div>
  );
}
