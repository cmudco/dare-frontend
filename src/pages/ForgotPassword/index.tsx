import ForgotPassword from "./ForgotPassword";

const ForgotScreen = () => {
  return (
    <>
      <div className="absolute md:block hidden">
        <img src="/shapes/BgCircle.png" alt="" />
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <ForgotPassword />
      </div>
    </>
  );
};

export default ForgotScreen;