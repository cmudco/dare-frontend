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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { OwnedGroupMember } from '@/redux/types/billing'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { upsertUserOverride } from '@/redux/asyncThunks/billing'
import { toast } from '@/utils/toast'

interface OverrideFormValues {
  amountEnabled: boolean
  amount: string
  periodEnabled: boolean
  periodDays: string
  reason: string
}

interface UserOverrideModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: OwnedGroupMember | null
  groupWalletId: number
}

const UserOverrideModal = ({
  open,
  onOpenChange,
  member,
  groupWalletId,
}: UserOverrideModalProps) => {
  const dispatch = useAppDispatch()
  const isSaving = useAppSelector((state) => state.billing.groupActionLoading)

  const override = member?.override ?? null

  const formik = useFormik<OverrideFormValues>({
    initialValues: {
      amountEnabled: override?.refillAmount != null,
      amount: override?.refillAmount ?? '',
      periodEnabled: override?.refillPeriodDays != null,
      periodDays:
        override?.refillPeriodDays != null
          ? String(override.refillPeriodDays)
          : '',
      reason: override?.reason ?? '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      amount: Yup.string().when('amountEnabled', {
        is: true,
        then: (schema) =>
          schema
            .required('Enter amount or disable amount override')
            .matches(
              /^\d+(\.\d{1,2})?$/,
              'Enter a non-negative number with up to 2 decimals'
            )
            .test(
              'non-negative',
              'Amount must be >= 0',
              (v) => v !== undefined && Number(v) >= 0
            ),
      }),
      periodDays: Yup.string().when('periodEnabled', {
        is: true,
        then: (schema) =>
          schema
            .required('Enter period or disable period override')
            .matches(/^\d+$/, 'Period must be a whole number of days')
            .test(
              'at-least-one',
              'Period must be at least 1 day',
              (v) => v !== undefined && Number(v) >= 1
            ),
      }),
      reason: Yup.string().max(255, 'Reason is too long'),
    }),
    onSubmit: async (values, helpers) => {
      if (!member) return
      try {
        await dispatch(
          upsertUserOverride({
            groupWalletId,
            userId: member.id,
            payload: {
              refillAmount: values.amountEnabled ? values.amount : undefined,
              refillPeriodDays: values.periodEnabled
                ? Number(values.periodDays)
                : undefined,
              clearAmount: !values.amountEnabled,
              clearPeriod: !values.periodEnabled,
              reason: values.reason || undefined,
            },
          })
        ).unwrap()
        toast.success('Override saved.')
        helpers.resetForm()
        onOpenChange(false)
      } catch {
        toast.error('Could not update override.')
      }
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Member override</DialogTitle>
          <DialogDescription>
            Override refill amount, period, or both for{' '}
            <span className='font-medium'>
              {member?.email ?? 'this member'}
            </span>
            . Disabled fields inherit from the group policy.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className='space-y-4 text-sm'>
          <div className='rounded-md border p-3'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='amountEnabled'
                className='text-xs font-medium uppercase'
              >
                Custom refill amount
              </Label>
              <Switch
                id='amountEnabled'
                checked={formik.values.amountEnabled}
                onCheckedChange={(v) =>
                  formik.setFieldValue('amountEnabled', v)
                }
              />
            </div>
            <Input
              id='amount'
              inputMode='decimal'
              placeholder='e.g. 20.00'
              className={`mt-2 h-10 ${
                formik.touched.amount && formik.errors.amount
                  ? 'border-red-500'
                  : ''
              }`}
              disabled={!formik.values.amountEnabled}
              {...formik.getFieldProps('amount')}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.amount}
              </p>
            )}
          </div>

          <div className='rounded-md border p-3'>
            <div className='flex items-center justify-between'>
              <Label
                htmlFor='periodEnabled'
                className='text-xs font-medium uppercase'
              >
                Custom refill period (days)
              </Label>
              <Switch
                id='periodEnabled'
                checked={formik.values.periodEnabled}
                onCheckedChange={(v) =>
                  formik.setFieldValue('periodEnabled', v)
                }
              />
            </div>
            <Input
              id='periodDays'
              inputMode='numeric'
              placeholder='e.g. 7'
              className={`mt-2 h-10 ${
                formik.touched.periodDays && formik.errors.periodDays
                  ? 'border-red-500'
                  : ''
              }`}
              disabled={!formik.values.periodEnabled}
              {...formik.getFieldProps('periodDays')}
            />
            {formik.touched.periodDays && formik.errors.periodDays && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.periodDays}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor='reason' className='text-xs font-medium uppercase'>
              Reason (optional)
            </Label>
            <Textarea
              id='reason'
              rows={2}
              className='mt-1'
              placeholder='Audit note'
              {...formik.getFieldProps('reason')}
            />
            {formik.touched.reason && formik.errors.reason && (
              <p className='mt-1 text-xs text-red-500'>
                {formik.errors.reason}
              </p>
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
              {isSaving ? 'Saving…' : 'Save override'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default UserOverrideModal
