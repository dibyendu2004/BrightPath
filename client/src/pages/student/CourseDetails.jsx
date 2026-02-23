import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Navbar from '../../components/student/Navbar'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'

const CourseDetails = () => {

  const { id } = useParams()
  const { allCourses, calculateRating, calculateNoOfLectures, calculateCourseDuration, calculateChapterTime, currency, backendUrl, userData } = useContext(AppContext)
  const { getToken } = useAuth()
  
  const [courseData, setCourseData] = useState(null)
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerVideo, setPlayerVideo] = useState(null)

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id)
      if (data.success) {
        setCourseData(data.courseData)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
       toast.error(error.message)
    }
  }

  const enrollCourse = async () => {
    try {
       if (!userData) {
         return toast.warn('Please login to enroll');
       }
       const token = await getToken();
       const { data } = await axios.post(backendUrl + '/api/user/purchase', { courseId: id }, {
          headers: { Authorization: `Bearer ${token}`, userid: userData._id }
       });
       if (data.success) {
         toast.success(data.message);
         fetchCourseData();
       } else {
         toast.error(data.message);
       }
    } catch (error) {
       toast.error(error.message);
    }
  }

  useEffect(() => {
    fetchCourseData()
  }, [id])

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.some(item => item._id === courseData._id))
    }
  }, [userData, courseData])

  if (!courseData) return <Loading />

  return (
    <>
      <Navbar />
      <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-32 pt-20 text-left'>

        <div className='absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-blue-100/70'></div>

        {/* Left Column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-deatils-heading-large text-course-deatils-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) }}></p>

          {/* Ratings */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex'>
              {[...Array(5)].map((_, i) => (
                <img key={i} src={i < Math.floor(calculateRating(courseData)) ? assets.star : assets.star_blank} alt="" className='w-3.5 h-3.5' />
              ))}
            </div>
            <p className='text-blue-600'>({courseData.courseRatings.length} {courseData.courseRatings.length > 1 ? 'ratings' : 'rating'})</p>
            <p>{courseData.enrolledStudents.length} {courseData.enrolledStudents.length > 1 ? 'students' : 'student'}</p>
          </div>

          <p className='text-sm'>Course by <span className='text-blue-600 underline'>{courseData.educator.name}</span></p>

          <div className='pt-8 text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {courseData.courseContent.map((chapter, index) => (
                <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'>
                    <div className='flex items-center gap-2'>
                        <img src={assets.dropdown_icon} alt="" className='w-3'/>
                        <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-base'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
          
          {
             playerVideo ? 
             <iframe src={playerVideo} className='aspect-video w-full' allowFullScreen></iframe>
             :
             <img src={courseData.courseThumbnail} alt="" />
          }

          <div className='p-5'>
             <div className='flex items-center gap-2'>
                 <img src={assets.time_left_clock_icon} alt="" className='w-3.5'/>
                 <p className='text-red-500'><span className='font-medium'>5 days</span> left at this price!</p>
             </div>
             <div className='flex gap-3 items-center pt-2'>
                 <p className='text-gray-800 md:text-4xl text-2xl font-semibold'>{currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice / 100).toFixed(2)}</p>
                 <p className='md:text-lg text-gray-500 line-through'>{currency}{courseData.coursePrice}</p>
                 <p className='md:text-lg text-gray-500'>{courseData.discount}% OFF</p>
             </div>

             <div className='flex items-center text-sm md:text-base gap-4 pt-2 md:pt-4 text-gray-500'>
                <div className='flex items-center gap-1'>
                    <img src={assets.star} alt="" className='w-3.5'/>
                    <p>{calculateRating(courseData)}</p>
                </div>
                <div className='h-4 w-px bg-gray-500/40'></div>
                <div className='flex items-center gap-1'>
                    <img src={assets.time_clock_icon} alt="" className='w-3.5'/>
                    <p>{calculateCourseDuration(courseData)}</p>
                </div>
                <div className='h-4 w-px bg-gray-500/40'></div>
                <div className='flex items-center gap-1'>
                    <img src={assets.lesson_icon} alt="" className='w-3.5'/>
                    <p>{calculateNoOfLectures(courseData)} lessons</p>
                </div>
             </div>

             <button onClick={enrollCourse} className='md:mt-6 mt-4 w-full py-3 rounded bg-blue-600 text-white font-medium'>
                {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
             </button>

             <div className='pt-6'>
                <p className='md:text-xl text-lg font-medium text-gray-800'>What's in the course?</p>
                <ul className='ml-4 pt-2 text-sm md:text-base list-disc text-gray-500'>
                    <li>Lifetime access with free updates.</li>
                    <li>Step-by-step, hands-on project guidance.</li>
                    <li>Downloadable resources and source code.</li>
                    <li>Quizzes to test your knowledge.</li>
                    <li>Certificate of completion.</li>
                </ul>
             </div>

          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}

export default CourseDetails
