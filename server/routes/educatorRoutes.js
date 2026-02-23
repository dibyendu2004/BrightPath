import express from 'express';
import { addCourse, getEducatorCourses, educatorDashboardData, getEnrolledStudentsData } from '../controllers/educatorController.js';
import upload from '../middlewares/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

educatorRouter.post('/add-course', protectEducator, upload.single('image'), addCourse);
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/dashboard-data', protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);

export default educatorRouter;
