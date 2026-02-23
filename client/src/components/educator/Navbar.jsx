import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const Navbar = () => {

  const { isEducator } = useContext(AppContext)
  const { user } = useUser()

  return (
    <div className='flex items-center justify-between px-4 md:px-8 py-3 border-b border-gray-500/20 bg-white'>
      <img src={assets.logo} alt="logo" className='w-28 lg:w-32 cursor-pointer' onClick={() => window.location.href = '/'} />
      <div className='flex items-center gap-5 text-gray-500 text-sm'>
        <p>Hi! {user ? user.fullName : 'Educator'}</p>
        <UserButton />
      </div>
    </div>
  )
}

export default Navbar
