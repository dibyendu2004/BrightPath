import Course from "../models/Course.js";
import User from "../models/User.js";
import cloudinary from "cloudinary";
import Purchase from "../models/Purchase.js";

// Add new course
export const addCourse = async (req, res) => {
    try {
        const { courseData } = req.body;
        const imageFile = req.file;
        const educatorId = req.auth.userId;

        if (!imageFile) {
            return res.json({ success: false, message: "Thumbnail not attached" });
        }

        const parsedCourseData = JSON.parse(courseData);
        parsedCourseData.educator = educatorId;

        const imageUpload = await cloudinary.v2.uploader.upload(imageFile.path);
        parsedCourseData.courseThumbnail = imageUpload.secure_url;

        const newCourse = new Course(parsedCourseData);
        await newCourse.save();

        res.json({ success: true, message: "Course Added" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);
        
        // Fetch all purchases for educator's courses, sorted by date
        const purchases = await Purchase.find({ 
            courseId: { $in: courseIds },
            status: 'completed'
        }).sort({ createdAt: -1 }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const totalEarnings = purchases.reduce((sum, purchase) => sum + (purchase.amount || 0), 0);

        // Map data for dashboard table
        const enrolledStudentsData = purchases.map(purchase => ({
            courseTitle: purchase.courseId?.courseTitle || 'Unknown Course',
            studentName: purchase.userId?.name || 'Unknown Student',
            studentImage: purchase.userId?.imageUrl || '',
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, dashboardData: {
            totalEarnings,
            enrolledStudentsData,
            totalCourses
        } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get Enrolled Students Data with purchase details
export const getEnrolledStudentsData = async (req, res) => {
     try {
        const educator = req.auth.userId;
        const courses = await Course.find({ educator });
        const courseIds = courses.map(course => course._id);

        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).sort({ createdAt: -1 }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle');

        const enrolledStudents = purchases.map(purchase => ({
            courseTitle: purchase.courseId?.courseTitle || 'Unknown Course',
            student: purchase.userId || { name: 'Unknown Student' },
            purchaseDate: purchase.createdAt
        }));

        res.json({ success: true, enrolledStudents });
     } catch (error) {
        res.json({ success: false, message: error.message });
     }
}
