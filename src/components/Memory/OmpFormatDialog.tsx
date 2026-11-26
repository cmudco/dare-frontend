/**
 * OmpFormatDialog
 *
 * Explains the Open Memory Protocol with the person's own memories: a field
 * map from DARE's shape to the shared record, how a memory travels, and a
 * field reference beside the raw record.
 */
import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { getOmpRecord } from '@/redux/asyncThunks/memory'
import type { OmpRecord } from '@/redux/types/memory'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import OmpFieldMap from './OmpFieldMap'
import OmpJourney from './OmpJourney'
import OmpReference from './OmpReference'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The memory to show first; the first memory when absent */
  memoryId?: string | null
}

const OmpFormatDialog = ({ open, onOpenChange, memoryId }: Props) => {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.memory.items)
  const memories = useMemo(
    () => items.filter((item) => !item.id.startsWith('doc:')),
    [items]
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [record, setRecord] = useState<OmpRecord | null>(null)
  const [failed, setFailed] = useState(false)
  const selected = picked ?? memoryId ?? memories[0]?.id ?? null

  useEffect(() => {
    if (!open || !selected) return
    let stale = false
    setRecord(null)
    setFailed(false)
    dispatch(getOmpRecord(selected))
      .unwrap()
      .then((value) => !stale && setRecord(value))
      .catch(() => !stale && setFailed(true))
    return () => {
      stale = true
    }
  }, [dispatch, open, selected])

  const body = !selected ? (
    <p className='py-10 text-center text-sm text-muted-foreground'>
      Nothing to show yet. Once DARE remembers something, it appears here.
    </p>
  ) : failed ? (
    <p className='py-10 text-center text-sm text-muted-foreground'>
      This memory is left out of exports, so it has no record to show.
    </p>
  ) : !record ? (
    <Loader2 className='mx-auto my-10 h-5 w-5 animate-spin text-muted-foreground' />
  ) : null

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setPicked(null)
        onOpenChange(next)
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-5xl'>
        <DialogHeader>
          <p className='font-mono text-[11px] tracking-widest text-primary uppercase'>
            Open Memory Protocol · draft 0.5 · experimental
          </p>
          <DialogTitle className='text-2xl'>One memory, two shapes</DialogTitle>
          <DialogDescription>
            DARE keeps memory its own way and shares it in one open shape that
            other systems can read. Four fields are required; the rest travel
            when DARE has them.
            {record && (
              <>
                {' '}
                This store is{' '}
                <span className='font-mono text-xs'>
                  {String(record.manifest.origin)}
                </span>
                .
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue='map'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <TabsList>
              <TabsTrigger value='map'>Field map</TabsTrigger>
              <TabsTrigger value='journey'>How it travels</TabsTrigger>
              <TabsTrigger value='raw'>Reference</TabsTrigger>
            </TabsList>
            {memories.length > 0 && selected && (
              <Select value={selected} onValueChange={setPicked}>
                <SelectTrigger className='w-72 max-w-full'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {memories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <span className='block max-w-64 truncate'>
                        {item.content}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <TabsContent value='map' className='mt-4 min-h-[26rem]'>
            {body ?? <OmpFieldMap key={selected} record={record!} />}
          </TabsContent>
          <TabsContent value='journey' className='mt-4 min-h-[26rem]'>
            <OmpJourney />
          </TabsContent>
          <TabsContent value='raw' className='mt-4 min-h-[26rem]'>
            {body ?? <OmpReference key={selected} record={record!} />}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default OmpFormatDialog
