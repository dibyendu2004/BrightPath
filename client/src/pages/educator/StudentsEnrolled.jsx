import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const StudentsEnrolled = () => {

  const { backendUrl, userData } = useContext(AppContext)
  const { getToken } = useAuth()
  const [enrolledStudents, setEnrolledStudents] = useState(null)

  const fetchEnrolledStudents = async () => {
    try {
      if (!userData) return;
      const token = await getToken()
      const { data } = await axios.get(backendUrl + '/api/educator/enrolled-students', {
        headers: { Authorization: `Bearer ${token}`, userid: userData._id }
      })

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    if (userData) {
      fetchEnrolledStudents()
    }
  }, [userData])

  return enrolledStudents ? (
    <div className='min-h-screen flex flex-col items-start justify-start gap-8 md:p-8 p-4 pt-8 pb-0'>
      <div className='flex flex-col'>
        <h1 className='text-2xl font-semibold'>Students Enrolled</h1>
        <div className='flex flex-col items-start justify-between w-full overflow-hidden border rounded-md mt-10'>
          <table className='table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                <th className='px-4 py-3 font-semibold'>Student Name</th>
                <th className='px-4 py-3 font-semibold'>Course Title</th>
                <th className='px-4 py-3 font-semibold hidden sm:table-cell'>Date</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {enrolledStudents.map((item, index) => (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    <img src={item.student?.imageUrl || assets.profile_img} alt="" className='w-9 h-9 rounded-full' />
                    <span className='truncate'>{item.student?.name || 'Unknown Student'}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  <td className='px-4 py-3 hidden sm:table-cell'>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default StudentsEnrolled
