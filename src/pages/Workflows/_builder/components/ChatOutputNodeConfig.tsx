import {
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useAppSelector, useAppDispatch } from '@/redux/hooks'
import { setNodeSelectedRun } from '@/redux/workflowBuilderSlice'
import { useState, useCallback } from 'react'
import { getDisplayRun, getNodeState } from '@/utils/workflowRunHelpers'
import { WorkflowRunStepStatus } from '@/utils/constants/workflows'
import { formatWorkflowRunLabel } from '@/utils/workflowUtils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/atom-one-light.css'
import { CodeBlock } from '@/components/Conversation/CodeBlock'
import { MermaidBlock } from '@/components/Conversation/MermaidBlock'

interface ChatOutputNodeConfigProps {
  nodeId: string
}

export default function ChatOutputNodeConfig({
  nodeId,
}: ChatOutputNodeConfigProps) {
  const dispatch = useAppDispatch()
  const [snippetsOpen, setSnippetsOpen] = useState(false)
  const [webSourcesOpen, setWebSourcesOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Get workflow execution data
  const { availableRuns, selectedRunIds, currentRun } = useAppSelector(
    (s) => s.workflowBuilder
  )

  // Get selected run ID for this node
  const selectedRunId = selectedRunIds[nodeId]

  // Get the run to display
  const displayRun = getDisplayRun(
    nodeId,
    selectedRunIds,
    availableRuns,
    currentRun
  )

  // Get node state from the display run
  const nodeState = getNodeState(displayRun, nodeId)

  // Extract data from node state
  const response = nodeState?.response || null
  const status = nodeState?.status || null
  const error = nodeState?.error || null
  const snippets = nodeState?.snippets || []
  const webSearchSources = nodeState?.webSearchSources || []

  // Get available versions for this node
  const nodeVersionRuns = availableRuns.filter((run) => {
    const ns = getNodeState(run, nodeId)
    return ns && ns.status === WorkflowRunStepStatus.Completed
  })

  const hasVersions = nodeVersionRuns.length > 0

  // Handle version change
  const handleVersionChange = (runId: string) => {
    dispatch(setNodeSelectedRun({ nodeId, runId: Number(runId) }))
  }

  // Copy to clipboard with feedback
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(response || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // no-op
    }
  }, [response])

  return (
    <div className='space-y-4'>
      {/* Version Selector */}
      {hasVersions && (
        <div className='space-y-2'>
          <Label className='text-xs font-medium'>Output Version</Label>
          <Select
            value={selectedRunId?.toString() || ''}
            onValueChange={handleVersionChange}
          >
            <SelectTrigger className='bg-background text-sm'>
              <SelectValue placeholder='Select version' />
            </SelectTrigger>
            <SelectContent>
              {nodeVersionRuns.map((run, index) => (
                <SelectItem key={run.id} value={run.id.toString()}>
                  {formatWorkflowRunLabel(run, nodeVersionRuns.length - index)}
                  {index === 0 ? ' (Latest)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className='text-xs text-muted-foreground'>
            {nodeVersionRuns.length} version
            {nodeVersionRuns.length !== 1 ? 's' : ''} available
          </p>
        </div>
      )}

      {/* Status */}
      <div className='space-y-2'>
        <Label className='text-xs font-medium'>Status</Label>
        <div className='flex items-center gap-2'>
          <div
            className={`h-2 w-2 rounded-full ${
              status === WorkflowRunStepStatus.Completed
                ? 'bg-green-500'
                : status === WorkflowRunStepStatus.Running
                  ? 'animate-pulse bg-blue-500'
                  : status === WorkflowRunStepStatus.Failed
                    ? 'bg-red-500'
                    : 'bg-gray-400'
            }`}
          />
          <span className='text-sm capitalize'>
            {status || 'No output yet'}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className='space-y-2'>
          <Label className='text-xs font-medium text-destructive'>Error</Label>
          <div className='rounded-md border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive'>
            {error}
          </div>
        </div>
      )}

      {/* Response Content */}
      {response && (
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label className='text-xs font-medium'>Response</Label>
            <Button
              size='sm'
              variant='ghost'
              className={`h-6 px-2 text-xs ${copied ? 'text-green-600' : ''}`}
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <Check className='mr-1 h-3 w-3' />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className='mr-1 h-3 w-3' />
                  Copy
                </>
              )}
            </Button>
          </div>
          <div
            className='max-h-[60vh] min-h-[50vh] overflow-y-auto rounded-md border border-border bg-background p-3'
            onWheel={(e) => e.stopPropagation()}
          >
            <div className='prose prose-sm max-w-full text-foreground dark:prose-invert prose-code:bg-transparent prose-code:p-0 prose-pre:bg-transparent prose-pre:p-0'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeRaw]}
                components={{
                  table({ children, ...props }) {
                    return (
                      <div className='max-w-full overflow-x-auto'>
                        <table className='min-w-full' {...props}>
                          {children}
                        </table>
                      </div>
                    )
                  },
                  pre({ children, ...props }) {
                    return (
                      <pre
                        className='max-w-full overflow-x-auto whitespace-pre-wrap break-words'
                        {...props}
                      >
                        {children}
                      </pre>
                    )
                  },
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '')
                    if (match && match[1] === 'mermaid') {
                      return (
                        <MermaidBlock
                          code={String(children).trim()}
                          streaming={false}
                        />
                      )
                    }
                    if (match) {
                      return (
                        <CodeBlock className={className} props={props}>
                          {children}
                        </CodeBlock>
                      )
                    }
                    return (
                      <code
                        className='not-prose break-all rounded border border-border bg-muted px-1 text-foreground'
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {/* No output message */}
      {!response && !error && (
        <div className='rounded-md border border-border bg-muted/30 p-4 text-center'>
          <Send className='mx-auto h-8 w-8 text-muted-foreground/50' />
          <p className='mt-2 text-sm text-muted-foreground'>
            {status === WorkflowRunStepStatus.Running
              ? 'Generating response...'
              : status === WorkflowRunStepStatus.Pending
                ? 'Waiting for execution...'
                : 'No output yet. Run the workflow to see results.'}
          </p>
        </div>
      )}

      {/* Context Snippets */}
      {snippets.length > 0 && (
        <Collapsible open={snippetsOpen} onOpenChange={setSnippetsOpen}>
          <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-xs transition-colors hover:bg-accent'>
            <span className='flex items-center font-medium text-foreground'>
              <FileText className='mr-2 h-3 w-3' />
              Context Snippets ({snippets.length})
            </span>
            {snippetsOpen ? (
              <ChevronUp className='h-3 w-3 text-muted-foreground' />
            ) : (
              <ChevronDown className='h-3 w-3 text-muted-foreground' />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className='space-y-2 pt-2'>
            {[...snippets]
              .sort(
                (a, b) => (b.similarityScore || 0) - (a.similarityScore || 0)
              )
              .map((snippet) => (
                <div
                  key={snippet.id}
                  className='rounded-r-md border-l-2 border-border bg-background p-2 pl-3 text-xs'
                >
                  <div className='mb-1 flex items-center justify-between'>
                    <span className='font-medium text-foreground'>
                      {snippet.file?.name || 'Unknown file'} (
                      {snippet.similarityScore?.toFixed(2) || 'N/A'})
                    </span>
                    <span className='text-muted-foreground'>
                      Chunk {snippet.chunkIndex || 0}
                    </span>
                  </div>
                  <p className='line-clamp-3 text-muted-foreground'>
                    {snippet.text}
                  </p>
                </div>
              ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Web Search Sources */}
      {webSearchSources.length > 0 && (
        <Collapsible open={webSourcesOpen} onOpenChange={setWebSourcesOpen}>
          <CollapsibleTrigger className='flex w-full items-center justify-between rounded-md border border-border bg-muted px-3 py-2 text-xs transition-colors hover:bg-accent'>
            <span className='flex items-center font-medium text-foreground'>
              <Globe className='mr-2 h-3 w-3' />
              Web Sources ({webSearchSources.length})
            </span>
            {webSourcesOpen ? (
              <ChevronUp className='h-3 w-3 text-muted-foreground' />
            ) : (
              <ChevronDown className='h-3 w-3 text-muted-foreground' />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className='space-y-2 pt-2'>
            {webSearchSources.map((source) => (
              <div
                key={source.id}
                className='rounded-r-md border-l-2 border-blue-500 bg-background p-2 pl-3 text-xs'
              >
                <a
                  href={source.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 font-medium text-foreground hover:text-blue-600'
                  onClick={(e) => e.stopPropagation()}
                >
                  {source.title || source.url}
                  <ExternalLink className='h-2.5 w-2.5' />
                </a>
                {source.citedText && (
                  <p className='mt-1 line-clamp-2 italic text-muted-foreground'>
                    &ldquo;{source.citedText}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  )
}
