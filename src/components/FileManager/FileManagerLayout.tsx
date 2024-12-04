
import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import {
  Card,
  CardHeader,
  Input,
  Typography,
  Button,
  CardBody,
  Chip,
  CardFooter,
  Tooltip,
  IconButton,
  Breadcrumbs,
} from "@material-tailwind/react";
import Header from "../Layout/Header"; 
import FileUploadModal from "./FileUploadModal"; 
import { Link } from "react-router-dom";

const TABLE_HEAD = [
  "File Name",
  "File Type",
  "Size",
  "Date Uploaded",
  "Tags",
  "Action",
];

const TAG_COLORS = {
  Review: "yellow",
  Important: "red",
  Info: "light-blue",
  Personal: "pink",
  Work: "gray",
};

const FileManagerLayout = () => {
  // Managing file list state
  const [files, setFiles] = useState([
    {
      name: "syllabus_01.pdf",
      type: "PDF",
      size: "1 KB",
      date: "9/19/2024",
      tags: "Review",
    },
    {
      name: "project_plan.docx",
      type: "DOCX",
      size: "2 MB",
      date: "10/01/2024",
      tags: "Important",
    },
    {
      name: "meeting_notes.txt",
      type: "TXT",
      size: "500 KB",
      date: "10/05/2024",
      tags: "Info",
    },
    {
      name: "personal_diary.pdf",
      type: "PDF",
      size: "1.5 MB",
      date: "11/11/2024",
      tags: "Personal",
    },
    {
      name: "work_report.xlsx",
      type: "XLSX",
      size: "3 MB",
      date: "12/12/2024",
      tags: "Work",
    },
  ]);

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle file upload and update file list
  const handleFileUpload = (file) => {
    setFiles((prevFiles) => [...prevFiles, file]); // Append new file to list
    setIsModalOpen(false); // Close modal after upload
  };

  return (
    <div className='flex'>
      {/* Main Content Area */}
      <div className='flex-grow'>
        <Header />
        <div className='p-6'>
          <Breadcrumbs className='bg-transparent text-gray-600' separator='>'>
            <Link className='opacity-60 text-gray-500  '>Dashboard</Link>
            <Link className='text-gray-700   '>File</Link>
          </Breadcrumbs>
          <Card className='h-full w-full shadow-none' color='transparent'>
            <CardHeader floated={false} shadow={false} color='transparent'>
              <div className='flex items-center justify-between gap-4'>
                <div className='relative w-[300px] h-[40px]'>
                  <MagnifyingGlassIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                  <Input
                    label='Search by tag'
                    className='pl-10 pr-3 w-full h-full bg-white border border-gray-300 rounded-lg'
                  />
                </div>
                <Button
                  className='bg-primary text-white py-2 rounded-md shadow-sm normal-case font-normal'
                  size='lg'
                  onClick={() => setIsModalOpen(true)}
                >
                  Upload File
                </Button>
              </div>
            </CardHeader>
            <CardBody className='overflow-scroll px-0'>
              <table className='mt-4 w-full min-w-max table-auto text-left'>
                <thead>
                  <tr>
                    {TABLE_HEAD.map((head) => (
                      <th
                        key={head}
                        className='cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 p-4 transition-colors hover:bg-blue-gray-50'
                      >
                        <Typography
                          variant='small'
                          color='blue-gray'
                          className='flex items-center justify-between gap-2 font-normal leading-none opacity-70'
                        >
                          {head}{" "}
                          <ChevronUpDownIcon
                            strokeWidth={2}
                            className='h-4 w-4'
                          />
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {files.map(({ name, type, size, date, tags }, index) => {
                    const isLast = index === files.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-blue-gray-50";

                    return (
                      <tr key={name}>
                        <td className={classes}>
                          <Typography
                            variant='small'
                            color='blue-gray'
                            className='font-normal'
                          >
                            {name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant='small'
                            color='blue-gray'
                            className='font-normal'
                          >
                            {type}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant='small'
                            color='blue-gray'
                            className='font-normal'
                          >
                            {size}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            variant='small'
                            color='blue-gray'
                            className='font-normal'
                          >
                            {date}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Chip
                            variant='ghost'
                            size='sm'
                            value={tags}
                            color={TAG_COLORS[tags]}
                          />
                        </td>
                        <td className={classes}>
                          <div className='flex gap-2'>
                            <Tooltip content='Edit File'>
                              <IconButton variant='text'>
                                <PencilIcon className='h-4 w-4' />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content='Delete File'>
                              <IconButton variant='text'>
                                <TrashIcon className='h-4 w-4' />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardBody>
            <CardFooter className='flex items-center justify-between border-t border-blue-gray-50 p-4'>
              <Typography
                variant='small'
                color='blue-gray'
                className='font-normal'
              >
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
            </CardFooter>
          </Card>

          {/* Upload Modal */}
          {isModalOpen && (
            <FileUploadModal
              onClose={() => setIsModalOpen(false)}
              onUpload={handleFileUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManagerLayout;
