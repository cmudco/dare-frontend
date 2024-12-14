import { BellIcon } from "@heroicons/react/24/solid";

const Header = () => {
  return (
    <header className='bg-white  p-1  flex justify-between items-center w-full top-0 left-0 right-0  border   border-pink-50'>
      <div className='flex items-center'>
        <img
          src='/icons/LogoWithText.png'
          alt='Logo'
          className='w-24 md:w-32 lg:w-40 h-auto mr-4'
        />
      </div>
      <div className='flex items-center'>
        <BellIcon className='h-6 w-6' />
        <div className='flex items-center ml-4'>
          <img
            src='/Jake.png'
            alt='User'
            className='w-8 h-8 rounded-full mr-2'
          />
          <div className='flex flex-col mr-4'>
            <span className='text-sm font-medium text-gray-900'>
              Mark Ferdinand
            </span>
            <span className='text-xs text-gray-500'>mkferdinand@gmail.com</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
