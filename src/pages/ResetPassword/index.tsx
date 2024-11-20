import ResetPassword from "./ResetPassword";

const ResetScreen = () => {
  return (
    <>
      <div className='absolute md:block hidden'>
        <img src='/shapes/BgCircle.png' alt='' />
      </div>
      <div className='flex items-center justify-center min-h-screen '>
        <ResetPassword />
      </div>
    </>
  );
};

export default ResetScreen;
