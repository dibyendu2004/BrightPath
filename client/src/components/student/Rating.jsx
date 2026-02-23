import React, { useEffect, useState } from 'react'

const Rating = ({ initialRating, onRate, readOnly = false }) => {
  const [rating, setRating] = useState(initialRating || 0)

  const handleRating = (value) => {
    if (readOnly) return;
    setRating(value);
    if (onRate) onRate(value)
  }

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating)
    }
  }, [initialRating])

  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-2xl sm:text-3xl transition-all duration-300 transform ${
              !readOnly ? 'cursor-pointer hover:scale-125' : 'cursor-default'
            } ${
              starValue <= rating ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-gray-300'
            }`}
            onClick={() => handleRating(starValue)}
          >
            &#9733;
          </span>
        )
      })}
    </div>
  )
}

export default Rating
