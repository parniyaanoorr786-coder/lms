import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide course title'],
      trim: true,
      maxlength: [150, 'Course title cannot exceed 150 characters']
    },
    code: {
      type: String,
      required: [true, 'Please provide course code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide course description']
    },
    category: {
      type: String,
      required: [true, 'Please specify course category'],
      trim: true
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner'
    },
    duration: {
      type: String,
      default: '8 Weeks'
    },
    thumbnail: {
      type: String,
      default: ''
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign a teacher to this course']
    },
    price: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published'
    },
    enrolledCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;
