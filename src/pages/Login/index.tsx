import LoginForm from "./LoginForm";

const LoginScreen = () => {
  return (
    <>
      <div className='absolute md:block hidden'>
        <img src='/shapes/BgCircle.png' alt='' />
      </div>
      <div className='flex items-center justify-center min-h-screen '>
        <LoginForm />
      </div>
    </>
  );
};

export default LoginScreen;
