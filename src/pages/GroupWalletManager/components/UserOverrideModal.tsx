import { FormikProps, useFormik } from 'formik'
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
import { toAmountInput } from '@/utils/wallets'

interface OverrideFormValues {
  amountEnabled: boolean
  amount: string
  periodEnabled: boolean
  periodDays: string
  refillCapEnabled: boolean
  refillCap: string
  litellmCapEnabled: boolean
  litellmCap: string
  reason: string
}

type ToggleField =
  | 'amountEnabled'
  | 'periodEnabled'
  | 'refillCapEnabled'
  | 'litellmCapEnabled'
type ValueField = 'amount' | 'periodDays' | 'refillCap' | 'litellmCap'

const requiredAmount = (label: string) =>
  Yup.string().when(`${label}Enabled`, {
    is: true,
    then: (schema) =>
      schema
        .required('Enter an amount or turn this override off')
        .matches(
          /^\d+(\.\d{1,2})?$/,
          'Enter a non-negative number with up to 2 decimals'
        ),
  })

const overrideValidationSchema = Yup.object({
  amount: requiredAmount('amount'),
  periodDays: Yup.string().when('periodEnabled', {
    is: true,
    then: (schema) =>
      schema
        .required('Enter a period or turn this override off')
        .matches(/^\d+$/, 'Period must be a whole number of days')
        .test(
          'at-least-one',
          'Period must be at least 1 day',
          (v) => v !== undefined && Number(v) >= 1
        ),
  }),
  refillCap: requiredAmount('refillCap'),
  litellmCap: requiredAmount('litellmCap'),
  reason: Yup.string().max(255, 'Reason is too long'),
})

interface OverrideFieldProps {
  formik: FormikProps<OverrideFormValues>
  toggle: ToggleField
  field: ValueField
  label: string
  placeholder: string
  inputMode: 'decimal' | 'numeric'
}

const OverrideField = ({
  formik,
  toggle,
  field,
  label,
  placeholder,
  inputMode,
}: OverrideFieldProps) => {
  const error = formik.touched[field] && formik.errors[field]
  return (
    <div className='rounded-md border p-3'>
      <div className='flex items-center justify-between'>
        <Label htmlFor={toggle} className='text-xs font-medium uppercase'>
          {label}
        </Label>
        <Switch
          id={toggle}
          checked={formik.values[toggle]}
          onCheckedChange={(v) => formik.setFieldValue(toggle, v)}
        />
      </div>
      <Input
        id={field}
        aria-label={label}
        inputMode={inputMode}
        placeholder={placeholder}
        className={`mt-2 h-10 ${error ? 'border-destructive' : ''}`}
        disabled={!formik.values[toggle]}
        {...formik.getFieldProps(field)}
      />
      {error && <p className='mt-1 text-xs text-destructive'>{error}</p>}
    </div>
  )
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
      amount: toAmountInput(override?.refillAmount ?? null),
      periodEnabled: override?.refillPeriodDays != null,
      periodDays:
        override?.refillPeriodDays != null
          ? String(override.refillPeriodDays)
          : '',
      refillCapEnabled: override?.refillCap != null,
      refillCap: toAmountInput(override?.refillCap ?? null),
      litellmCapEnabled: override?.litellmCap != null,
      litellmCap: toAmountInput(override?.litellmCap ?? null),
      reason: override?.reason ?? '',
    },
    enableReinitialize: true,
    validationSchema: overrideValidationSchema,
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
              refillCap: values.refillCapEnabled ? values.refillCap : undefined,
              litellmCap: values.litellmCapEnabled
                ? values.litellmCap
                : undefined,
              clearAmount: !values.amountEnabled,
              clearPeriod: !values.periodEnabled,
              clearRefillCap: !values.refillCapEnabled,
              clearLitellmCap: !values.litellmCapEnabled,
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
      <DialogContent className='max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Member override</DialogTitle>
          <DialogDescription>
            Override the refill policy or gateway allowance for{' '}
            <span className='font-medium'>
              {member?.email ?? 'this member'}
            </span>
            . Fields that are off inherit from the group.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className='space-y-4 text-sm'>
          <OverrideField
            formik={formik}
            toggle='amountEnabled'
            field='amount'
            label='Custom refill amount'
            placeholder='e.g. 20.00'
            inputMode='decimal'
          />
          <OverrideField
            formik={formik}
            toggle='periodEnabled'
            field='periodDays'
            label='Custom refill period (days)'
            placeholder='e.g. 7'
            inputMode='numeric'
          />
          <OverrideField
            formik={formik}
            toggle='refillCapEnabled'
            field='refillCap'
            label='Custom refill cap (USD)'
            placeholder='e.g. 25.00'
            inputMode='decimal'
          />
          <OverrideField
            formik={formik}
            toggle='litellmCapEnabled'
            field='litellmCap'
            label='Custom gateway allowance (USD)'
            placeholder='e.g. 30.00'
            inputMode='decimal'
          />

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
              <p className='mt-1 text-xs text-destructive'>
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
