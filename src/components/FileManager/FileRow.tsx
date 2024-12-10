

const FileRow = ({ file }: { file: any }) => {
  return (
    <tr className='hover:bg-gray-50'>
      <td className='border px-4 py-2'>{file.name}</td>
      <td className='border px-4 py-2'>{file.type}</td>
      <td className='border px-4 py-2'>{file.size}</td>
      <td className='border px-4 py-2'>{file.date}</td>
      <td className='border px-4 py-2'>{file.tag}</td>
      <td className='border px-4 py-2'>
        <button className='text-blue-500'>Edit</button>
        <button className='text-red-500 ml-2'>Delete</button>
      </td>
    </tr>
  );
};

export default FileRow;
