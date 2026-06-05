import { useEffect, useMemo, useState } from 'react'
import { FileText, Plus, ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  ResearchProject,
  ResearchSoulFile,
  ResearchSoulFileDraft,
  ResearchSoulFileTemplateMetadata,
  ResearchSoulFileVersion,
} from '@/redux/types/research'
import SoulFileDialog from './SoulFileDialog'

interface Props {
  project?: ResearchProject
  soulFiles: ResearchSoulFile[]
  soulFileVersions: ResearchSoulFileVersion[]
  templates: ResearchSoulFileTemplateMetadata[]
  isSaving: boolean
  onCreate: (draft: ResearchSoulFileDraft) => void
  onUpdate: (id: number, draft: ResearchSoulFileDraft) => void
  onSelect: (soulFileId: number) => void
  onLoadVersions: (soulFileId: number) => void
}

const SoulFilesView = ({
  project,
  soulFiles,
  soulFileVersions,
  templates,
  isSaving,
  onCreate,
  onUpdate,
  onSelect,
  onLoadVersions,
}: Props) => {
  const [editingSoulFile, setEditingSoulFile] =
    useState<ResearchSoulFile | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSoulFileId, setSelectedSoulFileId] = useState<number | null>(
    null
  )

  const activeSoulFile = useMemo(
    () =>
      soulFiles.find((soulFile) => soulFile.id === project?.activeSoulFile) ??
      null,
    [project?.activeSoulFile, soulFiles]
  )
  const selectedSoulFile = useMemo(
    () =>
      soulFiles.find((soulFile) => soulFile.id === selectedSoulFileId) ??
      activeSoulFile,
    [activeSoulFile, selectedSoulFileId, soulFiles]
  )
  const selectedVersions = useMemo(
    () =>
      selectedSoulFile
        ? soulFileVersions
            .filter((version) => version.soulFile === selectedSoulFile.id)
            .sort((first, second) => second.versionNumber - first.versionNumber)
        : [],
    [selectedSoulFile, soulFileVersions]
  )

  useEffect(() => {
    if (!selectedSoulFileId && activeSoulFile) {
      setSelectedSoulFileId(activeSoulFile.id)
    }
  }, [activeSoulFile, selectedSoulFileId])

  useEffect(() => {
    if (selectedSoulFile) {
      onLoadVersions(selectedSoulFile.id)
    }
  }, [onLoadVersions, selectedSoulFile])

  const openCreateDialog = () => {
    setEditingSoulFile(null)
    setIsDialogOpen(true)
  }

  const openEditDialog = (soulFile: ResearchSoulFile) => {
    setEditingSoulFile(soulFile)
    setIsDialogOpen(true)
  }

  const handleConfirm = (draft: ResearchSoulFileDraft) => {
    if (editingSoulFile) {
      onUpdate(editingSoulFile.id, draft)
    } else {
      onCreate(draft)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className='space-y-6'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold tracking-tight'>Soul Files</h2>
          <p className='mt-1 max-w-2xl text-sm text-muted-foreground'>
            Versioned research standards for this project. Staged and approved
            items keep the exact version used when they were created.
          </p>
        </div>
        <Button size='sm' onClick={openCreateDialog}>
          <Plus className='h-4 w-4' /> New soul file
        </Button>
      </header>

      <section className='rounded-xl border border-border bg-card p-5'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <p className='text-sm font-medium'>Project active soul file</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              {activeSoulFile
                ? `${activeSoulFile.title} v${project?.activeSoulFileVersionNumber ?? 1}`
                : 'No active soul file selected yet.'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {soulFiles.map((soulFile) => {
              const isActive = soulFile.id === project?.activeSoulFile
              return (
                <Button
                  key={soulFile.id}
                  size='sm'
                  variant={isActive ? 'default' : 'outline'}
                  disabled={isSaving || isActive}
                  onClick={() => onSelect(soulFile.id)}
                >
                  {isActive ? 'Selected' : `Use ${soulFile.title}`}
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      {soulFiles.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center'>
          <div className='mb-4 rounded-full bg-muted p-3'>
            <ScrollText className='h-6 w-6 text-muted-foreground' />
          </div>
          <p className='text-sm font-medium'>No soul files yet</p>
          <p className='mt-1 max-w-xs text-sm text-muted-foreground'>
            Create a Research Ethics or Empirical Rigor soul file to start
            versioning project standards.
          </p>
          <Button
            variant='outline'
            size='sm'
            className='mt-4'
            onClick={openCreateDialog}
          >
            <Plus className='h-4 w-4' /> New soul file
          </Button>
        </div>
      ) : (
        <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]'>
          <div className='space-y-3'>
            {soulFiles.map((soulFile) => {
              const isSelected = soulFile.id === selectedSoulFile?.id
              const isActive = soulFile.id === project?.activeSoulFile
              return (
                <div
                  key={soulFile.id}
                  className='rounded-xl border border-border bg-card p-5'
                >
                  <div className='mb-2 flex flex-wrap items-center gap-2'>
                    {isActive && <Badge variant='green'>Active</Badge>}
                    {soulFile.isDefault && (
                      <Badge variant='gray'>Default</Badge>
                    )}
                    {isSelected && <Badge variant='blue'>Inspecting</Badge>}
                    <span className='text-xs text-muted-foreground'>
                      v{soulFile.currentVersion?.versionNumber ?? 1} ·{' '}
                      {soulFile.versionCount} version
                      {soulFile.versionCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className='flex gap-3'>
                    <div className='rounded-md bg-muted p-2'>
                      <FileText className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate text-sm font-medium'>
                        {soulFile.title}
                      </p>
                      <p className='mt-1 line-clamp-2 text-sm text-muted-foreground'>
                        {soulFile.description || 'No description recorded.'}
                      </p>
                    </div>
                    <div className='flex shrink-0 flex-col gap-2 sm:flex-row'>
                      <Button
                        size='sm'
                        variant={isSelected ? 'secondary' : 'outline'}
                        onClick={() => setSelectedSoulFileId(soulFile.id)}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect'}
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => openEditDialog(soulFile)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <aside className='rounded-xl border border-border bg-card p-5'>
            <h3 className='text-sm font-semibold tracking-tight'>
              Version history
            </h3>
            <p className='mt-1 text-xs text-muted-foreground'>
              Old versions remain readable and are preserved on staged items.
            </p>
            <div className='mt-4 space-y-3'>
              {selectedVersions.length === 0 ? (
                <p className='rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground'>
                  Select a soul file to inspect versions.
                </p>
              ) : (
                selectedVersions.map((version) => (
                  <div
                    key={version.id}
                    className='rounded-lg border border-border bg-muted/30 p-3'
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <p className='text-sm font-medium'>
                        v{version.versionNumber}
                      </p>
                      <span className='text-xs text-muted-foreground'>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className='mt-2 line-clamp-4 whitespace-pre-line text-xs text-muted-foreground'>
                      {version.body || 'Blank version.'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      <SoulFileDialog
        open={isDialogOpen}
        soulFile={editingSoulFile}
        templates={templates}
        isSubmitting={isSaving}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirm}
      />
    </div>
  )
}

export default SoulFilesView
