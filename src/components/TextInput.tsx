import React, { useState } from "react";
import { Input } from "@material-tailwind/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

interface TextInputProps {
  name: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string | undefined;
}

const TextInput: React.FC<TextInputProps> = ({
  name,
  label,
  type,
  value,
  onChange,
  onBlur,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className='w-full mb-5 relative'>
      <Input
        id={name}
        name={name}
        type={showPassword && type === "password" ? "text" : type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        label={label} 
        icon={
          type === "password" && (
            <div
              className='absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer'
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className='h-5 w-5 text-gray-800' />
              ) : (
                <EyeIcon className='h-5 w-5 text-gray-800' />
              )}
            </div>
          )
        }
        error={!!error}
        className='w-full'
      />
      <p
        className={`text-xs text-red-500 mt-0.5 mb-2 ml-2 ${
          !error ? "opacity-0 my-2" : ""
        }`}
      >
        {String(error)}
      </p>{" "}
    </div>
  );
};

export default TextInput;
