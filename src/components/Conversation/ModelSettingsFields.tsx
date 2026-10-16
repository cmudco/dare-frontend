import React from 'react'
import { Info } from 'lucide-react'

import { MODEL_CONFIG } from '@/config/modelConfig'
import { TOOLTIP_CONTENT } from '@/constants/tooltipContent'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'
import { cn } from '@/lib/utils'
import {
  ModelSettings,
  PickerModel,
  WalletMeta,
} from '@/redux/types/conversation'
import { EffortLevel, EffortLevelLabels } from '@/utils/constants/model'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '../ui/tooltip'

const ADAPTIVE_EFFORT_GUIDANCE: Record<
  EffortLevel,
  { recommendedTokens: number; description: string }
> = {
  [EffortLevel.Low]: {
    recommendedTokens: 16384,
    description: 'Low effort favors faster, lower-cost responses.',
  },
  [EffortLevel.Medium]: {
    recommendedTokens: 32768,
    description: 'Medium effort balances reasoning depth, latency, and cost.',
  },
  [EffortLevel.High]: {
    recommendedTokens: 32768,
    description: 'High effort may spend more of the response budget thinking.',
  },
  [EffortLevel.XHigh]: {
    recommendedTokens: 65536,
    description: 'XHigh effort prioritizes deep reasoning over speed and cost.',
  },
  [EffortLevel.Max]: {
    recommendedTokens: 65536,
    description: 'Max effort allows the deepest and most expensive reasoning.',
  },
}

interface ModelSettingsFieldsProps {
  settings: ModelSettings
  onChange: (patch: Partial<ModelSettings>) => void
  /** The chosen model; its capabilities decide which controls appear. */
  model: PickerModel | undefined
  walletMeta: WalletMeta | null
  /** Context-specific toggles rendered after the shared ones. */
  extraToggles?: React.ReactNode
}

interface InfoLabelProps {
  title: string
  description: string
  tip?: string
  className?: string
}

const InfoLabel: React.FC<InfoLabelProps> = ({
  title,
  description,
  tip,
  className,
}) => (
  <div className='flex items-center gap-2'>
    <h4 className={cn('font-medium text-foreground', className)}>{title}</h4>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info
          className='h-3.5 w-3.5 cursor-help text-muted-foreground'
          aria-label={`About ${title}`}
        />
      </TooltipTrigger>
      {/* Portalled so a scrolling host (the agent dialog) cannot clip it. */}
      <TooltipPortal>
        <TooltipContent className='max-w-xs'>
          <div className='space-y-2'>
            <p className='font-semibold'>{title}</p>
            <p className='text-sm'>{description}</p>
            {tip && <p className='text-xs text-muted-foreground'>💡 {tip}</p>}
          </div>
        </TooltipContent>
      </TooltipPortal>
    </Tooltip>
  </div>
)

interface ToggleRowProps extends InfoLabelProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  checked,
  onCheckedChange,
  ...label
}) => (
  <div className='flex items-center justify-between border-b border-border pb-2'>
    <InfoLabel {...label} />
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label.title}
    />
  </div>
)

