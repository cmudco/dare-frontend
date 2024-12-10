
const UploadForm = () => {
  return (
    <form>
      <div className='mb-4'>
        <label className='block text-sm font-medium'>File Name</label>
        <input
          type='text'
          placeholder='Enter file name'
          className='w-full border rounded-md px-3 py-2'
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium'>Add Tag</label>
        <input
          type='text'
          placeholder='Enter tag'
          className='w-full border rounded-md px-3 py-2'
        />
      </div>
      <div className='mb-4'>
        <label className='block text-sm font-medium'>Upload a File</label>
        <div className='border-dashed border-2 p-4 text-center'>
          Drop files here or <span className='text-blue-500'>browse</span>
        </div>
      </div>
      <button
        type='submit'
        className='w-full bg-blue-500 text-white py-2 rounded-md'
      >
        Upload
      </button>
    </form>
  );
};

export default UploadForm;
