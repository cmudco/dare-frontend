import FileManagerLayout from '../../components/FileManager/FileManagerLayout'
import ProcessingFilesPopover from '../../components/FileManager/ProcessingFilesPopover'

const Files = () => {
  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-between px-10 pt-8'>
        <h1 className='text-3xl font-bold tracking-tight'>Files</h1>
        <ProcessingFilesPopover />
      </div>

      <FileManagerLayout />
    </div>
  )
}

export default Files