/** Model settings shown for the chosen model, for a chat or an agent. */
const ModelSettingsFields: React.FC<ModelSettingsFieldsProps> = ({
  settings,
  onChange,
  model,
  walletMeta,
  extraToggles,
}) => {
  const enableArtifacts = useFeatureFlag('enableArtifacts')

  const showTemperature = model?.supportsTemperature ?? true
  // Legacy wallets send no capability flags; treat that as fully capable.
  const showWebSearch =
    (walletMeta?.supportsWebSearch ?? true) &&
    (model?.supportsWebSearch ?? true)
  const provider = model?.provider?.toLowerCase()
  const isGemini = provider === 'gemini'
  const showWebFetch =
    showWebSearch && (provider === 'claude' || provider === 'gemini')
  const showEffort = model?.supportsEffort ?? false

  const requestedEffort =
    settings.effort ?? model?.defaultEffort ?? EffortLevel.High
  const effort =
    isGemini &&
    (requestedEffort === EffortLevel.XHigh ||
      requestedEffort === EffortLevel.Max)
      ? EffortLevel.High
      : requestedEffort
  const effortOptions = isGemini
    ? [EffortLevel.Low, EffortLevel.Medium, EffortLevel.High]
    : Object.values(EffortLevel)
  const usesAdaptiveThinking = model?.supportsAdaptiveThinking ?? false
  const effortGuidance = ADAPTIVE_EFFORT_GUIDANCE[effort]

  return (
    <div className='flex flex-col gap-4'>
      <div className='space-y-4'>
        {showWebSearch && (
          <ToggleRow
            {...TOOLTIP_CONTENT.modelConfig.webSearch}
            checked={settings.webSearchEnabled}
            onCheckedChange={(checked) =>
              onChange({ webSearchEnabled: checked })
            }
          />
        )}
        {showWebFetch && (
          <ToggleRow
            title='Web Fetch'
            description='Let the selected provider fetch explicit URLs and PDFs from the conversation.'
            tip='Use for research papers, arXiv links, and source pages you paste into the prompt.'
            checked={settings.webFetchEnabled}
            onCheckedChange={(checked) =>
              onChange({ webFetchEnabled: checked })
            }
          />
        )}
        {extraToggles}
        {enableArtifacts && (
          <ToggleRow
            {...TOOLTIP_CONTENT.modelConfig.artifacts}
            className={
              settings.artifactsEnabled
                ? 'bg-linear-to-r from-orange-500 via-violet-500 to-sky-400 bg-clip-text text-transparent'
                : undefined
            }
            checked={settings.artifactsEnabled}
            onCheckedChange={(checked) =>
              onChange({ artifactsEnabled: checked })
            }
          />
        )}
      </div>

      {showEffort && (
        <div className='space-y-3 border-t border-border pt-2'>
          <div className='flex items-center justify-between'>
            <InfoLabel
              title='Effort'
              description='Controls reasoning depth for models that support provider-native effort settings.'
            />
            <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
              {EffortLevelLabels[effort]}
            </span>
          </div>
          <div
            className={cn(
              'grid gap-1',
              isGemini ? 'grid-cols-3' : 'grid-cols-5'
            )}
          >
            {effortOptions.map((value) => (
              <Button
                key={value}
                type='button'
                size='sm'
                variant={effort === value ? 'default' : 'outline'}
                className='h-8 px-1 text-xs'
                onClick={() => onChange({ effort: value })}
              >
                {EffortLevelLabels[value]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {showTemperature && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <InfoLabel {...TOOLTIP_CONTENT.modelConfig.temperature} />
            <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
              {settings.temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            value={[settings.temperature]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={(values) => onChange({ temperature: values[0] })}
            className='my-4 cursor-pointer'
            aria-label='Temperature'
          />
          <div className='flex justify-between px-1 text-xs text-muted-foreground'>
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </div>
      )}

      <div className='space-y-4 border-t border-border pt-2'>
        <div className='flex items-center justify-between'>
          <InfoLabel {...TOOLTIP_CONTENT.modelConfig.maxTokens} />
          <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
            {settings.maxTokens}
          </span>
        </div>
        <Slider
          value={[settings.maxTokens]}
          min={256}
          max={MODEL_CONFIG.maxTokensCeiling}
          step={256}
          onValueChange={(values) => onChange({ maxTokens: values[0] })}
          className='my-4 cursor-pointer'
          aria-label='Max tokens'
        />
        {usesAdaptiveThinking && (
          <p className='text-xs text-muted-foreground'>
            This ceiling is shared by hidden thinking and visible text.
            {` ${effortGuidance.description} Start with ${effortGuidance.recommendedTokens.toLocaleString()} tokens.`}
          </p>
        )}
        {usesAdaptiveThinking &&
          settings.maxTokens < effortGuidance.recommendedTokens && (
            <p className='text-xs text-destructive'>
              {EffortLevelLabels[effort]} effort with this ceiling can leave too
              little room for the visible answer.
            </p>
          )}
      </div>

      <div className='space-y-4 border-t border-border pt-2'>
        <div className='flex items-center justify-between'>
          <InfoLabel {...TOOLTIP_CONTENT.modelConfig.historyLimit} />
          <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
            {settings.historyLimit === 50
              ? 'Full Context'
              : settings.historyLimit}
          </span>
        </div>
        <Slider
          value={[settings.historyLimit]}
          min={1}
          max={50}
          step={1}
          onValueChange={(values) => onChange({ historyLimit: values[0] })}
          className='my-4 cursor-pointer'
          aria-label='History limit'
        />
        <div className='flex justify-between px-1 text-xs text-muted-foreground'>
          <span>Minimal</span>
          <span>Standard</span>
          <span>Max</span>
        </div>
      </div>
    </div>
  )
}

export default ModelSettingsFields
