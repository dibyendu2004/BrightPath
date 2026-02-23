import express from 'express';
import { getUserData, userEnrolledCourses, purchaseCourse, updateUserCourseProgress, getUserCourseProgress, syncUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', getUserData);
userRouter.get('/enrolled-courses', userEnrolledCourses);
userRouter.post('/purchase', purchaseCourse);
userRouter.post('/update-progress', updateUserCourseProgress);
userRouter.get('/progress/:courseId', getUserCourseProgress);
userRouter.post('/sync', syncUser);

export default userRouter;
