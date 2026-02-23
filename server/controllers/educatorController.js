import Course from "../models/Course.js";
import User from "../models/User.js";
import cloudinary from "cloudinary";

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

        const enrolledStudentsData = [];
        courses.map((course) => {
            course.enrolledStudents.map((studentId) => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    studentId
                })
            })
        })

        res.json({ success: true, dashboardData: {
            totalEarnings: 0, // Placeholder
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
        
        let enrolledStudents = [];
        courses.map(course => {
            course.enrolledStudents.map(studentId => {
                enrolledStudents.push({
                    courseTitle: course.courseTitle,
                    studentId
                })
            })
        })
        res.json({ success: true, enrolledStudents });
     } catch (error) {
        res.json({ success: false, message: error.message });
     }
}
