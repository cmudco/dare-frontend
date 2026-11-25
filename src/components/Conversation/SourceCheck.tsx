import { AnimatePresence, motion } from 'framer-motion'
import { Check } from 'lucide-react'

const POP = { type: 'spring', stiffness: 700, damping: 18, mass: 0.6 } as const

/** Picker checkbox: the box squashes on change and the tick springs in. */
const SourceCheck = ({ checked }: { checked: boolean }) => (
  <motion.div
    animate={{ scale: checked ? [0.82, 1.08, 1] : 1 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
    className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors duration-150 ${
      checked
        ? 'border-primary bg-primary'
        : 'border-input hover:border-muted-foreground'
    }`}
  >
    <AnimatePresence initial={false}>
      {checked && (
        <motion.span
          key='tick'
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, transition: { duration: 0.1 } }}
          transition={POP}
        >
          <Check className='h-3 w-3 text-primary-foreground' strokeWidth={3} />
        </motion.span>
      )}
    </AnimatePresence>
  </motion.div>
)

export default SourceCheck
