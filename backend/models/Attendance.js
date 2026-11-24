import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
          default: 'present'
        },
        remarks: {
          type: String,
          default: ''
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

attendanceSchema.index({ course: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
