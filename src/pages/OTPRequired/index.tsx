import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Typography } from "@material-tailwind/react";
import { setup2FA } from "../../redux/userSlice";
import { useDispatch } from "react-redux";

const OTPRequired = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); // Typed dispatch

  const handleSkip = () => {
    // Handle skip logic here
    navigate("/dashboard");
  };

  const handle2FA = async () => {
    const setup2FAAction = await dispatch(setup2FA());
    if (setup2FA.fulfilled.match(setup2FAAction)) {
      console.log("2FA setup payload:", setup2FAAction.payload.qr_code);
      navigate("/qr-verification", {
        state: { qrCode: setup2FAAction.payload.qr_code },
      });
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-100'>
      <div className='bg-white p-8 rounded-lg shadow-md w-full max-w-md'>
        <div className='flex justify-between'>
          <Button
            variant='outlined'
            color='gray'
            onClick={handleSkip}
            className='normal-case font-normal'
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            Skip
          </Button>
          <Button
            color='blue'
            onClick={handle2FA}
            className='normal-case font-normal'
            placeholder={undefined}
            onPointerEnterCapture={undefined}
            onPointerLeaveCapture={undefined}
          >
            2FA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPRequired;
