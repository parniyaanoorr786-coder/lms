import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide lesson title'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    order: {
      type: Number,
      default: 1
    },
    duration: {
      type: String,
      default: '30 mins'
    },
    videoUrl: {
      type: String,
      default: ''
    },
    isFreePreview: {
      type: Boolean,
      default: false
    },
    studyMaterials: [
      {
        title: { type: String, required: true },
        fileUrl: { type: String, required: true },
        fileType: { type: String, default: 'document' }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);
export default Lesson;
