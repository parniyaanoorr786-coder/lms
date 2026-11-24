import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    teacherId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: [true, 'Please specify department']
    },
    qualification: {
      type: String,
      default: "Master's Degree"
    },
    specialization: {
      type: String,
      default: 'General'
    },
    joiningDate: {
      type: Date,
      default: Date.now
    },
    assignedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
