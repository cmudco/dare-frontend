import React from 'react'
import { X } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { removeAttachedImage } from '@/redux/conversationSlice'

const ImagePreview: React.FC = () => {
  const dispatch = useDispatch()
  const attachedImages = useSelector(
    (state: RootState) => state.conversation.attachedImages
  )

  if (attachedImages.length === 0) return null

  return (
    <div className='mb-3 flex flex-wrap gap-3 px-4'>
      {attachedImages.map((image) => (
        <div
          key={image.id}
          className='group relative rounded-xl border-2 border-gray-200 transition-all hover:border-blue-400 hover:shadow-lg dark:border-dark-icon-unselected dark:hover:border-blue-500'
        >
          <img
            src={image.preview}
            alt={image.name}
            className='h-28 w-28 rounded-xl object-cover'
          />
          <button
            onClick={() => dispatch(removeAttachedImage(image.id))}
            className='absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-lg transition-opacity hover:bg-red-600 group-hover:opacity-100'
            aria-label='Remove image'
          >
            <X className='h-4 w-4' />
          </button>
          <div className='absolute bottom-0 left-0 right-0 rounded-b-xl bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-center'>
            <span className='truncate text-xs font-medium text-white'>
              {image.name.length > 12
                ? `${image.name.slice(0, 12)}...`
                : image.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ImagePreview
