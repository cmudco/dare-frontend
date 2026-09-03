import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Gavel,
  RotateCcw,
  Save,
  Scale,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AppDispatch, RootState } from '@/redux/store'
import {
  applyEnsembleBriefs,
  setEnsembleAngle,
  setEnsembleBrief,
} from '@/redux/conversationSlice'
import {
  fetchEnsembleBriefs,
  removeEnsemblePreset,
  saveEnsemblePreset,
} from '@/redux/ensembleSlice'
import type {
  EnsembleBriefs,
  EnsembleRole,
  PickerModel,
} from '@/redux/types/conversation'
import { useEnsembleEstimate } from '@/hooks/useEnsembleEstimate'
import { getProviderBrand } from '@/utils/providerColors'
import { EMPTY_BRIEFS, hasCustomBriefs } from '@/utils/ensemble'
import { BUILT_IN_PRESETS } from '@/utils/ensemblePresets'

const ROLE_META: Record<
  EnsembleRole,
  {
    title: string
    icon: React.ElementType
    can: string[]
    cannot: string[]
  }
> = {
  responder: {
    title: 'Responders',
    icon: Users,
    can: ['web', 'files', 'MCP'],
    cannot: ['artifacts'],
  },
  evaluator: {
    title: 'Reviewers',
    icon: Scale,
    can: ['drafts only'],
    cannot: [],
  },
  chairman: {
    title: 'Chairman',
    icon: Gavel,
    can: ['artifacts'],
    cannot: ['web', 'MCP'],
  },
}

const Pill: React.FC<{ on: boolean; children: React.ReactNode }> = ({
  on,
  children,
}) => (
  <span
    className={`rounded-full px-1.5 py-px text-[10px] font-medium whitespace-nowrap ${
      on
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground line-through decoration-muted-foreground/60'
    }`}
  >
    {children}
  </span>
)

const SeatLogo: React.FC<{ model: PickerModel }> = ({ model }) => {
  const brand = getProviderBrand(model.provider)
  return brand.logo ? (
    <img
      src={brand.logo}
      alt={brand.name}
      title={model.name}
      className='h-5 w-5 shrink-0 rounded-md border border-border bg-background object-contain p-0.5'
    />
  ) : (
    <span
      title={model.name}
      className='flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[9px] font-bold uppercase'
    >
      {model.provider.charAt(0)}
    </span>
  )
}

interface RoleCardProps {
  role: EnsembleRole
  value: string | null
  defaultText: string
  disabledNote?: string
  open: boolean
  onToggle: () => void
  onChange: (text: string | null) => void
  children?: React.ReactNode
}

