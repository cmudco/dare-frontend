import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { AppDispatch } from '@/redux/store'
import {
  ThemeMode,
  ThemeName,
  selectMode,
  selectTheme,
  setMode,
  setTheme,
} from '@/redux/themeSlice'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ThemeOption {
  name: ThemeName
  label: string
  description: string
  /* Light-variant primary / accent / background, shown as preview swatches.
     Hardcoded because CSS variables of non-active themes can't be resolved
     at runtime — keep in sync with src/themes/<name>.css. */
  swatches: [string, string, string]
}

const themes: ThemeOption[] = [
  {
    name: 'default',
    label: 'DARE',
    description: 'The classic DARE look with brand reds and deep blues',
    swatches: ['hsl(348 88% 52%)', 'hsl(214 100% 22%)', 'hsl(0 0% 100%)'],
  },
  {
    name: 'aurora',
    label: 'Aurora',
    description: 'Northern-lights teal and violet over deep indigo',
    swatches: [
      'oklch(0.5 0.17 300)',
      'oklch(0.91 0.05 190)',
      'oklch(0.98 0.008 220)',
    ],
  },
  {
    name: 'cobalt',
    label: 'Cobalt',
    description: 'Vivid blue on warm cream, deep navy at night',
    swatches: [
      'oklch(0.5 0.24 262)',
      'oklch(0.92 0.04 250)',
      'oklch(0.975 0.012 85)',
    ],
  },
  {
    name: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon green on near-black, matrix terminal vibes',
    swatches: [
      'oklch(0.85 0.21 155)',
      'oklch(0.13 0.015 170)',
      'oklch(0.98 0.01 160)',
    ],
  },
  {
    name: 'evergreen',
    label: 'Evergreen',
    description: 'Deep forest green and soft sage, calm and grounded',
    swatches: [
      'oklch(0.45 0.12 150)',
      'oklch(0.9 0.045 135)',
      'oklch(0.98 0.008 130)',
    ],
  },
  {
    name: 'midnight',
    label: 'Midnight',
    description: 'Deep blue-violet with cool lavender accents',
    swatches: [
      'oklch(0.5 0.21 282)',
      'oklch(0.17 0.04 285)',
      'oklch(0.98 0.005 280)',
    ],
  },
  {
    name: 'mono',
    label: 'Mono',
    description: 'Clean grayscale with sharp corners',
    swatches: ['oklch(0.2 0 0)', 'oklch(0.94 0 0)', 'oklch(1 0 0)'],
  },
  {
    name: 'rose',
    label: 'Rose',
    description: 'Soft pink and warm ivory, easy on the eyes',
    swatches: [
      'oklch(0.6 0.16 13)',
      'oklch(0.92 0.04 10)',
      'oklch(0.985 0.008 20)',
    ],
  },
]

const modes: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const AppearanceSettings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const currentTheme = useSelector(selectTheme)
  const currentMode = useSelector(selectMode)

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-semibold'>Appearance</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Choose your theme and color mode.
        </p>
      </div>

      <Card className='p-4 sm:p-6'>
        <div className='mb-6'>
          <Label className='mb-2 block text-sm font-medium'>Color Mode</Label>
          <div className='inline-flex rounded-lg border border-border p-1'>
            {modes.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type='button'
                onClick={() => dispatch(setMode(value))}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                  currentMode === value
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className='h-4 w-4' />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className='mb-3 text-sm font-medium'>Theme</div>
        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {themes.map((theme) => {
            const selected = currentTheme === theme.name
            return (
              <button
                key={theme.name}
                type='button'
                onClick={() => dispatch(setTheme(theme.name))}
                className={cn(
                  'group flex w-full items-start justify-between rounded-xl border p-4 text-left transition-all hover:shadow-sm',
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                )}
              >
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <span className='flex overflow-hidden rounded-full border border-border'>
                      {theme.swatches.map((color, i) => (
                        <span
                          key={i}
                          className='h-4 w-4'
                          style={{ background: color }}
                        />
                      ))}
                    </span>
                    <span className='text-sm font-medium'>{theme.label}</span>
                  </div>
                  <div className='mt-1 text-xs text-muted-foreground'>
                    {theme.description}
                  </div>
                </div>
                <div
                  className={cn(
                    'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  )}
                  aria-hidden
                >
                  {selected && <Check className='h-3.5 w-3.5' />}
                </div>
              </button>
            )
          })}
        </div>
      </Card>
    </div>
  )
}

export default AppearanceSettings
