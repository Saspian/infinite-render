export interface TaskType {
  _id: string;
  text: string;
  completed?: boolean;
  dueDate?: string;
  isDeleted?: boolean;
  deletedAt?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
  order: number;
  priority: Priority,
}

export type Priority = 'high' | 'medium' | 'low';
