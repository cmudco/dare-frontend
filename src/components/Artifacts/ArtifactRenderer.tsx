import React from 'react'
import type { Artifact } from '@/redux/types/artifact'
import {
  ChartRenderer,
  DocxRenderer,
  MermaidRenderer,
  PptxRenderer,
  SandpackRenderer,
} from './renderers'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ArtifactRendererProps {
  artifact: Artifact
}

/**
 * ArtifactRenderer - Type-based artifact rendering
 *
 * Routes artifacts to appropriate renderer based on artifactType.
 * Clean implementation inspired by Claude Artifacts / LibreChat pattern.
 */
export const ArtifactRenderer: React.FC<ArtifactRendererProps> = ({
  artifact,
}) => {
  switch (artifact.artifactType) {
    case 'chart':
      try {
        const config = JSON.parse(artifact.content)
        return <ChartRenderer config={config} />
      } catch (e) {
        console.error('Failed to parse chart config:', e)
        return <ErrorDisplay message='Failed to render chart' />
      }

    case 'diagram':
      return <MermaidRenderer code={artifact.content} />

    case 'html':
      return (
        <iframe
          title={artifact.title || 'HTML artifact'}
          srcDoc={artifact.content}
          sandbox=''
          className='h-full min-h-[360px] w-full rounded-lg border border-border bg-white'
        />
      )

    case 'svg':
      // Wrap so the SVG scales to fit + centers, instead of rendering at its
      // intrinsic size in the corner.
      return (
        <iframe
          title={artifact.title || 'SVG figure'}
          srcDoc={`<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}body{display:grid;place-items:center;background:#fff}svg{max-width:100%;max-height:100%;height:auto}</style>${artifact.content}`}
          sandbox=''
          className='h-full min-h-[320px] w-full rounded-lg border border-border bg-white'
        />
      )

    case 'excalidraw':
      return (
        <div className='flex h-full flex-col items-center justify-center gap-3 p-8 text-center'>
          <div className='text-5xl'>✏️</div>
          <p className='text-sm font-medium'>
            {artifact.title || 'Excalidraw scene'}
          </p>
          <a
            href={`data:application/json;charset=utf-8,${encodeURIComponent(
              artifact.content
            )}`}
            download={`${(artifact.title || 'scene').replace(/\s+/g, '-')}.excalidraw`}
            className='text-sm text-primary hover:underline'
          >
            Download .excalidraw — open at excalidraw.com
          </a>
        </div>
      )

    case 'docx':
      try {
        const config = JSON.parse(artifact.content)
        return <DocxRenderer config={config} />
      } catch (e) {
        console.error('Failed to parse docx config:', e)
        return <ErrorDisplay message='Failed to render document' />
      }

    case 'pptx':
      try {
        const config = JSON.parse(artifact.content)
        return <PptxRenderer config={config} />
      } catch (e) {
        console.error('Failed to parse pptx config:', e)
        return <ErrorDisplay message='Failed to render presentation' />
      }

    case 'react':
      return <SandpackRenderer code={artifact.content} title={artifact.title} />

    case 'code':
      return (
        <div className='h-full overflow-auto p-4'>
          <SyntaxHighlighter
            language={(artifact.metadata?.language as string) || 'text'}
            style={oneDark}
            customStyle={{
              margin: 0,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              height: '100%',
            }}
            showLineNumbers
          >
            {artifact.content}
          </SyntaxHighlighter>
        </div>
      )

    case 'document':
      return (
        <div className='h-full overflow-auto p-6'>
          <div className='prose prose-sm max-w-none dark:prose-invert'>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {artifact.content}
            </ReactMarkdown>
          </div>
        </div>
      )

    case 'image':
      return (
        <div className='flex h-full items-center justify-center p-4'>
          <img
            src={artifact.content}
            alt={artifact.title}
            className='max-h-full max-w-full rounded-lg object-contain'
          />
        </div>
      )

    case 'file':
      return (
        <div className='flex h-full items-center justify-center p-8'>
          <div className='text-center'>
            <div className='mb-4 text-6xl'>📄</div>
            <h3 className='mb-2 text-lg font-medium'>{artifact.filename}</h3>
            <p className='text-sm text-gray-500'>{artifact.contentType}</p>
          </div>
        </div>
      )

    default:
      return (
        <ErrorDisplay
          message={`Unknown artifact type: ${artifact.artifactType}`}
        />
      )
  }
}

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className='flex h-full items-center justify-center p-8'>
    <div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
      <p className='text-red-600 dark:text-red-400'>{message}</p>
    </div>
  </div>
)

export default ArtifactRenderer
