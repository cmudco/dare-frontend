import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../redux/store'
import { createOrUpdateAgent } from '../../redux/asyncThunks/agent'
import { getPrompts } from '../../redux/asyncThunks/prompt'
import { getAvailableModels } from '../../redux/asyncThunks/conversation'
import { clearSelectedAgent, closeModal } from '../../redux/agentSlice'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { getFiles } from '@/redux/asyncThunks/file'
import { FileText, Database, X } from 'lucide-react'

const agentValidationSchema = Yup.object().shape({
  name: Yup.string().required('Agent name is required'),
  description: Yup.string(),
  prompt: Yup.number().required('Prompt is required'),
  llm: Yup.number().required('Language model is required'),
  contentFiles: Yup.array().of(Yup.number()),
  embeddingFiles: Yup.array().of(Yup.number()),
  maxTokens: Yup.number()
    .min(1, 'Max tokens must be at least 1')
    .required('Max tokens is required'),
  temperature: Yup.number()
    .min(0.1, 'Temperature must be at least 0.1')
    .max(1, 'Temperature must not exceed 1.0')
    .required('Temperature is required'),
  maxContextSnippets: Yup.number()
    .min(0, 'Max context snippets must be at least 0')
    .required('Max context snippets is required'),
  documentSimilarityThreshold: Yup.number()
    .min(0, 'Threshold must be at least 0')
    .max(1, 'Threshold must not exceed 1')
    .required('Threshold is required'),
  enableWebSearch: Yup.boolean(),
})

const AgentModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { selectedAgent, loading, isModalOpen } = useSelector(
    (state: RootState) => state.agent
  )
  const { prompts } = useSelector((state: RootState) => state.prompt)
  const { availableModels } = useSelector(
    (state: RootState) => state.conversation
  )
  const { files } = useSelector((state: RootState) => state.files)

  const isEditMode = !!selectedAgent

  useEffect(() => {
    if (isModalOpen) {
      if (prompts.length === 0) {
        dispatch(getPrompts())
      }
      if (availableModels.length === 0) {
        dispatch(getAvailableModels())
      }
      if (files.length === 0) {
        dispatch(getFiles())
      }
    }
  }, [
    isModalOpen,
    dispatch,
    prompts.length,
    availableModels.length,
    files.length,
  ])

  const initialValues = {
    name: selectedAgent?.name || '',
    description: selectedAgent?.description || '',
    prompt: selectedAgent?.prompt || '',
    llm: selectedAgent?.llm || 1,
    contentFiles: selectedAgent?.contentFiles || [],
    embeddingFiles: selectedAgent?.embeddingFiles || [],
    maxTokens: selectedAgent?.maxTokens || 2000,
    temperature: selectedAgent?.temperature || 0.6,
    maxContextSnippets: selectedAgent?.maxContextSnippets || 10,
    documentSimilarityThreshold:
      selectedAgent?.documentSimilarityThreshold || 0.7,
    enableWebSearch: selectedAgent?.enableWebSearch || false,
  }

  const handleClose = () => {
    dispatch(closeModal())
    if (selectedAgent) {
      dispatch(clearSelectedAgent())
    }
  }

  const handleSubmit = async (values: {
    name: string
    description: string
    prompt: number | string
    llm: number
    contentFiles: number[]
    embeddingFiles: number[]
    maxTokens: number
    temperature: number
    maxContextSnippets: number
    documentSimilarityThreshold: number
    enableWebSearch: boolean
  }) => {
    try {
      const agentData = {
        name: values.name,
        description: values.description,
        prompt: Number(values.prompt),
        llm: values.llm,
        contentFiles: values.contentFiles,
        embeddingFiles: values.embeddingFiles,
        maxTokens: values.maxTokens,
        temperature: values.temperature,
        maxContextSnippets: values.maxContextSnippets,
        documentSimilarityThreshold: values.documentSimilarityThreshold,
        enableWebSearch: values.enableWebSearch,
      }
      await dispatch(
        createOrUpdateAgent({
          id: isEditMode ? selectedAgent?.id : undefined,
          agentData,
        })
      )
        .unwrap()
        .then(() => {
          handleClose()
        })
    } catch (error) {
      console.error('Failed to save agent:', error)
    }
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className='mx-auto max-h-[90vh] w-[90vw] max-w-3xl overflow-y-auto rounded-lg bg-background p-6 shadow-lg'>
        <DialogHeader>
          <DialogTitle className='text-lg font-semibold text-foreground'>
            {isEditMode ? 'Edit Agent' : 'Create New Agent'}
          </DialogTitle>
          <DialogDescription className='text-sm text-muted-foreground'>
            {isEditMode
              ? 'Update your agent configuration below.'
              : 'Configure a new agent with LLM settings, prompts, and files.'}
          </DialogDescription>
        </DialogHeader>

        <Formik
          initialValues={initialValues}
          validationSchema={agentValidationSchema}
          onSubmit={(values, { setSubmitting }) => {
            handleSubmit(values)
            setSubmitting(false)
          }}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            setFieldValue,
            isValid,
            dirty,
          }) => (
            <Form className='space-y-4'>
              <Tabs defaultValue='basic' className='w-full'>
                <TabsList className='grid w-full grid-cols-2'>
                  <TabsTrigger value='basic'>Basic</TabsTrigger>
                  <TabsTrigger value='advanced'>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value='basic' className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>Agent Name</Label>
                    <Input
                      id='name'
                      name='name'
                      value={values.name}
                      onChange={handleChange}
                      placeholder='Enter agent name'
                      className={
                        errors.name && touched.name ? 'border-red-500' : ''
                      }
                    />
                    {errors.name && touched.name && (
                      <p className='mt-1 text-xs text-red-500'>{errors.name}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      name='description'
                      value={values.description}
                      onChange={handleChange}
                      placeholder='Enter agent description (optional)'
                      className={
                        errors.description && touched.description
                          ? 'border-red-500'
                          : ''
                      }
                      rows={3}
                    />
                    {errors.description && touched.description && (
                      <p className='mt-1 text-xs text-red-500'>
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='prompt'>Prompt</Label>
                    <Select
                      value={values.prompt ? String(values.prompt) : ''}
                      onValueChange={(value) =>
                        setFieldValue('prompt', Number(value))
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.prompt && touched.prompt
                            ? 'border-red-500'
                            : ''
                        }
                      >
                        <SelectValue placeholder='Select a prompt' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[200px]'>
                        {prompts.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.title || 'Untitled'} (v{p.version || 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.prompt && touched.prompt && (
                      <p className='mt-1 text-xs text-red-500'>
                        {errors.prompt}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='llm'>Language Model</Label>
                    <Select
                      value={String(values.llm || '')}
                      onValueChange={(value) =>
                        setFieldValue('llm', Number(value))
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.llm && touched.llm ? 'border-red-500' : ''
                        }
                      >
                        <SelectValue placeholder='Select a model' />
                      </SelectTrigger>
                      <SelectContent className='max-h-[200px]'>
                        {availableModels.map((model) => (
                          <SelectItem key={model.id} value={String(model.id)}>
                            {model.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.llm && touched.llm && (
                      <p className='mt-1 text-xs text-red-500'>{errors.llm}</p>
                    )}
                  </div>

                  {/* Content Files */}
                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2 text-xs font-medium'>
                      <FileText className='h-3 w-3' />
                      Content Files
                    </Label>
                    <div className='flex flex-wrap gap-1'>
                      {(values.contentFiles || []).map((fileId) => {
                        const file = files.find((f) => f.id === fileId)
                        return (
                          <Badge
                            key={fileId}
                            variant='secondary'
                            className='text-xs'
                          >
                            {file?.name || `File ${fileId}`}
                            <Button
                              size='sm'
                              variant='ghost'
                              className='ml-1 h-4 w-4 p-0'
                              type='button'
                              onClick={() => {
                                const newFiles = (
                                  values.contentFiles || []
                                ).filter((id) => id !== fileId)
                                setFieldValue('contentFiles', newFiles)
                              }}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )
                      })}
                      <Select
                        value=''
                        onValueChange={(value) => {
                          const fileId = Number(value)
                          const currentFiles = values.contentFiles || []
                          if (value && !currentFiles.includes(fileId)) {
                            const newFiles = [...currentFiles, fileId]
                            setFieldValue('contentFiles', newFiles)
                          }
                        }}
                      >
                        <SelectTrigger className='w-full bg-background text-xs'>
                          <SelectValue placeholder='+ Add' />
                        </SelectTrigger>
                        <SelectContent>
                          {files
                            .filter(
                              (f) => !(values.contentFiles || []).includes(f.id)
                            )
                            .map((file) => (
                              <SelectItem
                                key={file.id}
                                value={file.id.toString()}
                              >
                                {file.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Embedding Files */}
                  <div className='space-y-2'>
                    <Label className='flex items-center gap-2 text-xs font-medium'>
                      <Database className='h-3 w-3' />
                      Embedding Files
                    </Label>
                    <div className='flex flex-wrap gap-1'>
                      {(values.embeddingFiles || []).map((fileId) => {
                        const file = files.find((f) => f.id === fileId)
                        return (
                          <Badge
                            key={fileId}
                            variant='secondary'
                            className='text-xs'
                          >
                            {file?.name || `File ${fileId}`}
                            <Button
                              size='sm'
                              variant='ghost'
                              className='ml-1 h-4 w-4 p-0'
                              type='button'
                              onClick={() => {
                                const newFiles = (
                                  values.embeddingFiles || []
                                ).filter((id) => id !== fileId)
                                setFieldValue('embeddingFiles', newFiles)
                              }}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </Badge>
                        )
                      })}
                      <Select
                        value=''
                        onValueChange={(value) => {
                          const fileId = Number(value)
                          const currentFiles = values.embeddingFiles || []
                          if (value && !currentFiles.includes(fileId)) {
                            const newFiles = [...currentFiles, fileId]
                            setFieldValue('embeddingFiles', newFiles)
                          }
                        }}
                      >
                        <SelectTrigger className='w-full bg-background text-xs'>
                          <SelectValue placeholder='+ Add' />
                        </SelectTrigger>
                        <SelectContent>
                          {files
                            .filter(
                              (f) =>
                                !(values.embeddingFiles || []).includes(f.id)
                            )
                            .map((file) => (
                              <SelectItem
                                key={file.id}
                                value={file.id.toString()}
                              >
                                {file.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='advanced' className='space-y-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label>
                        Temperature: {values.temperature.toFixed(2)}
                      </Label>
                    </div>
                    <Slider
                      value={[values.temperature]}
                      onValueChange={(value) =>
                        setFieldValue('temperature', value[0])
                      }
                      min={0.1}
                      max={1}
                      step={0.05}
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Range: 0.1 (deterministic) to 1.0 (creative)
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='maxTokens'>Max Tokens</Label>
                    <Input
                      id='maxTokens'
                      name='maxTokens'
                      type='number'
                      value={values.maxTokens}
                      onChange={handleChange}
                      min='1'
                      className={
                        errors.maxTokens && touched.maxTokens
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {errors.maxTokens && touched.maxTokens && (
                      <p className='mt-1 text-xs text-red-500'>
                        {errors.maxTokens}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='maxContextSnippets'>
                      Max Context Snippets
                    </Label>
                    <Input
                      id='maxContextSnippets'
                      name='maxContextSnippets'
                      type='number'
                      value={values.maxContextSnippets}
                      onChange={handleChange}
                      min='0'
                      className={
                        errors.maxContextSnippets && touched.maxContextSnippets
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {errors.maxContextSnippets &&
                      touched.maxContextSnippets && (
                        <p className='mt-1 text-xs text-red-500'>
                          {errors.maxContextSnippets}
                        </p>
                      )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='documentSimilarityThreshold'>
                        Document Similarity Threshold:{' '}
                        {values.documentSimilarityThreshold.toFixed(2)}
                      </Label>
                    </div>
                    <Slider
                      value={[values.documentSimilarityThreshold]}
                      onValueChange={(value) =>
                        setFieldValue('documentSimilarityThreshold', value[0])
                      }
                      min={0}
                      max={1}
                      step={0.01}
                      className='w-full'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Minimum similarity score for document retrieval
                    </p>
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='enableWebSearch'>Enable Web Search</Label>
                      <p className='text-xs text-muted-foreground'>
                        Allow this agent to search the web for information
                      </p>
                    </div>
                    <Switch
                      id='enableWebSearch'
                      checked={values.enableWebSearch}
                      onCheckedChange={(checked) =>
                        setFieldValue('enableWebSearch', checked)
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter className='flex justify-end gap-2 pt-4'>
                <Button type='button' variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button type='submit' disabled={!(isValid && dirty) || loading}>
                  {loading ? 'Saving...' : 'Save Agent'}
                </Button>
              </DialogFooter>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  )
}

export default AgentModal
