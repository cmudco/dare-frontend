import React, { useEffect, useState } from "react";
import AuthCard from "../../components/AuthCard";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

const QrVerificationScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleSkip = () => {
    navigate("/dashboard"); // Navigate to the dashboard or any other route
  };

  return (
    <AuthCard
      title='QR Code Verification'
      subtitle='Scan the QR code below to verify your account.'
      inputs={[]} // No input fields needed
      initialValues={{}} // No initial values needed
      validationSchema={{}} // No validation schema needed
      onSubmit={handleSkip} // Use handleSkip for the button action
      showBackButton={false}
    >
      <div className='flex flex-col items-center'>
        <img
          src={`https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png`}
          alt='QR Code'
          className='w-56 h-56 object-cover mb-1 md:w-64 md:h-64 lg:w-72 lg:h-72'
        />
        <button
          onClick={handleSkip}
          className='w-full mt-3 bg-primary text-white py-2 px-4 rounded-md shadow-sm text-md font-medium'
        >
          Skip
        </button>
      </div>
    </AuthCard>
  );
};

export default QrVerificationScreen;
