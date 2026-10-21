import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { AppWindow } from 'lucide-react'
import {
  CodeBlock,
  CodeBlockCopyButton,
  CodeBlockDownloadButton,
  Streamdown,
  defaultComponents,
  useIsCodeFenceIncomplete,
} from 'streamdown'
import type { Components, CustomRenderer, ExtraProps } from 'streamdown'
import { createCodePlugin } from '@streamdown/code'
import { createMathPlugin } from '@streamdown/math'
import { mermaid } from '@streamdown/mermaid'
import 'katex/dist/katex.min.css'
import { useCodeRunner } from '@/hooks/useCodeRunner'
import { fencePreviewKind } from '@/utils/artifactEditing'
import type { FencePreviewKind } from '@/utils/artifactEditing'
import { readsInput, runnerFor } from '@/utils/codeRunner/protocol'
import type { RunnerLanguage } from '@/utils/codeRunner/protocol'
import { normalizeMathDelimiters, stripSandboxLinks } from '@/utils/markdown'
import { extractTextFromChildren } from '@/utils/textUtils'
import CodeRunOutput from '../CodeRunner/CodeRunOutput'
import RunCodeButton from '../CodeRunner/RunCodeButton'
import { Button } from '../ui/button'

export interface MarkdownFence {
  language: string
  code: string
}

export interface ArtifactCardState {
  kind: FencePreviewKind
  incomplete: boolean
  onShowCode: () => void
}

interface MarkdownProps {
  content: string
  streaming?: boolean
  /** Per-surface element overrides (links, headings…), applied last. */
  components?: Components
  /** Replace fenced blocks of specific languages with custom components. */
  renderers?: CustomRenderer[]
  /** Extra controls rendered in a finished code block's toolbar. */
  fenceAction?: (fence: MarkdownFence) => React.ReactNode
  /** Offer an in-browser Run button on Python and JavaScript blocks. */
  runnable?: boolean
  /** Show React/HTML/SVG fences as artifact cards, with a toggle to the code. */
  renderArtifactCard?: (
    fence: MarkdownFence,
    card: ArtifactCardState
  ) => React.ReactNode
}

const code = createCodePlugin({ themes: ['github-light', 'github-dark'] })
// normalizeMathDelimiters escapes currency dollars before this parses $…$.
const math = createMathPlugin({ singleDollarTextMath: true })
const BASE_PLUGINS = { code, math, mermaid }

const LANGUAGE_CLASS = /language-([^\s]+)/

interface FenceOptions {
  fenceAction?: MarkdownProps['fenceAction']
  renderArtifactCard?: MarkdownProps['renderArtifactCard']
  runnable: boolean
}
const FenceOptionsContext = createContext<FenceOptions>({ runnable: false })

const FenceActions: React.FC<{
  fence: MarkdownFence
  extra?: React.ReactNode
}> = ({ fence, extra }) => {
  const incomplete = useIsCodeFenceIncomplete()
  return (
    <CodeBlock
      code={fence.code}
      language={fence.language}
      isIncomplete={incomplete}
    >
      {!incomplete && extra}
      <CodeBlockCopyButton />
      <CodeBlockDownloadButton />
    </CodeBlock>
  )
}

const RunnableFence: React.FC<{
  fence: MarkdownFence
  runner: RunnerLanguage
  action: React.ReactNode
}> = ({ fence, runner, action }) => {
  const incomplete = useIsCodeFenceIncomplete()
  const run = useCodeRunner(runner)
  const [open, setOpen] = useState(false)
  const [stdin, setStdin] = useState('')
  const needsInput = readsInput(runner, fence.code)

  const handleRun = () => {
    const firstOpen = !open
    setOpen(true)
    // Show the input box first instead of failing on an empty stdin.
    if (needsInput && firstOpen && !stdin) return
    run.run(fence.code, stdin)
  }
  const handleClose = () => {
    run.stop()
    run.clear()
    setOpen(false)
  }

  return (
    <>
      <CodeBlock
        code={fence.code}
        language={fence.language}
        isIncomplete={incomplete}
      >
        {!incomplete && (
          <>
            <RunCodeButton
              running={run.status === 'running'}
              onRun={handleRun}
              onStop={run.stop}
            />
            {action}
          </>
        )}
        <CodeBlockCopyButton />
        <CodeBlockDownloadButton />
      </CodeBlock>
      {open && (
        <CodeRunOutput
          run={run}
          language={runner}
          needsInput={needsInput}
          stdin={stdin}
          onStdinChange={setStdin}
          onClose={handleClose}
          className='-mt-2 mb-4'
        />
      )}
    </>
  )
}

