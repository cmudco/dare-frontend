import VerifyCode from "./VerifyCode";


const VerifyScreen = () => {
  return (
    <>
      <div className='absolute md:block hidden'>
        <img src='/shapes/BgCircle.png' alt='' />
      </div>
      <div className='flex items-center justify-center min-h-screen '>
        <VerifyCode />
      </div>
    </>
  );
};

export default VerifyScreen;
