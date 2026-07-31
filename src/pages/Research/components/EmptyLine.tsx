/** A dashed placeholder for a list that has nothing in it yet. */
const EmptyLine = ({ children }: { children: React.ReactNode }) => (
  <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground'>
    {children}
  </p>
)

export default EmptyLine
