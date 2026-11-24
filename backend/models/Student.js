import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    gradeLevel: {
      type: String,
      default: 'Undergraduate'
    },
    department: {
      type: String,
      default: 'General Sciences'
    },
    dateOfBirth: {
      type: Date
    },
    guardianName: {
      type: String,
      default: ''
    },
    guardianPhone: {
      type: String,
      default: ''
    },
    enrollmentDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'graduated', 'suspended'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
