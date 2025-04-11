import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Toolbar from './Toolbar'

interface TiptapProps {
  content: string
  onChange: (content: string) => void
}

const Tiptap: React.FC<TiptapProps> = ({ content, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Enter prompt content...',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm focus:outline-none w-full max-w-full',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  return (
    <div className='overflow-hidden rounded-md border'>
      <Toolbar editor={editor} />
      <div className='p-4'>
        <EditorContent editor={editor} className='min-h-[150px] text-sm' />
      </div>
    </div>
  )
}

export default Tiptap
