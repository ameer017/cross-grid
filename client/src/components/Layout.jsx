import React from 'react'
import Navbar from './Navbar'

const Layout = ({children}) => {
  return (
    <>
    <Navbar/>
    <div style={{minHeight: "100vh"}} className='bg-gray-100'>
    {children}
    </div>

    
    </>
  )
}

export default Layout