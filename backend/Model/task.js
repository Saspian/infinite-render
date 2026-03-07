import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const taskSchema = new Schema({
  text: String,
  completed: Boolean,
  dueDate: String,
  order: Number || null,
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
  },
  isDeleted: Boolean,
  deletedAt: Boolean || null,
}, {
  timestamps: true
});
const Task = model('Task', taskSchema);
export default Task;