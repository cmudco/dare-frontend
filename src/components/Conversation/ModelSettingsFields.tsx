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
import { supportsCodeSandbox } from '@/utils/modelConfigUtils'
import { Slider } from '../ui/slider'
import { StepSlider } from '../ui/step-slider'
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
  /** Shown under the label when set; the switch is disabled. */
  disabledReason?: string
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  checked,
  onCheckedChange,
  disabledReason,
  ...label
}) => (
  <div className='flex items-center justify-between border-b border-border pb-2'>
    <div className='min-w-0'>
      <InfoLabel {...label} />
      {disabledReason && (
        <p className='mt-0.5 text-xs text-muted-foreground'>{disabledReason}</p>
      )}
    </div>
    <Switch
      checked={checked && !disabledReason}
      onCheckedChange={onCheckedChange}
      disabled={!!disabledReason}
      aria-label={label.title}
    />
  </div>
)

interface SliderFieldProps {
  info: InfoLabelProps
  value: number
  min: number
  max: number
  step: number
  onCommit: (value: number) => void
  format?: (value: number) => React.ReactNode
  className?: string
  children?: React.ReactNode
}

// Holds the value while it is dragged, so only this row renders until release.
const SliderField: React.FC<SliderFieldProps> = ({
  info,
  value,
  onCommit,
  format = (shown) => shown,
  className,
  children,
  ...range
}) => {
  const [draft, setDraft] = React.useState<number | null>(null)

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex items-center justify-between'>
        <InfoLabel {...info} />
        <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
          {format(draft ?? value)}
        </span>
      </div>
      <Slider
        {...range}
        value={[draft ?? value]}
        onValueChange={([next]) => setDraft(next)}
        onValueCommit={([next]) => {
          onCommit(next)
          setDraft(null)
        }}
        className='my-4 cursor-pointer'
        aria-label={info.title}
      />
      {children}
    </div>
  )
}

interface EffortFieldProps {
  options: EffortLevel[]
  value: EffortLevel
  onCommit: (effort: EffortLevel) => void
}

// Names the level under the thumb while it is swept, and applies it on release.
const EffortField: React.FC<EffortFieldProps> = ({
  options,
  value,
  onCommit,
}) => {
  const [swept, setSwept] = React.useState<EffortLevel | null>(null)
  const shown = swept ?? value

  return (
    <div className='space-y-3 border-t border-border pt-2'>
      <div className='flex items-center justify-between'>
        <InfoLabel
          title='Effort'
          description='Controls reasoning depth for models that support provider-native effort settings.'
        />
        <span className='rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground'>
          {EffortLevelLabels[shown]}
        </span>
      </div>
      <StepSlider
        aria-label='Effort'
        labels={options.map((option) => EffortLevelLabels[option])}
        value={options.indexOf(shown)}
        onValueChange={(index) => setSwept(options[index])}
        onValueCommit={(index) => {
          onCommit(options[index])
          setSwept(null)
        }}
      />
      <div className='flex justify-between px-1 text-xs text-muted-foreground'>
        <span>Faster</span>
        <span>Smarter</span>
      </div>
    </div>
  )
}

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
  const showWebFetch =
    showWebSearch && (provider === 'claude' || provider === 'gemini')
  const sandboxAvailable = supportsCodeSandbox(model, walletMeta)
  const showEffort = model?.supportsEffort ?? false

  const allEfforts = Object.values(EffortLevel)
  const maxEffort = model?.maxEffort ?? EffortLevel.Max
  const effortOptions = allEfforts.slice(0, allEfforts.indexOf(maxEffort) + 1)
  const requestedEffort =
    settings.effort ?? model?.defaultEffort ?? EffortLevel.High
  const effort = effortOptions.includes(requestedEffort)
    ? requestedEffort
    : maxEffort
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
        <ToggleRow
          title='Code sandbox'
          description='Let the AI run Python on your full-text files (OpenAI and Claude models)'
          tip="Files are copied into a temporary container at the model's provider instead of being pasted into the prompt."
          checked={settings.codeSandboxEnabled}
          onCheckedChange={(checked) =>
            onChange({ codeSandboxEnabled: checked })
          }
          disabledReason={
            sandboxAvailable
              ? undefined
              : 'Pick an OpenAI or Claude model to use it.'
          }
        />
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
        <EffortField
          options={effortOptions}
          value={effort}
          onCommit={(next) => onChange({ effort: next })}
        />
      )}

      {showTemperature && (
        <SliderField
          info={TOOLTIP_CONTENT.modelConfig.temperature}
          value={settings.temperature}
          min={0}
          max={1}
          step={0.1}
          format={(shown) => shown.toFixed(1)}
          onCommit={(temperature) => onChange({ temperature })}
        >
          <div className='flex justify-between px-1 text-xs text-muted-foreground'>
            <span>Precise</span>
            <span>Balanced</span>
            <span>Creative</span>
          </div>
        </SliderField>
      )}

      <SliderField
        className='border-t border-border pt-2'
        info={TOOLTIP_CONTENT.modelConfig.maxTokens}
        value={settings.maxTokens}
        min={256}
        max={MODEL_CONFIG.maxTokensCeiling}
        step={256}
        onCommit={(maxTokens) => onChange({ maxTokens })}
      >
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
      </SliderField>

      <SliderField
        className='border-t border-border pt-2'
        info={TOOLTIP_CONTENT.modelConfig.historyLimit}
        value={settings.historyLimit}
        min={1}
        max={50}
        step={1}
        format={(shown) => (shown === 50 ? 'Full Context' : shown)}
        onCommit={(historyLimit) => onChange({ historyLimit })}
      >
        <div className='flex justify-between px-1 text-xs text-muted-foreground'>
          <span>Minimal</span>
          <span>Standard</span>
          <span>Max</span>
        </div>
      </SliderField>
    </div>
  )
}

export default ModelSettingsFields
