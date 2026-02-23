import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: String, ref: 'Course', required: true },
    completedLectures: { type: Array, default: [] },
    isCompleted: { type: Boolean, default: false },
}, { timestamps: true });

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);

export default CourseProgress;
