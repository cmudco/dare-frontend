const Header = () => {
  return (
    <header className='bg-white shadow-md p-4 flex justify-between items-center'>
      <input
        type='text'
        placeholder='Search'
        className='border rounded-md px-3 py-2 w-1/3'
      />
      <div className='flex items-center space-x-4'>
        <span className='material-icons'>notifications</span>
        <div className='flex items-center'>
          <img
            src='/profile.jpg'
            alt='User'
            className='w-8 h-8 rounded-full mr-2'
          />
          <span>Mark Ferdinand</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
