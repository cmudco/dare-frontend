import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Button } from '../ui/button'
import { FileView } from '@/redux/types/files'

interface ViewToggleProps {
  onToggleView: (view: FileView) => void
}

const VIEWS: { value: FileView; label: string }[] = [
  { value: 'files', label: 'Files' },
  { value: 'folders', label: 'Folders' },
  { value: 'media', label: 'Media' },
  { value: 'libraries', label: 'Shared libraries' },
]

const ViewToggle: React.FC<ViewToggleProps> = ({ onToggleView }) => {
  const currentView = useSelector((state: RootState) => state.files.currentView)

  return (
    <div data-tour='files-view-toggle' className='mr-4 flex gap-2'>
      {VIEWS.map((view) => (
        <Button
          key={view.value}
          variant={currentView === view.value ? 'default' : 'outline'}
          size='sm'
          onClick={() => onToggleView(view.value)}
        >
          {view.label}
        </Button>
      ))}
    </div>
  )
}

export default ViewToggle
