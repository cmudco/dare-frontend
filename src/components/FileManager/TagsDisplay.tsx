import React from 'react'
import { Badge } from '../ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { getTagColor } from '@/utils/files'

interface Tag {
  id: number
  label: string
}

interface TagsDisplayProps {
  tags: number[]
  allTags: Tag[]
  fileId: number
  maxVisible?: number
}

const TagsDisplay: React.FC<TagsDisplayProps> = ({
  tags,
  allTags,
  fileId,
  maxVisible = 2,
}) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null
  }

  const tagObjects = tags
    .map((tagId) => allTags.find((t) => t.id === tagId))
    .filter((tag): tag is Tag => tag !== undefined)

  if (tagObjects.length === 0) {
    return null
  }

  const visibleTags = tagObjects.slice(0, maxVisible)
  const remainingTags = tagObjects.slice(maxVisible)
  const hasMoreTags = remainingTags.length > 0

  return (
    <div className='flex max-w-[150px] flex-wrap items-center gap-1'>
      {visibleTags.map((tag, i) => {
        const colorVariant = getTagColor(tag.label)
        return (
          <Badge
            key={`${fileId}-${tag.id}-${i}`}
            variant={colorVariant}
            selected={true}
            className='text-xs'
          >
            {tag.label}
          </Badge>
        )
      })}

      {hasMoreTags && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant='gray'
              className='cursor-pointer text-xs hover:bg-gray-200 dark:hover:bg-gray-700'
            >
              +{remainingTags.length} more
            </Badge>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-2' align='start'>
            <div className='flex flex-wrap gap-1'>
              {remainingTags.map((tag, i) => {
                const colorVariant = getTagColor(tag.label)
                return (
                  <Badge
                    key={`${fileId}-remaining-${tag.id}-${i}`}
                    variant={colorVariant}
                    selected={true}
                    className='text-xs'
                  >
                    {tag.label}
                  </Badge>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default TagsDisplay
