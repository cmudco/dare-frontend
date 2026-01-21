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
      StarterKit.configure({
        // Keep code blocks disabled to prevent auto-detection
        codeBlock: false,
        code: false,
      }),
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
      // Smart paste handling:
      // - If content has code blocks or ASCII art → paste as plain text
      // - Otherwise, allow normal paste for simple markdown (headers, lists, etc.)
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain')
        if (text) {
          // Check if content has code blocks (```) or ASCII box characters
          const hasCodeBlocks = /```/.test(text)
          const hasAsciiArt = /[┌┐└┘│─┬┴├┤┼▼▲◄►]/.test(text)

          // If it has code blocks or ASCII art, paste as plain text
          if (hasCodeBlocks || hasAsciiArt) {
            event.preventDefault()
            const { tr } = view.state
            const transaction = tr.insertText(text)
            view.dispatch(transaction)
            return true
          }
        }
        // Otherwise, let default paste behavior handle simple markdown
        return false
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
  })

  return (
    <div className='overflow-hidden rounded-md border border-border'>
      <Toolbar editor={editor} />
      <div className='bg-transparent p-4'>
        <EditorContent
          editor={editor}
          className='min-h-[150px] break-all text-sm text-foreground'
        />
      </div>
    </div>
  )
}

export default Tiptap
