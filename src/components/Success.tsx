import React from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "./Auth/AuthCard";
import * as Yup from "yup";

const ForgotPasswordSuccess: React.FC = () => {
    const navigate = useNavigate();

    const handleSubmit = () => {
        navigate("/login");
    };

    const formikConfig = {
        initialValues: {},
        validationSchema: Yup.object({}),
        onSubmit: handleSubmit,
    };

    return (
        <AuthCard
            title="Check your email"
            subtitle="We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password."
            inputs={[]}
            formikConfig={formikConfig}
            buttonText="Back to Login"
            showBackButton={false}
        />
    );
};

export default ForgotPasswordSuccess;