const PreviewableFence: React.FC<{
  fence: MarkdownFence
  kind: FencePreviewKind
  renderCard: NonNullable<MarkdownProps['renderArtifactCard']>
  action: React.ReactNode
}> = ({ fence, kind, renderCard, action }) => {
  const incomplete = useIsCodeFenceIncomplete()
  const [showCode, setShowCode] = useState(false)
  if (!showCode) {
    return (
      <>
        {renderCard(fence, {
          kind,
          incomplete,
          onShowCode: () => setShowCode(true),
        })}
      </>
    )
  }
  const showCard = (
    <Button
      type='button'
      variant='ghost'
      size='sm'
      className='h-6 w-6 p-0 text-muted-foreground'
      onClick={() => setShowCode(false)}
      title='Show as artifact'
      aria-label='Show as artifact'
    >
      <AppWindow className='h-3.5 w-3.5' />
    </Button>
  )
  return (
    <FenceActions
      fence={fence}
      extra={
        <>
          {showCard}
          {action}
        </>
      }
    />
  )
}

const DefaultCode = defaultComponents.code
type CodeProps = React.JSX.IntrinsicElements['code'] & ExtraProps

// Streamdown's diagram block owns its toolbar; mount our action inside it.
const MermaidFence: React.FC<{ props: CodeProps; action: React.ReactNode }> = ({
  props,
  action,
}) => {
  const root = useRef<HTMLDivElement>(null)
  const [toolbar, setToolbar] = useState<Element | null>(null)

  useEffect(() => {
    const container = root.current
    if (!container) return
    const sync = () =>
      setToolbar(
        container.querySelector('[data-streamdown="mermaid-block-actions"]')
      )
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(container, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={root}>
      <DefaultCode {...props} />
      {toolbar && createPortal(action, toolbar)}
    </div>
  )
}

// Streamdown marks fenced code with `data-block`; inline code has none.
const CodeWithActions = (props: CodeProps) => {
  const { fenceAction, renderArtifactCard, runnable } =
    useContext(FenceOptionsContext)
  const language = LANGUAGE_CLASS.exec(props.className ?? '')?.[1] ?? ''
  if (!('data-block' in props)) return <DefaultCode {...props} />
  const fence = { language, code: extractTextFromChildren(props.children) }
  const action = fenceAction?.(fence)
  if (language === 'mermaid') {
    return action ? (
      <MermaidFence props={props} action={action} />
    ) : (
      <DefaultCode {...props} />
    )
  }
  const previewKind = fencePreviewKind(language)
  if (previewKind && renderArtifactCard) {
    return (
      <PreviewableFence
        fence={fence}
        kind={previewKind}
        renderCard={renderArtifactCard}
        action={action}
      />
    )
  }
  const runner = runnable ? runnerFor(language) : null
  if (runner)
    return <RunnableFence fence={fence} runner={runner} action={action} />
  if (action) return <FenceActions fence={fence} extra={action} />
  return <DefaultCode {...props} />
}

export const Markdown: React.FC<MarkdownProps> = ({
  content,
  streaming = false,
  components,
  renderers,
  fenceAction,
  runnable = false,
  renderArtifactCard,
}) => {
  const plugins = useMemo(
    () => (renderers ? { ...BASE_PLUGINS, renderers } : BASE_PLUGINS),
    [renderers]
  )
  const fenceOptions = useMemo(
    () => ({
      fenceAction,
      renderArtifactCard,
      runnable: runnable && !streaming,
    }),
    [fenceAction, renderArtifactCard, runnable, streaming]
  )

  return (
    <FenceOptionsContext.Provider value={fenceOptions}>
      <Streamdown
        isAnimating={streaming}
        caret={streaming ? 'block' : undefined}
        plugins={plugins}
        components={{ code: CodeWithActions, ...components }}
        linkSafety={{ enabled: false }}
        tableMaxHeight={0}
        shikiTheme={['github-light', 'github-dark']}
      >
        {normalizeMathDelimiters(stripSandboxLinks(content))}
      </Streamdown>
    </FenceOptionsContext.Provider>
  )
}

export default Markdown
