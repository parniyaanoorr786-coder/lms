import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    answers: [
      {
        questionIndex: Number,
        selectedOptionIndex: Number,
        isCorrect: Boolean
      }
    ],
    totalQuestions: {
      type: Number,
      required: true
    },
    correctAnswers: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    maxScore: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    passed: {
      type: Boolean,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Result = mongoose.model('Result', resultSchema);
export default Result;
