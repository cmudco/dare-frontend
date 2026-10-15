import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ModelSettingsFields from '@/components/Conversation/ModelSettingsFields'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { TooltipProvider } from '@/components/ui/tooltip'
import { MODEL_CONFIG } from '@/config/modelConfig'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { clearSelectedAgent, closeModal } from '@/redux/agentSlice'
import { createOrUpdateAgent } from '@/redux/asyncThunks/agent'
import { getAvailableModels } from '@/redux/asyncThunks/conversation'
import { getFiles } from '@/redux/asyncThunks/file'
import { getSharedLibraries } from '@/redux/asyncThunks/library'
import { getPrompts } from '@/redux/asyncThunks/prompt'
import { selectLibrariesLoaded } from '@/redux/librarySlice'
import { AppDispatch, RootState } from '@/redux/store'
import { Agent, AgentSetup } from '@/redux/types/agent'
import { ModelSettings } from '@/redux/types/conversation'
import { RagMode } from '@/utils/constants/conversation'
import { defaultMaxTokensFor } from '@/utils/modelConfigUtils'
import { modelRefLabel } from '@/utils/modelRef'
import AgentSourcesFields from './AgentSourcesFields'

const NO_MODEL = 'none'

const setupFrom = (agent: Agent | null, modelRef: string | null): AgentSetup =>
  agent
    ? {
        name: agent.name,
        description: agent.description,
        prompt: agent.prompt,
        modelRef: agent.modelRef,
        maxTokens: agent.maxTokens,
        temperature: agent.temperature,
        effort: agent.effort,
        historyLimit: agent.historyLimit,
        ragMode: agent.ragMode,
        maxContextSnippets: agent.maxContextSnippets,
        documentSimilarityThreshold: agent.documentSimilarityThreshold,
        enableWebSearch: agent.enableWebSearch,
        webFetchEnabled: agent.webFetchEnabled,
        artifactsEnabled: agent.artifactsEnabled,
        memoryEnabled: agent.memoryEnabled,
        contentFiles: agent.contentFiles,
        embeddingFiles: agent.embeddingFiles,
        libraries: agent.libraries,
        mcpServers: agent.mcpServers,
        dareToolSlugs: agent.dareToolSlugs,
      }
    : {
        name: '',
        description: '',
        prompt: 0,
        modelRef,
        maxTokens: MODEL_CONFIG.maxTokens,
        temperature: MODEL_CONFIG.temperature,
        effort: null,
        historyLimit: MODEL_CONFIG.historyLimit,
        ragMode: RagMode.ADVANCED,
        maxContextSnippets: MODEL_CONFIG.maxContextSnippets,
        documentSimilarityThreshold: MODEL_CONFIG.documentSimilarityThreshold,
        enableWebSearch: false,
        webFetchEnabled: false,
        artifactsEnabled: false,
        memoryEnabled: false,
        contentFiles: [],
        embeddingFiles: [],
        libraries: [],
        mcpServers: [],
        dareToolSlugs: [],
      }

interface AgentEditorProps {
  agent: Agent | null
  onDone: () => void
}

