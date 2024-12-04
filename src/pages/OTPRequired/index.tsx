import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import AuthCard from "../../components/AuthCard";
import { AppDispatch } from "../../redux/store";
import { setup2FA } from "../../redux/aynscThunks/user";

const OTPRequired = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>(); 

  const handleSkip = () => {
    
    navigate("/dashboard");
  };

  const handle2FA = async () => {
    const setup2FAAction = await dispatch(setup2FA());
    if (setup2FA.fulfilled.match(setup2FAAction)) {
      navigate("/qr-verification", {
        state: { qrCode: setup2FAAction.payload.qr_code },
      });
    }
  };

  return (
    <AuthCard
      title='Two-Factor Authentication Required'
      subtitle='Please complete the two-factor authentication setup to proceed.'
      inputs={[]}
      initialValues={{}}
      validationSchema={{}}
      onSubmit={() => {}}
      buttonText=''
      showBackButton={false}
      footer={null}
    >
      <div className='flex justify-between w-full'>
        <button
          onClick={handleSkip}
          className='w-[45%] mt-3 bg-gray-500 text-white py-2 px-4 rounded-md shadow-sm text-md font-medium flex justify-center items-center'
        >
          Skip
        </button>
        <button
          onClick={handle2FA}
          className='w-[45%] mt-3 bg-primary text-white py-2 px-4 rounded-md shadow-sm text-md font-medium flex justify-center items-center'
        >
          2FA
        </button>
      </div>
    </AuthCard>
  );
};

export default OTPRequired;
