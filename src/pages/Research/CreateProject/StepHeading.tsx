interface Props {
  title: string
  subtitle: string
}

const StepHeading = ({ title, subtitle }: Props) => (
  <div>
    <h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
    <p className='mt-1.5 max-w-xl text-sm text-muted-foreground'>{subtitle}</p>
  </div>
)

export default StepHeading
