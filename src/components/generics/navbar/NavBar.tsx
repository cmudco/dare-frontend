import React from "react";

const NavBar: React.FC = () => {
  return (
    <div className='flex items-center justify-between px-8 py-4 bg-white shadow-md rounded-t-2xl'>
      <h1 className='text-2xl font-black'>Dare</h1>
      <div className='flex items-center gap-4'>
        <span className='text-lg font-medium'>Mark Ferdinand</span>
        <img
          src='https://via.placeholder.com/40'
          alt='User Avatar'
          className='w-10 h-10 rounded-full'
        />
      </div>
    </div>
  );
};

export default NavBar;