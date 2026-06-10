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
    name: 'amber-minimal',
    label: 'Amber Minimal',
    description: 'Clean and minimal with warm amber accents',
    swatches: [
      'oklch(0.7686 0.1647 70.0804)',
      'oklch(0.9869 0.0214 95.2774)',
      'oklch(1 0 0)',
    ],
  },
  {
    name: 'amethyst-haze',
    label: 'Amethyst Haze',
    description: 'Elegant purple theme with mystical vibes',
    swatches: [
      'oklch(0.488 0.243 264.376)',
      'oklch(0.97 0 0)',
      'oklch(0.985 0 0)',
    ],
  },
  {
    name: 'bold-tech',
    label: 'Bold Tech',
    description: 'Modern tech-focused with bold blue accents',
    swatches: [
      'oklch(0.6 0.118 184.704)',
      'oklch(0.95 0 0)',
      'oklch(0.98 0 0)',
    ],
  },
  {
    name: 'bubblegum',
    label: 'Bubblegum',
    description: 'Soft pinks and purples with playful tone',
    swatches: [
      'oklch(0.6209 0.1801 348.1385)',
      'oklch(0.9195 0.0801 87.667)',
      'oklch(0.9399 0.0203 345.6985)',
    ],
  },
  {
    name: 'caffeine',
    label: 'Caffeine',
    description: 'Bold, energetic palette with caffeine vibes',
    swatches: [
      'oklch(0.4341 0.0392 41.9938)',
      'oklch(0.931 0 0)',
      'oklch(0.9821 0 0)',
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
    name: 'ember',
    label: 'Ember',
    description: 'Warm crimson and bronze with a fireside glow',
    swatches: [
      'oklch(0.5 0.18 27)',
      'oklch(0.9 0.04 70)',
      'oklch(0.985 0.008 80)',
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
    name: 'ocean-breeze',
    label: 'Ocean Breeze',
    description: 'Refreshing blues and greens with coastal feel',
    swatches: [
      'oklch(0.7227 0.192 149.5793)',
      'oklch(0.9505 0.0507 163.0508)',
      'oklch(0.9751 0.0127 244.2507)',
    ],
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
  {
    name: 'sunset-horizon',
    label: 'Sunset Horizon',
    description: 'Warm sunset-inspired orange and red tones',
    swatches: [
      'oklch(0.646 0.222 41.116)',
      'oklch(0.97 0 0)',
      'oklch(0.99 0 0)',
    ],
  },
  {
    name: 't3-chat',
    label: 'T3 Chat',
    description: 'Tech-inspired chat UI aesthetic',
    swatches: [
      'oklch(0.5316 0.1409 355.1999)',
      'oklch(0.8696 0.0675 334.8991)',
      'oklch(0.9754 0.0084 325.6414)',
    ],
  },
  {
    name: 'twitter',
    label: 'Twitter',
    description: 'Modern, clean theme inspired by Twitter',
    swatches: [
      'oklch(0.6723 0.1606 244.9955)',
      'oklch(0.9392 0.0166 250.8453)',
      'oklch(1 0 0)',
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
