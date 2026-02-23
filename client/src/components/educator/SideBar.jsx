import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const SideBar = () => {

  const { isEducator } = useContext(AppContext)

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon },
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon },
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon },
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon },
  ];

  return (
    <div className='md:w-64 w-16 border-r min-h-screen text-base border-gray-500/20 py-2 flex flex-col'>
      {menuItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          end={item.path === '/educator'}
          className={({ isActive }) =>
            `flex items-center md:flex-row flex-col md:justify-start justify-center py-3.5 md:px-10 gap-3 text-gray-500 border-r-[6px] transition-all duration-300 ${
              isActive ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-transparent'
            }`
          }
        >
          <img src={item.icon} alt={item.name} className='w-6 h-6' />
          <p className='md:block hidden text-sm'>{item.name}</p>
        </NavLink>
      ))}
    </div>
  )
}

export default SideBar
