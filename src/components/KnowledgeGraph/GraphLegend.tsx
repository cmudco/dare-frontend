import { Switch } from '@/components/ui/switch'

interface GraphLegendProps {
  showLinks: boolean
  onShowLinks: (shown: boolean) => void
}

/** What the lines and marks on the picture mean, with the dotted-line switch. */
const GraphLegend = ({ showLinks, onShowLinks }: GraphLegendProps) => (
  <div className='absolute top-3 right-3 z-10 space-y-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground shadow-sm'>
    <p className='flex items-center gap-2'>
      <span className='w-6 border-t-2 border-muted-foreground' />
      Stated relationship, with the sentence that says it
    </p>
    <label className='flex items-center gap-2'>
      <span className='w-6 border-t-2 border-dotted border-muted-foreground' />
      <span className='flex-1'>
        Mentioned together: same passage, nothing stated
      </span>
      <Switch checked={showLinks} onCheckedChange={onShowLinks} />
    </label>
    <p className='flex items-center gap-2'>
      <span className='w-6 text-center text-[10px]'>+N</span>
      Beside a name: N related names are not on this page
    </p>
  </div>
)

export default GraphLegend
