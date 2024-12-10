import React from "react";

interface SplitScreenProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

const SplitScreen: React.FC<SplitScreenProps> = ({ left, right }) => {
  return (
    <div className='flex w-full h-full'>
      <div className='w-1/5 bg-gray-100 border-r'>{left}</div>
      <div className='flex-1'>{right}</div>
    </div>
  );
};

export default SplitScreen;