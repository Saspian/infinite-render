export interface TaskType {
  text: string;
  completed: boolean;
  dueDate: string;
  isDeleted: boolean;
  deletedAt: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}
