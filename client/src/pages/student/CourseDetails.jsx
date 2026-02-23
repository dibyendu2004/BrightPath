import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import YouTube from 'react-youtube'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import { assets } from '../../assets/assets'
import humanizeDuration from 'humanize-duration'
import Footer from '../../components/student/Footer'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'
import { toast } from 'react-toastify'
import { Rating } from 'react-simple-star-rating'

const CourseDetails = () => {

  const { id } = useParams()
  const { allCourses, calculateRating, calculateNoOfLectures, calculateCourseDuration, calculateChapterTime, currency, backendUrl, userData } = useContext(AppContext)
  const { getToken } = useAuth()
  
  const [courseData, setCourseData] = useState(null)
  const [openSections, setOpenSections] = useState({})
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false)
  const [playerVideo, setPlayerVideo] = useState(null)
  const [userRating, setUserRating] = useState(0)

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(?:youtu.be\/|v\/|e\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  const handleRating = async (rate) => {
     try {
        const token = await getToken();
        const { data } = await axios.post(backendUrl + '/api/user/rating', { courseId: id, rating: rate }, {
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

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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
      <div className='flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-32 pt-20 text-left'>

        <div className='absolute top-0 left-0 w-full h-[500px] -z-10 bg-gradient-to-b from-blue-100/70'></div>

        {/* Left Column */}
        <div className='max-w-xl z-10 text-gray-500'>
          <h1 className='md:text-course-details-heading-large text-course-details-heading-small font-semibold text-gray-800'>{courseData.courseTitle}</h1>
          <p className='pt-4 md:text-base text-sm' dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 300) }}></p>

          {/* Ratings */}
          <div className='flex items-center space-x-2 pt-3 pb-1 text-sm'>
            <p>{calculateRating(courseData)}</p>
            <div className='flex flex-row flex-nowrap items-center shrink-0'>
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
                  <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => toggleSection(index)}>
                    <div className='flex items-center gap-2'>
                        <img src={assets.dropdown_icon} alt="" className={`w-3 transition-transform ${openSections[index] ? 'rotate-180' : ''}`}/>
                        <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                    </div>
                    <p className='text-sm md:text-base'>{chapter.chapterContent.length} lectures - {calculateChapterTime(chapter)}</p>
                  </div>

                  <div className={`overflow-hidden transition-all duration-300 ${openSections[index] ? 'max-h-[1000px]' : 'max-h-0'}`}>
                    <ul className='list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className='flex items-start gap-2 py-1'>
                          <img src={assets.play_icon} alt="play icon" className='w-4 h-4 mt-1' />
                          <div className='flex items-center justify-between w-full text-gray-800 text-xs md:text-default'>
                             <p>{lecture.lectureTitle}</p>
                             <div className='flex gap-2'>
                                {lecture.isPreviewFree && <p onClick={() => setPlayerVideo(lecture.lectureUrl)} className='text-blue-500 cursor-pointer'>Preview</p>}
                                <p>{humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ['h', 'm'] })}</p>
                             </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='py-20 text-sm md:text-base text-gray-800'>
             <h3 className='text-3xl font-semibold'>Course Description</h3>
             <div className='pt-5 rich-text' dangerouslySetInnerHTML={{ __html: courseData.courseDescription }}></div>
          </div>
        </div>

        {/* Right Column */}
        <div className='max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]'>
          
          {
             playerVideo ? 
             <div className='relative overflow-hidden'>
                <p className='absolute top-2 right-2 z-20 text-white cursor-pointer bg-black/50 px-2 py-0.5 rounded text-sm select-none' onClick={() => setPlayerVideo(null)}>Close</p>
                {
                   getYouTubeId(playerVideo) ? 
                   <YouTube
                      videoId={getYouTubeId(playerVideo)}
                      iframeClassName='w-full aspect-video'
                   />
                   :
                   <iframe src={playerVideo} className='w-full aspect-video' allowFullScreen title='Course Preview'></iframe>
                }
             </div>
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

             <button onClick={enrollCourse} disabled={isAlreadyEnrolled || (userData && userData._id === courseData.educator._id)} className={`md:mt-6 mt-4 w-full py-3 rounded text-white font-medium ${isAlreadyEnrolled || (userData && userData._id === courseData.educator._id) ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'}`}>
                {isAlreadyEnrolled ? 'Already Enrolled' : (userData && userData._id === courseData.educator._id) ? 'Creator Mode' : 'Enroll Now'}
             </button>

             {isAlreadyEnrolled && (
               <div className='pt-6 flex items-center justify-between'>
                  <p className='md:text-lg font-medium text-gray-800'>Rate this course</p>
                  <div className='flex flex-row flex-nowrap shrink-0'>
                    <Rating onClick={handleRating} initialValue={userData.courseRatings?.find(r => r.courseId === id)?.rating || 0} size={25} />
                  </div>
               </div>
             )}

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

      {/* Reviews Section */}
      <div className='md:px-36 px-8 pt-12 pb-24 text-left'>
         <h1 className='text-2xl font-semibold text-gray-800'>Course Reviews</h1>
         <div className='flex gap-10 pt-8 overflow-x-auto'>
            {courseData.courseRatings.map((item, index) => (
               <div key={index} className='flex-shrink-0 flex gap-4 border p-4 rounded-lg bg-gray-50 min-w-[300px] sm:min-w-[400px]'>
                  <img src={assets.profile_img} alt="" className='w-12 h-12 rounded-full'/>
                  <div className='w-full'>
                     <div className='flex justify-between items-center w-full'>
                        <h1 className='text-lg font-semibold'>{item.userId.name || 'Student'}</h1>
                        <div className='flex flex-row flex-nowrap items-center shrink-0'>
                           {[...Array(5)].map((_, i) => (
                              <img key={i} src={i < item.rating ? assets.star : assets.star_blank} alt="" className='w-3.5 h-3.5' />
                           ))}
                        </div>
                     </div>
                     <p className='text-gray-500 mt-2'>Excellent course! Highly informative and well-structured.</p>
                  </div>
               </div>
            ))}
            {courseData.courseRatings.length === 0 && <p className='text-gray-500'>No reviews yet for this course.</p>}
         </div>
      </div>

      <Footer />
    </>
  )
}

export default CourseDetails
