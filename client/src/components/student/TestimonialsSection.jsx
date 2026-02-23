import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const TestimonialsSection = () => {

  const { allCourses } = useContext(AppContext)

  // Get all reviews from all courses
  const allReviews = allCourses.reduce((acc, course) => {
    return [...acc, ...course.courseRatings.map(rating => ({ ...rating, courseTitle: course.courseTitle }))]
  }, [])

  return (
    <div className='pb-14 px-8 md:px-0'>
      <h2 className='text-3xl font-medium text-gray-800'>Testimonials</h2>
      <p className='md:text-base text-gray-500 mt-3'>Hear from our learners as they share their journeys of transformation,
        success, and how our<br /> platform has made a difference in their lives.</p>
      
      <div className='flex gap-8 mt-14 overflow-x-auto'>
        {allReviews.slice(0, 10).map((review, index) => (
          <div key={index} className='flex-shrink-0 text-sm text-left border border-gray-500/30 pb-6 rounded-lg bg-white shadow-custom-card min-w-[300px] sm:min-w-[350px]'>
            <div className='flex items-center gap-4 px-5 py-4 bg-gray-500/10'>
              <img className='h-12 w-12 rounded-full' src={assets.profile_img} alt={review.userId?.name || 'Student'} />
              <div>
                <h1 className='text-lg font-medium text-gray-800'>{review.userId?.name || 'Student'}</h1>
                <p className='text-gray-800/80 text-xs'>{review.courseTitle}</p>
              </div>
            </div>
            <div className='p-5 pb-7'>
              <div className='flex flex-row flex-nowrap items-center gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <img className='h-4' key={i} src={i < review.rating ? assets.star : assets.star_blank} alt="star" />
                ))}
              </div>
              <p className='text-gray-500 mt-5'>Excellent course! Highly informative and well-structured.</p>
            </div>
          </div>
        ))}

        {allReviews.length === 0 && <p className='text-gray-500 text-center w-full'>No reviews yet.</p>}
      </div>
    </div>
  )
}

export default TestimonialsSection
