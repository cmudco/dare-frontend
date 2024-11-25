import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch } from "../../redux/store";
import { verifyCode } from "../../redux/userSlice";

const VerifyCodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    console.log("Submitted values:", values);

    const formData = {
      verificationCode: values.verificationCode,
    };

    const resultAction = await dispatch(verifyCode(formData));

    if (verifyCode.fulfilled.match(resultAction)) {
      navigate("/reset-password");
    } else if (verifyCode.rejected.match(resultAction)) {
      console.error("Verification failed:", resultAction.payload);
    }
  };

  return (
    <AuthCard
      title='Verify Code'
      subtitle='An authentication code has been sent to your email.'
      inputs={[{ name: "verificationCode", label: "Enter Code", type: "text" }]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Verify'
      showBackButton
      footer={
        <p className='text-left text-xs mt-2'>
          Didn't receive a code?{" "}
          <span className='text-red-500 text-xs font-body font-extrabold cursor-pointer'>
            Resend
          </span>
        </p>
      }
    />
  );
};

export default VerifyCodeScreen;
