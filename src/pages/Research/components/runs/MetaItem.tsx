interface MetaItemProps {
  label: string
  value: string
}

// One label/value pair in the run-detail metadata grid.
const MetaItem = ({ label, value }: MetaItemProps) => (
  <div>
    <p className='text-xs text-muted-foreground'>{label}</p>
    <p className='text-sm tabular-nums'>{value}</p>
  </div>
)

export default MetaItem
