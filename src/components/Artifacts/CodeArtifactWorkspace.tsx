import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from '@codesandbox/sandpack-react'
import type { SandpackPredefinedTemplate } from '@codesandbox/sandpack-react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppDispatch } from '@/redux/store'
import { selectResolvedMode } from '@/redux/themeSlice'
import { saveArtifactContent } from '@/redux/asyncThunks/artifact'
import type { Artifact, ArtifactSidecarTab } from '@/redux/types/artifact'
import { toast } from '@/utils/toast'
import { Button } from '../ui/button'
import { runnerFor } from '@/utils/codeRunner/protocol'
import ArtifactCodeRunner from '../CodeRunner/ArtifactCodeRunner'
import { MermaidRenderer } from './renderers'
import { EXTRA_EDITOR_LANGUAGES } from './utils/codeEditorLanguages'

type WorkspaceView = Exclude<ArtifactSidecarTab, 'all'>

interface CodeArtifactWorkspaceProps {
  artifact: Artifact
  view: WorkspaceView
  readOnly: boolean
}

interface WorkspaceSetup {
  template: SandpackPredefinedTemplate
  path: string
}

const workspaceSetup = (artifact: Artifact): WorkspaceSetup => {
  switch (artifact.artifactType) {
    case 'react':
      return artifact.filename.endsWith('.tsx')
        ? { template: 'react-ts', path: '/App.tsx' }
        : { template: 'react', path: '/App.js' }
    case 'html':
      return { template: 'static', path: '/index.html' }
    case 'svg':
      return { template: 'static', path: '/image.svg' }
    case 'diagram':
      return { template: 'static', path: '/diagram.mmd' }
    default:
      return { template: 'static', path: `/${artifact.filename || 'main.txt'}` }
  }
}

const svgDocument = (svg: string) =>
  `<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}body{display:grid;place-items:center;background:#fff}svg{max-width:100%;max-height:100%;height:auto}</style>${svg}`

// Sandpack sizes its panes to content; make them fill the workspace instead.
const SANDPACK_FILL_CSS = `
  .artifact-workspace .sp-stack,
  .artifact-workspace .sp-code-editor,
  .artifact-workspace .sp-preview-container,
  .artifact-workspace .sp-preview-iframe,
  .artifact-workspace .cm-editor { height: 100% !important; }
  .artifact-workspace .cm-scroller { overflow: auto !important; }
  .artifact-workspace .sp-preview-actions { display: none !important; }
`

const LivePreview: React.FC<{ artifact: Artifact; code: string }> = ({
  artifact,
  code,
}) => {
  if (artifact.artifactType === 'diagram') {
    return <MermaidRenderer code={code} />
  }
  if (artifact.artifactType === 'react') {
    return (
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        style={{ height: '100%' }}
      />
    )
  }
  // Scripts run in an opaque origin: no access to DARE's cookies or DOM.
  return (
    <iframe
      title={artifact.title || 'Artifact preview'}
      srcDoc={artifact.artifactType === 'svg' ? svgDocument(code) : code}
      sandbox={artifact.artifactType === 'html' ? 'allow-scripts' : ''}
      className='h-full w-full border-0 bg-white'
    />
  )
}

const WorkspaceBody: React.FC<
  CodeArtifactWorkspaceProps & { path: string }
> = ({ artifact, view, readOnly, path }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { sandpack } = useSandpack()
  const [saving, setSaving] = useState(false)
  const code = sandpack.files[path]?.code ?? artifact.content
  const dirty = code !== artifact.content
  const showPreview = view !== 'code' && artifact.artifactType !== 'code'
  const showEditor = view !== 'preview' || artifact.artifactType === 'code'
  const runner =
    artifact.artifactType === 'code'
      ? runnerFor(artifact.filename.split('.').pop() ?? '')
      : null

  const handleSave = async () => {
    setSaving(true)
    const result = await dispatch(
      saveArtifactContent({ artifactId: artifact.id, content: code })
    )
    setSaving(false)
    if (saveArtifactContent.rejected.match(result)) {
      toast.error(result.payload ?? 'Could not save your edits')
    }
  }

  return (
    <div className='artifact-workspace flex h-full min-h-0 flex-col'>
      <style>{SANDPACK_FILL_CSS}</style>
      <div className='flex min-h-0 flex-1 flex-col'>
        {showPreview && (
          <div
            className={cn(
              'min-h-0 flex-1 bg-muted',
              showEditor && 'border-b border-border'
            )}
          >
            <LivePreview artifact={artifact} code={code} />
          </div>
        )}
        {showEditor && (
          <div
            className={cn(
              'min-h-0 overflow-hidden',
              showPreview ? 'flex-[1.2]' : 'flex-1'
            )}
          >
            <SandpackCodeEditor
              showLineNumbers
              showTabs={false}
              showInlineErrors
              readOnly={readOnly}
              additionalLanguages={EXTRA_EDITOR_LANGUAGES}
              style={{ height: '100%' }}
            />
          </div>
        )}
      </div>
      {runner && <ArtifactCodeRunner runner={runner} code={code} />}
      {showEditor && !readOnly && (
        <div className='flex shrink-0 items-center gap-2 border-t border-border px-4 py-2 text-xs'>
          <span
            className={cn(
              'min-w-0 flex-1 truncate',
              dirty ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {dirty
              ? artifact.artifactType === 'code'
                ? 'Unsaved edits'
                : 'Unsaved edits · preview is live'
              : `Saved as v${artifact.version ?? 1}`}
          </span>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-7 text-xs'
            disabled={!dirty || saving}
            onClick={() => sandpack.resetFile(path)}
          >
            Discard
          </Button>
          <Button
            type='button'
            size='sm'
            className='h-7 gap-1 text-xs'
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving && <Loader2 className='h-3.5 w-3.5 animate-spin' />}
            Save new version
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Preview, code, and split views over one Sandpack session, so edits made in
 * the code view drive the live preview and save as a new artifact version.
 */
const CodeArtifactWorkspace: React.FC<CodeArtifactWorkspaceProps> = (props) => {
  const resolvedMode = useSelector(selectResolvedMode)
  const { template, path } = workspaceSetup(props.artifact)

  return (
    <SandpackProvider
      template={template}
      theme={resolvedMode}
      files={{ [path]: props.artifact.content }}
      customSetup={
        props.artifact.artifactType === 'react'
          ? { dependencies: { 'lucide-react': '^0.300.0' } }
          : undefined
      }
      options={{
        activeFile: path,
        visibleFiles: [path],
        externalResources:
          props.artifact.artifactType === 'react'
            ? ['https://cdn.tailwindcss.com']
            : [],
        autorun: true,
        autoReload: true,
      }}
      // Inline: Sandpack's own styles outrank Tailwind's layered utilities.
      style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}
    >
      <WorkspaceBody {...props} path={path} />
    </SandpackProvider>
  )
}

export default CodeArtifactWorkspace
