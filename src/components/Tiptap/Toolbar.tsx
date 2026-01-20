import React from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from '../ui/button'

interface ToolbarProps {
  editor: Editor | null
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className='flex flex-wrap gap-1 border-b border-border bg-muted p-2'>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold')
            ? 'bg-accent'
            : 'text-foreground hover:bg-accent'
        }
        aria-label='Bold'
      >
        <Bold className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'bg-accent'
            : 'text-foreground hover:bg-accent'
        }
        aria-label='Italic'
      >
        <Italic className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList')
            ? 'bg-accent'
            : 'text-foreground hover:bg-accent'
        }
        aria-label='Bullet List'
      >
        <List className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList')
            ? 'bg-accent'
            : 'text-foreground hover:bg-accent'
        }
        aria-label='Ordered List'
      >
        <ListOrdered className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote')
            ? 'bg-accent'
            : 'text-foreground hover:bg-accent'
        }
        aria-label='Blockquote'
      >
        <Quote className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label='Undo'
        className='text-foreground hover:bg-accent disabled:text-muted-foreground'
      >
        <Undo className='h-4 w-4' />
      </Button>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label='Redo'
        className='text-foreground hover:bg-accent disabled:text-muted-foreground'
      >
        <Redo className='h-4 w-4' />
      </Button>
    </div>
  )
}

export default Toolbar
