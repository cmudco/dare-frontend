import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { BackgroundTaskModel } from '@/redux/types/backgroundModels'

const PAYER_LABEL: Record<string, string> = {
  DARE: 'DARE wallet',
  BYO: 'Your API key',
  LITELLM: 'Your LiteLLM proxy',
}

interface TaskModelsCardProps {
  tasks: BackgroundTaskModel[]
}

/** Which model runs each background task right now, and who pays for it. */
const TaskModelsCard = ({ tasks }: TaskModelsCardProps) => (
  <Card className='border-border bg-card p-6'>
    <h3 className='text-lg font-semibold text-card-foreground'>
      What runs in the background
    </h3>
    <p className='mt-1 text-sm text-muted-foreground'>
      DARE uses a model behind the scenes to name your chats, summarize long
      conversations, pick out things worth remembering, and rewrite your
      questions before searching your documents.
    </p>
    <ul className='mt-5 divide-y divide-border'>
      {tasks.map((task) => (
        <li
          key={task.task}
          className='flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between'
        >
          <span className='text-sm font-medium'>{task.label}</span>
          {task.source === 'unavailable' ? (
            <Badge variant='destructive'>Not configured</Badge>
          ) : (
            <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
              <span className='text-sm' title={task.modelIdentifier}>
                {task.modelName}
              </span>
              <Badge variant={task.source === 'user' ? 'default' : 'secondary'}>
                {task.sourceLabel}
              </Badge>
              <Badge variant='outline'>
                {PAYER_LABEL[task.walletType] ?? task.walletType}
              </Badge>
            </div>
          )}
        </li>
      ))}
    </ul>
  </Card>
)

export default TaskModelsCard
