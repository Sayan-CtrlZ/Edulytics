
export type Student = {
  id: string;
  name: string;
  class: string;
  section: string;
  subject: string;
  marks: number;
};

const mockStudents: Student[] = [
  { id: '1', name: 'Alice Johnson', class: '10', section: 'A', subject: 'Mathematics', marks: 88 },
  { id: '2', name: 'Bob Williams', class: '10', section: 'A', subject: 'Mathematics', marks: 92 },
  { id: '3', name: 'Charlie Brown', class: '10', section: 'A', subject: 'Mathematics', marks: 76 },
  { id: '4', name: 'Diana Miller', class: '10', section: 'A', subject: 'Mathematics', marks: 95 },
  { id: '5', name: 'Ethan Davis', class: '10', section: 'A', subject: 'Mathematics', marks: 81 },
  { id: '6', name: 'Fiona Garcia', class: '10', section: 'B', subject: 'Mathematics', marks: 85 },
  { id: '7', name: 'George Rodriguez', class: '10', section: 'B', subject: 'Mathematics', marks: 79 },
  { id: '8', name: 'Hannah Martinez', class: '10', section: 'B', subject: 'Mathematics', marks: 99 },
  { id: '9', name: 'Ian Hernandez', class: '10', section: 'B', subject: 'Mathematics', marks: 83 },
  { id: '10', name: 'Jane Lopez', class: '10', section: 'B', subject: 'Mathematics', marks: 90 },
];

export async function getStudentData(): Promise<Student[]> {
  // In a real app, this would fetch data from Firestore.
  return new Promise(resolve => setTimeout(() => resolve(mockStudents), 500));
}

export function calculateStatistics(data: Student[]) {
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
