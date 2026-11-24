import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide assignment title'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide assignment instructions and description']
    },
    deadline: {
      type: Date,
      required: [true, 'Please specify assignment submission deadline']
    },
    maxScore: {
      type: Number,
      default: 100
    },
    attachments: [
      {
        title: String,
        fileUrl: String
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
