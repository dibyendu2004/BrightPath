import User from "../models/User.js";
import Course from "../models/Course.js";
import CourseProgress from "../models/CourseProgress.js";
import Purchase from "../models/Purchase.js";

// Get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId).populate('enrolledCourses');
        if (!user) {
            return res.json({ success: false, message: "User Profile not found in database. Please ensure Webhooks are set up or wait a moment." });
        }
        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get user enrolled courses
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const user = await User.findById(userId).populate('enrolledCourses');
        
        const enrolledCourses = await Promise.all(user.enrolledCourses.map(async (course) => {
            const progress = await CourseProgress.findOne({ userId, courseId: course._id });
            
            let totalLectures = 0;
            course.courseContent.forEach(chapter => {
                totalLectures += chapter.chapterContent.length;
            });

            const completionPercentage = totalLectures > 0 ? (progress ? Math.floor((progress.completedLectures.length / totalLectures) * 100) : 0) : 0;

            return {
                ...course.toObject(),
                totalLectures,
                completionPercentage
            }
        }));

        res.json({ success: true, enrolledCourses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Purchase course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.auth.userId;

        const user = await User.findById(userId);
        if (user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "Course already purchased" });
        }

        const course = await Course.findById(courseId);
        
        // Prevent educator from enrolling in their own course
        if (course.educator === userId) {
            return res.json({ success: false, message: "You cannot enroll in your own course" });
        }

        user.enrolledCourses.push(courseId);
        await user.save();
        course.enrolledStudents.push(userId);
        await course.save();

        // Create Purchase Record
        const amount = Number((course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2));
        await Purchase.create({
            courseId,
            userId,
            amount,
            status: 'completed'
        });

        res.json({ success: true, message: "Course Purchased Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.body;
        const userId = req.auth.userId;

        let progress = await CourseProgress.findOne({ userId, courseId });

        if (progress) {
            if (progress.completedLectures.includes(lectureId)) {
                return res.json({ success: true, message: "Lecture already completed" });
            }
            progress.completedLectures.push(lectureId);
            await progress.save();
        } else {
            await CourseProgress.create({
                userId,
                courseId,
                completedLectures: [lectureId]
            });
        }
        res.json({ success: true, message: "Progress Updated" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get User Course Progress
export const getUserCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.auth.userId;

        const progress = await CourseProgress.findOne({ userId, courseId });
        res.json({ success: true, progress });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
// Sync user data / create if not found
export const syncUser = async (req, res) => {
    try {
        const { _id, email, name, imageUrl } = req.body;
        let user = await User.findById(_id);

        if (!user) {
            user = await User.create({ _id, email, name, imageUrl, role: 'educator' });
        } else {
             user.name = name;
             user.email = email;
             user.imageUrl = imageUrl;
             if (!user.role || user.role === 'student') {
                user.role = 'educator';
             }
             await user.save();
        }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Add rating
export const addRating = async (req, res) => {
    try {
        const { courseId, rating } = req.body;
        const userId = req.auth.userId;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: "Course not found" });
        }

        const user = await User.findById(userId);
        if (!user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "You must be enrolled to rate this course" });
        }

        const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);
        if (existingRatingIndex > -1) {
            course.courseRatings[existingRatingIndex].rating = rating;
        } else {
            course.courseRatings.push({ userId, rating });
        }

        await course.save();
        res.json({ success: true, message: "Rating Added Successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
