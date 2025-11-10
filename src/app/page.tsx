
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getStudentData, calculateStatistics } from '@/lib/data';

import { StatsGrid } from '@/components/dashboard/stats-grid';
import StudentsChart from '@/components/dashboard/students-chart';
import StudentsTable from '@/components/dashboard/students-table';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const students = await getStudentData();
  const stats = calculateStatistics(students);
  const chartData = students.map(s => ({ name: s.name, marks: s.marks }));

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
