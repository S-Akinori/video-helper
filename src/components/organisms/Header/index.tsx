import Link from 'next/link';
import MenuIcon from '@mui/icons-material/Menu';
import React, { createContext, useState } from 'react';
import { IconButton } from '@mui/material';
const Header = () => {
  return (
    <>
      <style jsx>{`
        .nav-container {
          opacity: 0;
          transition: 300ms;
        }
        .nav-container.open {
          opacity: 1;
        }
      `}</style>
      <header className="flex items-center fixed top-0 z-40 px-4 bg-white border-b border-black w-full h-16">
        <div className="container flex justify-between items-center mx-auto">
          <div className='pb-0 text-lg'><Link href="/">動画編集アプリ</Link></div>
          <nav>
            <ul className='flex items-center'>
            </ul>
          </nav>
        </div>
      </header>
      <div className="h-16"></div>
    </>
  )
}

export default Header; 