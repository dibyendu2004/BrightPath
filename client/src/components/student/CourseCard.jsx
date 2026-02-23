import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'
import { Link } from 'react-router-dom'

const CourseCard = ({course}) => {

 const {currency,calculateRating} = useContext(AppContext)


  return (
    <Link to={'/course/' + course._id} onClick={()=>scrollTo(0,0)} className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg hover:shadow-custom-card transition-all duration-300 hover:-translate-y-1 bg-white'>
      <img className='w-full aspect-video object-cover' src={course.courseThumbnail} alt={course.courseTitle} />
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold truncate'>{course.courseTitle}</h3>
        <p className='text-gray-500 text-sm'>{course.educator.name}</p>
        <div className='flex items-center space-x-2 mt-2 font-medium'>
          <p className='text-yellow-500'>{calculateRating(course)}</p>
          <div className='flex flex-row flex-nowrap shrink-0'>
            {[...Array(5)].map((_,i)=>(<img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5'/>))}
          </div>
          <p className='text-gray-400 text-sm'>({course.courseRatings.length})</p>
        </div>
        <p className='text-lg font-bold text-gray-800 mt-2'>{currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCard
