import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  repassword: {
    type: String,
    required: true,
  },
  encKey: {
    type: String,
    required: true,
  },
  isDeleted: Boolean,
  deletedAt: Boolean || null,
}, {
  timestamps: true
});
const User = model('User', userSchema);
export default User;