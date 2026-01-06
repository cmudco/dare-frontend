import { Plus, Trash2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface Route {
  name: string
  description: string
}

interface RouteConfigPanelProps {
  /** Current routes configuration */
  routes: Route[]
  /** Callback when routes are updated */
  onRoutesChange: (routes: Route[]) => void
  /** Minimum number of routes required (default: 2) */
  minRoutes?: number
  /** Label for routes section */
  routesLabel?: string
  /** Placeholder for route name input */
  namePlaceholder?: string
  /** Placeholder for description input */
  descriptionPlaceholder?: string
  /** Custom styling variant (e.g., for StructuredOutput purple theme) */
  variant?: 'default' | 'purple'
}

/**
 * Shared route configuration panel for routing nodes.
 *
 * Provides UI for adding, editing, and removing routes with:
 * - Dynamic route addition/removal
 * - Route name and description inputs
 * - Minimum route enforcement
 * - Consistent styling across node types
 *
 * @example
 * ```tsx
 * <RouteConfigPanel
 *   routes={routes}
 *   onRoutesChange={(newRoutes) => updateNodeData({ routes: newRoutes })}
 *   routesLabel="Output Routes"
 *   variant="purple"
 * />
 * ```
 */
export function RouteConfigPanel({
  routes,
  onRoutesChange,
  minRoutes = 2,
  routesLabel = 'Routes',
  namePlaceholder = 'Route name',
  descriptionPlaceholder = 'Optional description',
  variant = 'default',
}: RouteConfigPanelProps) {
  const addRoute = () => {
    const newRoute: Route = {
      name: `Route ${String.fromCharCode(65 + routes.length)}`,
      description: '',
    }
    onRoutesChange([...routes, newRoute])
  }

  const removeRoute = (index: number) => {
    if (routes.length <= minRoutes) return
    onRoutesChange(routes.filter((_, i) => i !== index))
  }

  const updateRoute = (
    index: number,
    field: 'name' | 'description',
    value: string
  ) => {
    const newRoutes = routes.map((route, i) =>
      i === index ? { ...route, [field]: value } : route
    )
    onRoutesChange(newRoutes)
  }

  const containerStyles =
    variant === 'purple'
      ? 'space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800 dark:bg-purple-900/20'
      : 'space-y-3'

  const routeItemStyles =
    variant === 'purple'
      ? 'space-y-2 rounded-md border border-muted bg-white/80 p-3 dark:bg-background/50'
      : 'space-y-2 rounded-md border border-muted bg-muted/20 p-3'

  return (
    <div className={containerStyles}>
      <div className='flex items-center justify-between'>
        <Label className='text-xs font-medium'>
          {routesLabel} ({routes.length})
        </Label>
        <Button
          size='sm'
          variant='outline'
          onClick={addRoute}
          className='h-6 px-2 text-xs'
        >
          <Plus className='mr-1 h-3 w-3' />
          Add Route
        </Button>
      </div>

      {/* Dynamic Routes */}
      {routes.map((route, index) => (
        <div key={index} className={routeItemStyles}>
          <div className='flex items-center justify-between'>
            <Label className='text-xs text-muted-foreground'>
              Route {index + 1}
            </Label>
            {routes.length > minRoutes && (
              <Button
                size='sm'
                variant='ghost'
                onClick={() => removeRoute(index)}
                className='h-5 w-5 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive'
              >
                <Trash2 className='h-3 w-3' />
              </Button>
            )}
          </div>
          <Input
            placeholder={namePlaceholder}
            value={route.name}
            onChange={(e) => updateRoute(index, 'name', e.target.value)}
            className='text-sm'
          />
          <Input
            placeholder={descriptionPlaceholder}
            value={route.description}
            onChange={(e) => updateRoute(index, 'description', e.target.value)}
            className='text-sm'
          />
        </div>
      ))}
    </div>
  )
}
