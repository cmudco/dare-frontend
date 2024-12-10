import { Typography, Button } from "@material-tailwind/react";

const FileTableControls = () => {
  return (
    <div className='flex items-center justify-between border-t border-blue-gray-50 p-4'>
      <Typography variant='small' color='blue-gray' className='font-normal'>
        Page 1 of 1
      </Typography>
      <div className='flex gap-2'>
        <Button variant='outlined' size='sm'>
          Previous
        </Button>
        <Button variant='outlined' size='sm'>
          Next
        </Button>
      </div>
    </div>
  );
};

export default FileTableControls;