
'use client';

import { useUser } from '@/firebase';
import { redirect } from 'next/navigation';
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

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<{ name: string; marks: number }[]>([]);

  useEffect(() => {
    async function fetchData() {
      const studentData = await getStudentData();
      const calculatedStats = calculateStatistics(studentData);
      const newChartData = studentData.map(s => ({ name: s.name, marks: s.marks }));
      
      setStudents(studentData);
      setStats(calculatedStats);
      setChartData(newChartData);
    }
    fetchData();
  }, []);

  if (isUserLoading) {
    return <div>Loading...</div>; // Or a spinner
  }

  if (!user) {
    redirect('/login');
  }

  if (!stats) {
    return <div>Loading dashboard data...</div>; // Or a spinner
  }


  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StudentsChart data={chartData} />
        </div>
        <div>
          <StudentsTable data={students} />
        </div>
      </div>
    </div>
  );
}
