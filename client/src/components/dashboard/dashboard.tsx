
'use client';

import { calculateStatistics } from '@/lib/data';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import StudentsChart from '@/components/dashboard/students-chart';
import StudentsTable from '@/components/dashboard/students-table';
import { useEffect, useState } from 'react';
import type { Mark } from '@/lib/data';

type Stats = {
  mean: number;
  median: number;
  mode: number | null;
  max: number;
  min: number;
};

interface DashboardProps {
  studentData: Mark[];
  onDeleteStudent: (markId: string) => void;
}

export default function Dashboard({ studentData, onDeleteStudent }: DashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (studentData && studentData.length > 0) {
      const calculatedStats = calculateStatistics(studentData);
      setStats(calculatedStats);
    } else {
      setStats(null);
    }
  }, [studentData]);

  if (!studentData || studentData.length === 0) {
    return (
        <div className="text-center p-8 text-muted-foreground">
            <h2 className="text-xl font-semibold mb-2">No Data Available</h2>
            <p>There is no student data for this class yet. Go to the "Upload Data" page to add records.</p>
        </div>
    )
  }

  if (!stats) {
    return <div>Loading dashboard data...</div>; // Or a spinner
  }

  return (
    <div className="flex flex-col gap-8">
      <StatsGrid stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <StudentsChart data={studentData} />
        </div>
        <div>
          <StudentsTable data={studentData} onDelete={onDeleteStudent} />
        </div>
      </div>
    </div>
  );
}
