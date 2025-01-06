import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import AuthCard from "../../components/AuthCard";
import { initialValues, validationSchema } from "./validation";
import { FormikValues } from "formik";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchUserData, verifyCode } from "../../redux/aynscThunks/user";
import { fetchUserDataFromAPI } from "../../api";
import { updateUser } from "../../redux/userSlice";

const VerifyCodeScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (values: FormikValues) => {
    const formData = {
      otp: values.otp,
    };

    const resultAction = await dispatch(verifyCode(formData.otp));

    if (verifyCode.fulfilled.match(resultAction)) {
      const user = await fetchUserDataFromAPI()
      dispatch(updateUser(user))
      navigate("/dashboard");
    }
  };

  return (
    <AuthCard
      title='Verify Code'
      subtitle='An authentication code has been sent to your authenticator app.'
      inputs={[{ name: "otp", label: "Enter Code", type: "text" }]}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      buttonText='Verify'
      showBackButton
    />
  );
};

export default VerifyCodeScreen;
