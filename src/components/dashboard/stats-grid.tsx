
import { StatsCard } from "./stats-card";
import { ArrowDownUp, Calculator, Check, TrendingUp, TrendingDown } from "lucide-react";

interface StatsGridProps {
  stats: {
    mean: number;
    median: number;
    mode: number | null;
    max: number;
    min: number;
  };
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatsCard title="Mean" value={stats.mean} icon={Calculator} />
      <StatsCard title="Median" value={stats.median} icon={ArrowDownUp} />
      <StatsCard title="Mode" value={stats.mode ?? 'N/A'} icon={Check} />
      <StatsCard title="Max Score" value={stats.max} icon={TrendingUp} />
      <StatsCard title="Min Score" value={stats.min} icon={TrendingDown} />
    </div>
  );
}