/** One role's brief: what it may do, what it is told, and whether that is the default. */
const RoleCard: React.FC<RoleCardProps> = ({
  role,
  value,
  defaultText,
  disabledNote,
  open,
  onToggle,
  onChange,
  children,
}) => {
  const meta = ROLE_META[role]
  const Icon = meta.icon
  const custom = value !== null
  const text = value ?? defaultText

  return (
    <div
      className={`rounded-lg border border-border bg-card ${disabledNote ? 'opacity-60' : ''}`}
    >
      <button
        type='button'
        onClick={onToggle}
        aria-expanded={open}
        disabled={!!disabledNote}
        className='flex w-full items-center gap-2 px-3 py-2 text-left disabled:cursor-default'
      >
        <Icon className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
        <span className='text-xs font-semibold text-foreground'>
          {meta.title}
        </span>
        {custom && (
          <span className='rounded-full bg-primary/10 px-1.5 py-px text-[10px] font-medium text-primary'>
            custom
          </span>
        )}
        <span className='ml-auto flex items-center gap-1'>
          {disabledNote ? (
            <span className='text-[10px] text-muted-foreground'>
              {disabledNote}
            </span>
          ) : (
            <>
              {meta.can.map((c) => (
                <Pill key={c} on>
                  {c}
                </Pill>
              ))}
              {meta.cannot.map((c) => (
                <Pill key={c} on={false}>
                  {c}
                </Pill>
              ))}
            </>
          )}
        </span>
        {!disabledNote &&
          (open ? (
            <ChevronDown className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
          ) : (
            <ChevronRight className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
          ))}
      </button>

      {open && !disabledNote && (
        <div className='space-y-2 border-t border-border px-3 py-2'>
          <Textarea
            value={text}
            onChange={(e) => {
              const next = e.target.value
              onChange(next.trim() === defaultText.trim() ? null : next)
            }}
            spellCheck={false}
            className='min-h-[88px] resize-y bg-background text-xs leading-relaxed'
            aria-label={`${meta.title} brief`}
          />
          <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
            <span>
              {custom ? 'Your brief for this role.' : 'The default brief.'}
            </span>
            {custom && (
              <button
                type='button'
                onClick={() => onChange(null)}
                className='flex items-center gap-1 hover:text-foreground'
              >
                <RotateCcw className='h-3 w-3' />
                Use default
              </button>
            )}
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * What each seat on the bench is told. Role briefs replace the defaults for
 * this turn; per-seat angles are appended so the same brief can still send
 * three models in three directions. Presets save the whole set.
 */
const BriefsSection: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { ensemble, responders } = useEnsembleEstimate()
  const { defaults, presets, loaded, saving } = useSelector(
    (s: RootState) => s.ensemble
  )
  const { briefs } = ensemble
  const [openRole, setOpenRole] = useState<EnsembleRole | null>('responder')
  const [presetId, setPresetId] = useState('builtin:default')
  const [naming, setNaming] = useState(false)
  const [presetName, setPresetName] = useState('')

  useEffect(() => {
    if (!loaded) dispatch(fetchEnsembleBriefs())
  }, [dispatch, loaded])

  const custom = hasCustomBriefs(briefs)
  const userPreset = presetId.startsWith('user:')
    ? presets.find((p) => `user:${p.id}` === presetId)
    : undefined

  const apply = (id: string, next: EnsembleBriefs) => {
    setPresetId(id)
    dispatch(applyEnsembleBriefs(next))
  }

  const handlePreset = (id: string) => {
    const builtIn = BUILT_IN_PRESETS.find((p) => p.id === id)
    if (builtIn) return apply(id, builtIn.briefs)
    const saved = presets.find((p) => `user:${p.id}` === id)
    if (saved) {
      apply(id, {
        responder: saved.responder || null,
        evaluator: saved.evaluator || null,
        chairman: saved.chairman || null,
        angles: saved.angles,
      })
    }
  }

  const handleSave = async () => {
    const name = presetName.trim()
    if (!name) return
    const result = await dispatch(
      saveEnsemblePreset({
        name,
        responder: briefs.responder ?? '',
        evaluator: briefs.evaluator ?? '',
        chairman: briefs.chairman ?? '',
        angles: briefs.angles,
      })
    )
    if (saveEnsemblePreset.fulfilled.match(result)) {
      setPresetId(`user:${result.payload.id}`)
      setNaming(false)
      setPresetName('')
    }
  }

  const setBrief = (role: EnsembleRole) => (text: string | null) => {
    dispatch(setEnsembleBrief({ role, text }))
    setPresetId('builtin:custom')
  }

  const toggle = (role: EnsembleRole) =>
    setOpenRole((current) => (current === role ? null : role))

  return (
    <div className='space-y-2 px-2 pb-2'>
      <div className='flex items-center gap-2'>
        <span className='text-[11px] font-medium tracking-wide text-muted-foreground uppercase'>
          Briefs
        </span>
        <div className='ml-auto flex items-center gap-1'>
          <Select value={presetId} onValueChange={handlePreset}>
            <SelectTrigger
              className='h-7 w-[170px] bg-background text-xs'
              aria-label='Brief preset'
            >
              <SelectValue placeholder='Preset' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {BUILT_IN_PRESETS.map((p) => (
                  <SelectItem key={p.id} value={p.id} className='text-xs'>
                    {p.name}
                  </SelectItem>
                ))}
                {presetId === 'builtin:custom' && (
                  <SelectItem value='builtin:custom' className='text-xs'>
                    Custom
                  </SelectItem>
                )}
              </SelectGroup>
              {presets.length > 0 && (
                <SelectGroup>
                  <SelectLabel className='text-[10px]'>Yours</SelectLabel>
                  {presets.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={`user:${p.id}`}
                      className='text-xs'
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </SelectContent>
          </Select>
          {userPreset ? (
            <button
              type='button'
              title={`Delete “${userPreset.name}”`}
              aria-label={`Delete preset ${userPreset.name}`}
              onClick={() => {
                dispatch(removeEnsemblePreset(userPreset.id))
                setPresetId('builtin:custom')
              }}
              className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-destructive'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          ) : (
            <button
              type='button'
              title='Save these briefs as a preset'
              aria-label='Save as preset'
              disabled={!custom}
              onClick={() => setNaming((v) => !v)}
              className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40'
            >
              <Save className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      {naming && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSave()
          }}
          className='flex items-center gap-1'
        >
          <Input
            autoFocus
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder='Preset name'
            maxLength={80}
            className='h-7 bg-background text-xs'
          />
          <button
            type='submit'
            disabled={saving || !presetName.trim()}
            aria-label='Save preset'
            className='flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40'
          >
            <Check className='h-3.5 w-3.5' />
          </button>
          <button
            type='button'
            onClick={() => setNaming(false)}
            aria-label='Cancel'
            className='flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        </form>
      )}

      <RoleCard
        role='responder'
        value={briefs.responder}
        defaultText={defaults?.responder ?? ''}
        open={openRole === 'responder'}
        onToggle={() => toggle('responder')}
        onChange={setBrief('responder')}
      >
        <div className='space-y-1.5 pt-1'>
          <p className='text-[10px] font-medium tracking-wide text-muted-foreground uppercase'>
            Per-seat angle · optional
          </p>
          {responders.length === 0 && (
            <p className='text-[11px] text-muted-foreground'>
              Pick models on the bench to give each seat an angle.
            </p>
          )}
          {responders.map((model, seat) => (
            <div key={model.id} className='flex items-center gap-2'>
              <SeatLogo model={model} />
              <Input
                value={briefs.angles[seat] ?? ''}
                onChange={(e) => {
                  dispatch(setEnsembleAngle({ seat, text: e.target.value }))
                  setPresetId('builtin:custom')
                }}
                placeholder={`${model.name}: play the skeptic, lead with data…`}
                maxLength={300}
                aria-label={`Angle for ${model.name}`}
                className='h-7 bg-background text-xs'
              />
            </div>
          ))}
        </div>
      </RoleCard>

      <RoleCard
        role='evaluator'
        value={briefs.evaluator}
        defaultText={defaults?.evaluator ?? ''}
        disabledNote={
          ensemble.depth === 'council' ? undefined : 'turns on with Council'
        }
        open={openRole === 'evaluator'}
        onToggle={() => toggle('evaluator')}
        onChange={setBrief('evaluator')}
      />

      <RoleCard
        role='chairman'
        value={briefs.chairman}
        defaultText={defaults?.chairman ?? ''}
        open={openRole === 'chairman'}
        onToggle={() => toggle('chairman')}
        onChange={setBrief('chairman')}
      />

      <div className='flex items-center justify-between px-1 text-[11px] text-muted-foreground'>
        <span>
          {custom
            ? 'These briefs apply to your next turns in this chat.'
            : 'Every seat runs on the default briefs.'}
        </span>
        {custom && (
          <button
            type='button'
            onClick={() => apply('builtin:default', EMPTY_BRIEFS)}
            className='flex items-center gap-1 hover:text-foreground'
          >
            <RotateCcw className='h-3 w-3' />
            Reset briefs
          </button>
        )}
      </div>
    </div>
  )
}

export default BriefsSection
