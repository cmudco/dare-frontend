import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { OwnedGroupMember } from '@/redux/types/billing'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { allocateToMember } from '@/redux/asyncThunks/billing'
import { toast } from '@/utils/toast'

interface AllocateFormValues {
  amount: string
  note: string
}

interface AllocateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: OwnedGroupMember | null
  groupWalletId: number
  budgetBalance: string
}

const AllocateModal = ({
  open,
  onOpenChange,
  member,
  groupWalletId,
  budgetBalance,
}: AllocateModalProps) => {
  const dispatch = useAppDispatch()
  const isSaving = useAppSelector((state) => state.billing.groupActionLoading)
  const maxAllocation = Number(budgetBalance) || 0

  const formik = useFormik<AllocateFormValues>({
    initialValues: { amount: '', note: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.string()
        .required('Amount is required')
        .matches(
          /^\d+(\.\d{1,2})?$/,
          'Enter a positive number with up to 2 decimals'
        )
        .test(
          'positive',
          'Amount must be greater than 0',
          (v) => v !== undefined && Number(v) > 0
        )
        .test(
          'lte-budget',
          `Amount exceeds remaining budget ($${maxAllocation.toFixed(2)})`,
          (v) => v === undefined || Number(v) <= maxAllocation
        ),
      note: Yup.string().max(255, 'Note is too long'),
    }),
    onSubmit: async (values, helpers) => {
      if (!member) return
      try {
        await dispatch(
          allocateToMember({
            groupWalletId,
            payload: {
              recipientUserId: member.id,
              amount: values.amount,
              note: values.note || undefined,
            },
          })
        ).unwrap()
        toast.success(`Allocated $${values.amount} to ${member.email}.`)
        helpers.resetForm()
        onOpenChange(false)
      } catch {
        toast.error('Allocation failed.')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Allocate credit</DialogTitle>
          <DialogDescription>
            One-off allocation from the group budget to{' '}
            <span className='font-medium'>
              {member?.email ?? 'the selected member'}
            </span>
            . Budget available: ${maxAllocation.toFixed(2)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className='space-y-4 text-sm'>
          <div>
            <Label htmlFor='amount' className='text-xs font-medium uppercase'>
              Amount (USD)
            </Label>
            <Input
              id='amount'
              inputMode='decimal'
              placeholder='e.g. 10.00'
              className={`mt-1 h-10 ${
                formik.touched.amount && formik.errors.amount
                  ? 'border-red-500'
                  : ''
              }`}
              {...formik.getFieldProps('amount')}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.amount}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='note' className='text-xs font-medium uppercase'>
              Note (optional)
            </Label>
            <Textarea
              id='note'
              placeholder='Reason for this allocation'
              rows={3}
              className='mt-1'
              {...formik.getFieldProps('note')}
            />
            {formik.touched.note && formik.errors.note && (
              <p className='mt-1 text-xs text-red-500'>{formik.errors.note}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSaving || !formik.isValid}>
              {isSaving ? 'Allocating…' : 'Allocate'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AllocateModal
