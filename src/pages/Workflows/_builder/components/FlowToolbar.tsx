import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { useAppDispatch } from '@/redux/hooks'
import { saveFlow } from '@/redux/slices/flowSlice'

export default function FlowToolbar() {
  const dispatch = useAppDispatch()

  return (
    <div className='absolute right-4 top-4 z-10 flex gap-2'>
      <Button
        onClick={() => dispatch(saveFlow())}
        className='flex items-center gap-2'
        variant='default'
      >
        <Save className='h-4 w-4' />
        Save Flow
      </Button>
    </div>
  )
}
