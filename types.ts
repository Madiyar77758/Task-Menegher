export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  dueDate?: string; // ISO String
  subtasks: SubTask[];
  createdAt: number;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface AITaskParseResult {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
}

export type FilterType = 'ALL' | 'ACTIVE' | 'COMPLETED';