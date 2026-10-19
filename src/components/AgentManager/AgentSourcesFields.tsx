import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { BookOpen, Database, FileText, X } from 'lucide-react'

import { DareToolSelector } from '@/components/DareTools/DareToolSelector'
import { MCPServerSelector } from '@/components/MCP/MCPServerSelector'
import RagModeSelector from '@/components/Conversation/RagModeSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { selectLibraries } from '@/redux/librarySlice'
import { RootState } from '@/redux/store'
import { AgentSetup } from '@/redux/types/agent'
import { MyFile } from '@/redux/types/files'

type SourcesSetup = Pick<
  AgentSetup,
  | 'contentFiles'
  | 'embeddingFiles'
  | 'libraries'
  | 'ragMode'
  | 'maxContextSnippets'
  | 'documentSimilarityThreshold'
  | 'mcpServers'
  | 'dareToolSlugs'
>

interface AgentSourcesFieldsProps {
  setup: SourcesSetup
  onChange: (patch: Partial<SourcesSetup>) => void
}

interface FilePickerProps {
  id: string
  label: string
  hint: string
  icon: React.ReactNode
  files: MyFile[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

const FilePicker: React.FC<FilePickerProps> = ({
  id,
  label,
  hint,
  icon,
  files,
  selectedIds,
  onChange,
}) => (
  <div className='space-y-2'>
    <Label htmlFor={id} className='flex items-center gap-2'>
      {icon}
      {label}
    </Label>
    <p className='text-xs text-muted-foreground'>{hint}</p>
    {selectedIds.length > 0 && (
      <div className='flex flex-wrap gap-1'>
        {selectedIds.map((fileId) => (
          <Badge key={fileId} variant='secondary' className='gap-1 text-xs'>
            {files.find((file) => file.id === fileId)?.name ??
              'Unavailable file'}
            <Button
              type='button'
              size='sm'
              variant='ghost'
              className='h-4 w-4 p-0'
              aria-label='Remove file'
              onClick={() => onChange(selectedIds.filter((x) => x !== fileId))}
            >
              <X className='h-3 w-3' />
            </Button>
          </Badge>
        ))}
      </div>
    )}
    <Select
      value=''
      onValueChange={(value) => onChange([...selectedIds, Number(value)])}
    >
      <SelectTrigger id={id} className='bg-background text-xs'>
        <SelectValue placeholder='Add a file' />
      </SelectTrigger>
      <SelectContent className='max-h-60'>
        {files
          .filter((file) => !selectedIds.includes(file.id))
          .map((file) => (
            <SelectItem key={file.id} value={String(file.id)}>
              {file.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  </div>
)

/** What the agent can read and call: files, libraries, retrieval, MCP and DARE tools. */
const AgentSourcesFields: React.FC<AgentSourcesFieldsProps> = ({
  setup,
  onChange,
}) => {
  const enableMcp = useFeatureFlag('enableMcp')
  const enableArtifacts = useFeatureFlag('enableArtifacts')
  const allFiles = useSelector((state: RootState) => state.files.files)
  const allLibraries = useSelector(selectLibraries)
  const files = useMemo(
    () => allFiles.filter((file) => !file.isMedia),
    [allFiles]
  )
  const libraries = useMemo(
    () => allLibraries.filter((library) => library.isAdded),
    [allLibraries]
  )
  const hasSources =
    setup.contentFiles.length +
      setup.embeddingFiles.length +
      setup.libraries.length >
    0

  const toggleLibrary = (libraryId: number) =>
    onChange({
      libraries: setup.libraries.includes(libraryId)
        ? setup.libraries.filter((id) => id !== libraryId)
        : [...setup.libraries, libraryId],
    })

  return (
    <div className='space-y-5'>
      <FilePicker
        id='agent-content-files'
        label='Full-text files'
        hint='Sent whole with every message.'
        icon={<FileText className='h-3.5 w-3.5' />}
        files={files}
        selectedIds={setup.contentFiles}
        onChange={(contentFiles) => onChange({ contentFiles })}
      />
      <FilePicker
        id='agent-embedding-files'
        label='Searched files'
        hint='Searched for the passages relevant to each message.'
        icon={<Database className='h-3.5 w-3.5' />}
        files={files}
        selectedIds={setup.embeddingFiles}
        onChange={(embeddingFiles) => onChange({ embeddingFiles })}
      />

      {libraries.length > 0 && (
        <div className='space-y-2'>
          <Label className='flex items-center gap-2'>
            <BookOpen className='h-3.5 w-3.5' />
            Shared libraries
          </Label>
          <div className='flex flex-wrap gap-2'>
            {libraries.map((library) => {
              const selected = setup.libraries.includes(library.id)
              return (
                <Button
                  key={library.id}
                  type='button'
                  size='sm'
                  variant={selected ? 'default' : 'outline'}
                  aria-pressed={selected}
                  onClick={() => toggleLibrary(library.id)}
                >
                  {library.name}
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {hasSources && (
        <div className='space-y-4 rounded-lg border border-border p-3'>
          <div className='space-y-2'>
            <Label>Retrieval</Label>
            <RagModeSelector
              value={setup.ragMode}
              onChange={(ragMode) => onChange({ ragMode })}
            />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Passages per message</Label>
              <span className='rounded-md bg-muted px-2 py-0.5 font-mono text-sm'>
                {setup.maxContextSnippets}
              </span>
            </div>
            <Slider
              value={[setup.maxContextSnippets]}
              min={1}
              max={20}
              step={1}
              onValueChange={(values) =>
                onChange({ maxContextSnippets: values[0] })
              }
              aria-label='Passages per message'
            />
          </div>
          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label>Minimum relevance</Label>
              <span className='rounded-md bg-muted px-2 py-0.5 font-mono text-sm'>
                {setup.documentSimilarityThreshold.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[setup.documentSimilarityThreshold]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={(values) =>
                onChange({ documentSimilarityThreshold: values[0] })
              }
              aria-label='Minimum relevance'
            />
          </div>
        </div>
      )}

      {(enableMcp || enableArtifacts) && (
        <div className='space-y-2'>
          <Label>Tools</Label>
          <div className='flex flex-wrap items-center gap-2'>
            {enableMcp && (
              <MCPServerSelector
                selectedIds={setup.mcpServers}
                onChange={(mcpServers) => onChange({ mcpServers })}
              />
            )}
            {enableArtifacts && (
              <DareToolSelector
                selectedSlugs={setup.dareToolSlugs}
                onChange={(dareToolSlugs) => onChange({ dareToolSlugs })}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentSourcesFields
