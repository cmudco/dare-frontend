import React from 'react'
import { X } from 'lucide-react'
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
  /** Shows an × on each tag that takes it off the file. */
  onRemove?: (tagId: number) => void
}

const TagChip = ({
  tag,
  onRemove,
}: {
  tag: Tag
  onRemove?: (tagId: number) => void
}) => (
  <Badge
    variant={getTagColor(tag.label)}
    selected={true}
    className='group/tag gap-0.5 text-xs'
  >
    {tag.label}
    {onRemove && (
      <button
        type='button'
        aria-label={`Remove tag ${tag.label}`}
        onClick={(event) => {
          event.stopPropagation()
          onRemove(tag.id)
        }}
        className='-mr-1 ml-0.5 hidden rounded-full p-0.5 group-hover/tag:inline-flex hover:bg-black/10 focus-visible:inline-flex focus-visible:outline-none dark:hover:bg-white/20'
      >
        <X className='h-2.5 w-2.5' />
      </button>
    )}
  </Badge>
)

const TagsDisplay: React.FC<TagsDisplayProps> = ({
  tags,
  allTags,
  fileId,
  maxVisible = 2,
  onRemove,
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

  return (
    <div className='flex max-w-[180px] flex-wrap items-center gap-1'>
      {visibleTags.map((tag) => (
        <TagChip key={`${fileId}-${tag.id}`} tag={tag} onRemove={onRemove} />
      ))}

      {remainingTags.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Badge
              variant='gray'
              className='cursor-pointer text-xs hover:bg-accent'
            >
              +{remainingTags.length} more
            </Badge>
          </PopoverTrigger>
          <PopoverContent className='w-auto p-2' align='start'>
            <div className='flex flex-wrap gap-1'>
              {remainingTags.map((tag) => (
                <TagChip
                  key={`${fileId}-remaining-${tag.id}`}
                  tag={tag}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

export default TagsDisplay
