import React, { useContext, useEffect, useRef, useState } from 'react'
import { assets } from '../../assets/assets'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const AddCourse = () => {

  const { backendUrl, userData } = useContext(AppContext)
  const { getToken } = useAuth()
  const quillRef = useRef(null)
  const editorRef = useRef(null)

  const [courseTitle, setCourseTitle] = useState('')
  const [coursePrice, setCoursePrice] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [image, setImage] = useState(false)
  const [chapters, setChapters] = useState([])

  const [showPopup, setShowPopup] = useState(false)
  const [currentChapterId, setCurrentChapterId] = useState(null)

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false
  })

  const handleChapter = (action, chapterId) => {
    if (action === 'add') {
      const title = prompt('Enter Chapter Name:')
      if (title) {
        const newChapter = {
          chapterId: Date.now().toString(),
          chapterTitle: title,
          chapterOrder: chapters.length + 1,
          chapterContent: []
        }
        setChapters([...chapters, newChapter])
      }
    } else if (action === 'remove') {
      setChapters(chapters.filter(chapter => chapter.chapterId !== chapterId))
    } else if (action === 'toggle') {
      // Toggle logic if needed
    }
  }

  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === 'add') {
      setCurrentChapterId(chapterId)
      setShowPopup(true)
    } else if (action === 'remove') {
      setChapters(chapters.map(chapter => {
        if (chapter.chapterId === chapterId) {
          chapter.chapterContent.splice(lectureIndex, 1)
        }
        return chapter
      }))
    }
  }

  const addLecture = () => {
    setChapters(chapters.map(chapter => {
      if (chapter.chapterId === currentChapterId) {
        const newLecture = {
          ...lectureDetails,
          lectureOrder: chapter.chapterContent.length + 1,
          lectureId: Date.now().toString()
        }
        chapter.chapterContent.push(newLecture)
      }
      return chapter
    }))
    setShowPopup(false)
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false
    })
  }

  const onhandleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!image) {
        return toast.error('Select Course Thumbnail');
      }

      const courseData = {
        courseTitle,
        courseDescription: editorRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters
      }

      const formData = new FormData();
      formData.append('courseData', JSON.stringify(courseData));
      formData.append('image', image);

      const token = await getToken();

      if (!userData) {
        return toast.error('User data not loaded. Please try again.');
      }

      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData, {
        headers: { Authorization: `Bearer ${token}`, userid: userData._id }
      });

      if (data.success) {
        toast.success(data.message);
        setCourseTitle('');
        setCoursePrice(0);
        setDiscount(0);
        setImage(false);
        setChapters([]);
        editorRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message);
      }
    } catch (error) {
           toast.error(error.message);
    }
  }


  useEffect(() => {
    if (!editorRef.current && quillRef.current) {
      editorRef.current = new Quill(quillRef.current, {
        theme: 'snow'
      })
    }
  }, [])

  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <form onSubmit={onhandleSubmit} className='flex flex-col gap-4 max-w-md w-full text-gray-500'>

        <div className='flex flex-col gap-1'>
          <p>Course Title</p>
          <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type="text" placeholder='Type here' className='outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500' required />
        </div>

        <div className='flex flex-col gap-1'>
          <p>Course Description</p>
          <div ref={quillRef}></div>
        </div>

        <div className='flex items-center justify-between flex-wrap'>
          <div className='flex flex-col gap-1'>
            <p>Course Price</p>
            <input onChange={e => setCoursePrice(e.target.value)} value={coursePrice} type="number" placeholder='0' className='outline-none md:py-2.5 py-2 px-3 w-28 rounded border border-gray-500' required />
          </div>

          <div className='flex md:flex-row flex-col items-center gap-3'>
            <p>Course Thumbnail</p>
            <label htmlFor='thumbnailImage' className='flex items-center gap-3'>
              <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" className='p-3 bg-blue-500/10 rounded cursor-pointer h-12' />
              <input type="file" id='thumbnailImage' onChange={e => setImage(e.target.files[0])} accept="image/*" hidden />
            </label>
          </div>

          <div className='flex flex-col gap-1'>
            <p>Discount %</p>
            <input onChange={e => setDiscount(e.target.value)} value={discount} type="number" placeholder='0' className='outline-none md:py-2.5 py-2 px-3 w-28 rounded border border-gray-500' required />
          </div>
        </div>

        {/* Chapters and Lectures logic here (simplified for space) */}
        <div>
           {chapters.map((chapter, chapterIndex) => (
             <div key={chapterIndex} className='bg-white border rounded-lg mb-4'>
                <div className='flex justify-between items-center p-4 border-b'>
                  <div className='flex items-center'>
                     <img src={assets.dropdown_icon} width={14} alt="" className='mr-2 cursor-pointer'/>
                     <span className='font-semibold'>{chapterIndex + 1} {chapter.chapterTitle}</span>
                  </div>
                  <span className='text-blue-500 cursor-pointer' onClick={()=>handleChapter('remove', chapter.chapterId)}>Remove</span>
                </div>
                <div className='p-4'>
                  {chapter.chapterContent.map((lecture, lectureIndex) => (
                    <div key={lectureIndex} className='flex justify-between items-center mb-2'>
                       <span>{lectureIndex + 1} {lecture.lectureTitle} - {lecture.lectureDuration} mins</span>
                       <span className='text-red-500 cursor-pointer' onClick={()=>handleLecture('remove', chapter.chapterId, lectureIndex)}>Remove</span>
                    </div>
                  ))}
                  <div className='inline-flex items-center gap-2 cursor-pointer text-gray-400 mt-2' onClick={()=>handleLecture('add', chapter.chapterId)}>
                     <img src={assets.add_icon} alt="" />
                     <p>Add Lecture</p>
                  </div>
                </div>
             </div>
           ))}
           <div className='flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer' onClick={()=>handleChapter('add')}>
              + Add Chapter
           </div>
        </div>

        {showPopup && (
          <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-10'>
             <div className='bg-white p-4 rounded-lg w-full max-w-md'>
                <h2 className='text-lg font-semibold mb-4'>Add Lecture</h2>
                <div className='mb-2'>
                  <p>Lecture Title</p>
                  <input type="text" className='outline-none border p-2 w-full' value={lectureDetails.lectureTitle} onChange={e => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})} />
                </div>
                <div className='mb-2'>
                  <p>Duration (minutes)</p>
                  <input type="number" className='outline-none border p-2 w-full' value={lectureDetails.lectureDuration} onChange={e => setLectureDetails({...lectureDetails, lectureDuration: e.target.value})} />
                </div>
                <div className='mb-2'>
                  <p>Lecture URL</p>
                  <input type="text" className='outline-none border p-2 w-full' value={lectureDetails.lectureUrl} onChange={e => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})} />
                </div>
                <div className='mb-2 flex items-center'>
                  <p className='mr-2'>Is Preview Free?</p>
                  <input type="checkbox" checked={lectureDetails.isPreviewFree} onChange={e => setLectureDetails({...lectureDetails, isPreviewFree: e.target.checked})} />
                </div>
                <button type='button' className='bg-blue-500 text-white p-2 rounded w-full' onClick={addLecture}>Add</button>
                <button type='button' className='bg-red-500 text-white p-2 rounded w-full mt-2' onClick={()=>setShowPopup(false)}>Cancel</button>
             </div>
          </div>
        )}

        <button type='submit' className='bg-black text-white w-max py-2.5 px-8 rounded my-4'>ADD</button>
      </form>
    </div>
  )
}

export default AddCourse