/** The agent form; mounted fresh for each agent so its draft starts clean. */
const AgentEditor: React.FC<AgentEditorProps> = ({ agent, onDone }) => {
  const dispatch = useDispatch<AppDispatch>()
  const enableMemory = useFeatureFlag('enableMemory')
  const prompts = useSelector((state: RootState) => state.prompt.prompts)
  const pickerEntries = useSelector(
    (state: RootState) => state.conversation.pickerEntries
  )
  const walletMeta = useSelector(
    (state: RootState) => state.conversation.activeWalletMeta
  )
  const chatModel = useSelector(
    (state: RootState) => state.conversation.selectedModel
  )
  const [draft, setDraft] = useState<AgentSetup>(() =>
    setupFrom(agent, chatModel)
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Editing a prompt versions it; offer the newest of each, plus the agent's own.
  const promptOptions = useMemo(() => {
    const replaced = new Set(prompts.map((prompt) => prompt.parent))
    return prompts.filter(
      (prompt) => !replaced.has(prompt.id) || prompt.id === draft.prompt
    )
  }, [prompts, draft.prompt])
  const model = pickerEntries.find((entry) => entry.id === draft.modelRef)
  const savedModelMissing = !!draft.modelRef && !model

  const update = (patch: Partial<AgentSetup>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setError(null)
  }

  const changeModel = (modelRef: string | null) => {
    const next = pickerEntries.find((entry) => entry.id === modelRef)
    // Keep a custom token budget; move a default one to the new model's default.
    const maxTokens =
      draft.maxTokens === defaultMaxTokensFor(model)
        ? defaultMaxTokensFor(next)
        : draft.maxTokens
    update({ modelRef, maxTokens, effort: null })
  }

  const settings: ModelSettings = {
    webSearchEnabled: draft.enableWebSearch,
    webFetchEnabled: draft.webFetchEnabled,
    artifactsEnabled: draft.artifactsEnabled,
    effort: draft.effort,
    temperature: draft.temperature,
    maxTokens: draft.maxTokens,
    historyLimit: draft.historyLimit,
  }
  const changeSettings = ({
    webSearchEnabled,
    ...rest
  }: Partial<ModelSettings>) =>
    update(
      webSearchEnabled === undefined
        ? rest
        : { ...rest, enableWebSearch: webSearchEnabled }
    )

  const canSave = draft.name.trim() !== '' && draft.prompt > 0 && !saving

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(
        createOrUpdateAgent({
          id: agent?.id,
          agentData: { ...draft, name: draft.name.trim() },
        })
      ).unwrap()
      onDone()
    } catch (rejection) {
      setError(
        typeof rejection === 'string' ? rejection : 'Could not save the agent.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <TooltipProvider>
      <Tabs defaultValue='setup' className='w-full'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='setup'>Setup</TabsTrigger>
          <TabsTrigger value='behavior'>Behavior</TabsTrigger>
          <TabsTrigger value='sources'>Sources & tools</TabsTrigger>
        </TabsList>

        <TabsContent value='setup' className='space-y-4 pt-2'>
          <div className='space-y-2'>
            <Label htmlFor='agent-name'>Name</Label>
            <Input
              id='agent-name'
              value={draft.name}
              onChange={(event) => update({ name: event.target.value })}
              placeholder='A2 Parametric Span helper'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='agent-description'>Description</Label>
            <Textarea
              id='agent-description'
              value={draft.description}
              onChange={(event) => update({ description: event.target.value })}
              placeholder='What this agent helps with (optional)'
              rows={3}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='agent-prompt'>Prompt</Label>
            <Select
              value={draft.prompt ? String(draft.prompt) : ''}
              onValueChange={(value) => update({ prompt: Number(value) })}
            >
              <SelectTrigger id='agent-prompt'>
                <SelectValue placeholder='Choose a prompt' />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                {promptOptions.map((prompt) => (
                  <SelectItem key={prompt.id} value={String(prompt.id)}>
                    {prompt.title || 'Untitled'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='agent-model'>Model</Label>
            <Select
              value={draft.modelRef ?? NO_MODEL}
              onValueChange={(value) =>
                changeModel(value === NO_MODEL ? null : value)
              }
            >
              <SelectTrigger id='agent-model'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='max-h-60'>
                <SelectItem value={NO_MODEL}>Keep the chat's model</SelectItem>
                {savedModelMissing && draft.modelRef && (
                  <SelectItem value={draft.modelRef}>
                    {modelRefLabel(draft.modelRef, pickerEntries) ??
                      'Unavailable model'}
                  </SelectItem>
                )}
                {pickerEntries.map((entry) => (
                  <SelectItem key={entry.id} value={entry.id}>
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {savedModelMissing && (
              <p className='text-xs text-muted-foreground'>
                This model isn't offered by your current wallet.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value='behavior' className='pt-2'>
          {draft.modelRef === null && (
            <p className='mb-3 text-xs text-muted-foreground'>
              Choose a model on the Setup tab to see the settings it supports.
            </p>
          )}
          <ModelSettingsFields
            settings={settings}
            onChange={changeSettings}
            model={model}
            walletMeta={walletMeta}
            extraToggles={
              enableMemory && (
                <div className='flex items-center justify-between border-b border-border pb-2'>
                  <Label htmlFor='agent-memory' className='font-medium'>
                    Memory
                  </Label>
                  <Switch
                    id='agent-memory'
                    checked={draft.memoryEnabled}
                    onCheckedChange={(checked) =>
                      update({ memoryEnabled: checked })
                    }
                  />
                </div>
              )
            }
          />
        </TabsContent>

        <TabsContent value='sources' className='pt-2'>
          <AgentSourcesFields setup={draft} onChange={update} />
        </TabsContent>
      </Tabs>

      {error && (
        <p role='alert' className='mt-3 text-sm text-destructive'>
          {error}
        </p>
      )}
      <DialogFooter className='mt-4 gap-2'>
        <Button type='button' variant='outline' onClick={onDone}>
          Cancel
        </Button>
        <Button type='button' disabled={!canSave} onClick={handleSave}>
          {saving ? 'Saving…' : 'Save agent'}
        </Button>
      </DialogFooter>
    </TooltipProvider>
  )
}

const AgentModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedAgent, isModalOpen } = useSelector(
    (state: RootState) => state.agent
  )
  const promptCount = useSelector(
    (state: RootState) => state.prompt.prompts.length
  )
  const fileCount = useSelector((state: RootState) => state.files.files.length)
  const modelCatalogStatus = useSelector(
    (state: RootState) => state.conversation.modelCatalogStatus
  )
  const librariesLoaded = useSelector(selectLibrariesLoaded)

  useEffect(() => {
    if (!isModalOpen) return
    if (promptCount === 0) dispatch(getPrompts())
    if (fileCount === 0) dispatch(getFiles())
    if (modelCatalogStatus === 'idle') dispatch(getAvailableModels())
    if (!librariesLoaded) dispatch(getSharedLibraries())
  }, [
    isModalOpen,
    dispatch,
    promptCount,
    fileCount,
    modelCatalogStatus,
    librariesLoaded,
  ])

  const handleClose = () => {
    dispatch(closeModal())
    if (selectedAgent) dispatch(clearSelectedAgent())
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className='mx-auto max-h-[90vh] w-[90vw] max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle>
            {selectedAgent ? 'Edit agent' : 'New agent'}
          </DialogTitle>
          <DialogDescription>
            A reusable chat setup: prompt, model, settings, sources and tools.
          </DialogDescription>
        </DialogHeader>
        {isModalOpen && (
          <AgentEditor
            key={selectedAgent?.id ?? 'new'}
            agent={selectedAgent}
            onDone={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AgentModal
