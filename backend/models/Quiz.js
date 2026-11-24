import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: [
    {
      type: String,
      required: true
    }
  ],
  correctOptionIndex: {
    type: Number,
    required: true
  },
  points: {
    type: Number,
    default: 1
  }
});

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide quiz title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    timeLimitMinutes: {
      type: Number,
      default: 20
    },
    passingScore: {
      type: Number,
      default: 60
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published'
    }
  },
  {
    timestamps: true
  }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
