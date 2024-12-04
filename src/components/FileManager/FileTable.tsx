
import FileRow from "./FileRow";

const FileTable = ({ files }: { files: any[] }) => {
  return (
    <table className='w-full border-collapse border border-gray-200'>
      <thead>
        <tr className='bg-gray-100'>
          <th className='border px-4 py-2'>File Name</th>
          <th className='border px-4 py-2'>File Type</th>
          <th className='border px-4 py-2'>Size</th>
          <th className='border px-4 py-2'>Date Uploaded</th>
          <th className='border px-4 py-2'>Tags</th>
          <th className='border px-4 py-2'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file, index) => (
          <FileRow key={index} file={file} />
        ))}
      </tbody>
    </table>
  );
};

export default FileTable;
