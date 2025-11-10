
import type { DocumentData } from 'firebase/firestore';

export type Student = {
  id: string;
  name: string;
  class: string;
  section: string;
  subject: string;
  marks: number;
};

export type Mark = {
  id: string;
  schoolId: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  subject: string;
  marks: number;
  dateTaken: string;
} & DocumentData;

export function calculateStatistics(data: Mark[]) {
  if (data.length === 0) {
    return { mean: 0, median: 0, mode: null, max: 0, min: 0 };
  }
  
  const marks = data.map(s => s.marks);
  
  const mean = marks.reduce((a, b) => a + b, 0) / marks.length;
  
  const sortedMarks = [...marks].sort((a, b) => a - b);
  const mid = Math.floor(sortedMarks.length / 2);
  const median = sortedMarks.length % 2 !== 0 ? sortedMarks[mid] : (sortedMarks[mid - 1] + sortedMarks[mid]) / 2;

  const modeMap = new Map<number, number>();
  let maxFreq = 0;
  let mode: number | null = null;
  for (const mark of marks) {
    const freq = (modeMap.get(mark) || 0) + 1;
    modeMap.set(mark, freq);
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = mark;
    }
  }

  return {
    mean: Math.round(mean * 100) / 100,
    median,
    mode: mode,
    max: Math.max(...marks),
    min: Math.min(...marks),
  };
}
