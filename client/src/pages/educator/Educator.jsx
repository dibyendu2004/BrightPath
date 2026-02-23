import React, { useContext } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../../components/educator/Navbar'
import SideBar from '../../components/educator/SideBar'
import Footer from '../../components/educator/Footer'
import Loading from '../../components/student/Loading'
import { AppContext } from '../../context/AppContext'

const Educator = () => {

  const { userData } = useContext(AppContext)

  return userData ? (
    <div className='text-default min-h-screen bg-white'>
      <Navbar />
      <div className='flex'>
        <SideBar />
        <div className='flex-1'>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  ) : <Loading />
}

export default Educator
