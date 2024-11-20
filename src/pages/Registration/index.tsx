import React from "react";
import RegistrationForm from "./RegistrationForm";

const Registration = () => {
  return (
    <>
      <div className='absolute md:block hidden'>
        <img src='/shapes/BgCircle.png' alt='' />
      </div>
      <div className='flex items-center justify-center min-h-screen '>
        <RegistrationForm />
      </div>
    </>
  );
};

export default Registration;
