import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { getAvailableModels } from '@/redux/aynscThunks/conversation'
import { LLMModel } from '@/redux/types/conversation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ReasoningStatus, ReasoningStatusColors } from '@/utils/constants/model'
import { CheckCircle, XCircle, FileText, ExternalLink } from 'lucide-react'

const Help = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { availableModels, loading, error } = useSelector(
    (state: RootState) => state.conversation
  )

  useEffect(() => {
    dispatch(getAvailableModels())
  }, [dispatch])

  const formatCurrency = (value: string | number | undefined): string => {
    if (value === undefined) return '-'
    const numValue =
      typeof value === 'string' ? parseFloat(value) : Number(value)
    return isNaN(numValue) ? '-' : `$${numValue.toFixed(2)}`
  }

  if (loading) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center'>
        <div className='animate-pulse text-center'>
          <p className='text-lg font-medium text-gray-500'>Loading models...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-700'>
        <p>Error loading models: {error}</p>
      </div>
    )
  }

  return (
    <ScrollArea className='h-full'>
      <div className='flex-1 space-y-6 p-4 pt-6 md:p-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold tracking-tight'>
            Help & Documentation
          </h1>
        </div>

        <Card className='overflow-hidden shadow-md'>
          <CardHeader>
            <CardTitle className='flex items-center text-xl'>
              <FileText className='mr-2 h-5 w-5' />
              User Documentation
            </CardTitle>
            <CardDescription>
              Essential guides and information on using the DARE LLM Gateway
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-md'>
                <a
                  href='https://docs.google.com/document/d/12t1EinvBwM4MsSSjvlWpNvav1dWW32zo1A9FhY8BfLM/edit?tab=t.0#heading=h.h5z6kf1kmw3f'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-start justify-between'
                >
                  <div>
                    <h3 className='font-medium text-gray-900'>
                      DARE LLM Gateway User Guide
                    </h3>
                    <p className='mt-1 text-sm text-gray-500'>
                      Comprehensive guide to using the DARE platform, including
                      features, workflows, and best practices.
                    </p>
                  </div>
                  <ExternalLink className='h-5 w-5 flex-shrink-0 text-blue-500' />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className='mt-4'>
          <h2 className='mb-4 text-2xl font-semibold tracking-tight'>
            Available AI Models
          </h2>
        </div>
        {availableModels.length === 0 ? (
          <div className='rounded-lg border border-gray-200 bg-gray-50 p-8 text-center'>
            <p className='text-gray-500'>
              No AI models available at the moment.
            </p>
          </div>
        ) : (
          <Card className='overflow-hidden shadow-md'>
            <CardHeader>
              <CardTitle className='text-xl'>Model Details</CardTitle>
              <CardDescription>
                Detailed information about the AI models currently available in
                the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader className=''>
                  <TableRow>
                    <TableHead className='font-semibold'>Name</TableHead>
                    <TableHead className='font-semibold'>Identifier</TableHead>
                    <TableHead className='font-semibold'>Description</TableHead>
                    <TableHead className='text-left font-semibold'>
                      <div className='flex flex-col items-start'>
                        <span>Input Tokens</span>
                        <span className='text-xs text-gray-500'>
                          Per Million
                        </span>
                      </div>
                    </TableHead>

                    <TableHead className='text-left font-semibold'>
                      <div className='flex flex-col items-start'>
                        <span>Output Tokens</span>
                        <span className='text-xs text-gray-500'>
                          Per Million
                        </span>
                      </div>
                    </TableHead>

                    <TableHead className='font-semibold'>
                      Reasoning Model
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableModels.map((model: LLMModel) => {
                    const reasoningStatus = model.isReasoning
                      ? ReasoningStatus.Yes
                      : ReasoningStatus.No
                    const statusColors = ReasoningStatusColors[reasoningStatus]

                    return (
                      <TableRow
                        key={model.id}
                        className='hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      >
                        <TableCell className='font-medium'>
                          {model.name}
                        </TableCell>
                        <TableCell className='font-mono text-sm'>
                          {model.identifier || 'N/A'}
                        </TableCell>
                        <TableCell className='max-w-xs'>
                          {model.description || 'No description available.'}
                        </TableCell>
                        <TableCell className='text-left font-mono'>
                          {formatCurrency(model.inputTokenRatePerMillion)}
                        </TableCell>
                        <TableCell className='text-left font-mono'>
                          {formatCurrency(model.outputTokenRatePerMillion)}
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <Badge
                              variant='outline'
                              className={`flex items-center gap-1 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
                            >
                              {model.isReasoning ? (
                                <CheckCircle
                                  className={`h-3.5 w-3.5 ${statusColors.icon}`}
                                />
                              ) : (
                                <XCircle
                                  className={`h-3.5 w-3.5 ${statusColors.icon}`}
                                />
                              )}
                              {reasoningStatus}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
        <div className='rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30'>
          <h2 className='mb-2 font-semibold text-blue-800 dark:text-blue-300'>
            About Model Token Rates
          </h2>
          <p className='text-sm text-blue-700 dark:text-blue-400'>
            Token rates are listed per million tokens. The actual cost of a
            request is calculated based on the number of tokens processed. Input
            tokens refer to the text you send to the model, while output tokens
            are those generated in response.
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}

export default Help
