import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, default: false },
    lectureOrder: { type: Number, required: true },
});

const chapterSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
});

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: true },
    discount: { type: Number, default: 0 },
    courseContent: [chapterSchema],
    educator: { type: String, required: true, ref: 'User' },
    enrolledStudents: [
        { type: String, ref: 'User' }
    ],
    courseRatings: [
        {
            userId: { type: String, ref: 'User' },
            rating: { type: Number, default: 0 }
        }
    ],
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);

export default Course;
