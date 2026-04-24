import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateGroupPolicy } from '@/redux/asyncThunks/billing'
import { GroupWallet } from '@/redux/types/billing'
import { toast } from '@/utils/toast'

interface PolicyFormValues {
  refillAmount: string
  refillPeriodDays: string
  isActive: boolean
}

const policyValidationSchema = Yup.object({
  refillAmount: Yup.string()
    .matches(
      /^$|^\d+(\.\d{1,2})?$/,
      'Amount must be a number with up to 2 decimals'
    )
    .test('non-negative', 'Amount must be >= 0', (v) => !v || Number(v) >= 0),
  refillPeriodDays: Yup.string()
    .matches(/^$|^\d+$/, 'Period must be a whole number of days')
    .test(
      'at-least-one',
      'Period must be at least 1 day',
      (v) => !v || Number(v) >= 1
    ),
})

interface GroupPolicyCardProps {
  groupWallet: GroupWallet
}

const GroupPolicyCard = ({ groupWallet }: GroupPolicyCardProps) => {
  const dispatch = useAppDispatch()
  const isSaving = useAppSelector((state) => state.billing.groupActionLoading)

  const formik = useFormik<PolicyFormValues>({
    initialValues: {
      refillAmount: groupWallet.refillAmount ?? '',
      refillPeriodDays:
        groupWallet.refillPeriodDays != null
          ? String(groupWallet.refillPeriodDays)
          : '',
      isActive: groupWallet.isActive,
    },
    enableReinitialize: true,
    validationSchema: policyValidationSchema,
    onSubmit: async (values) => {
      const clearAmount = values.refillAmount.trim() === ''
      const clearPeriod = values.refillPeriodDays.trim() === ''
      try {
        await dispatch(
          updateGroupPolicy({
            groupWalletId: groupWallet.id,
            payload: {
              refillAmount: clearAmount ? undefined : values.refillAmount,
              refillPeriodDays: clearPeriod
                ? undefined
                : Number(values.refillPeriodDays),
              clearAmount,
              clearPeriod,
              isActive: values.isActive,
            },
          })
        ).unwrap()
        toast.success('Group policy saved.')
      } catch {
        toast.error('Could not update group policy.')
      }
    },
  })

  const handleUseSystemDefault = () => {
    formik.setFieldValue('refillAmount', '')
    formik.setFieldValue('refillPeriodDays', '')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-medium'>Refill Policy</CardTitle>
        <CardDescription>
          Configure the per-member refill amount and cadence for this group.
          Leave either field blank to inherit the system default.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className='space-y-4 text-sm'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div>
              <Label
                htmlFor='refillAmount'
                className='text-xs font-medium uppercase'
              >
                Refill amount (USD)
              </Label>
              <Input
                id='refillAmount'
                inputMode='decimal'
                placeholder='e.g. 5.00 (leave blank to inherit)'
                className={`mt-1 h-10 ${
                  formik.touched.refillAmount && formik.errors.refillAmount
                    ? 'border-red-500'
                    : ''
                }`}
                {...formik.getFieldProps('refillAmount')}
              />
              {formik.touched.refillAmount && formik.errors.refillAmount && (
                <p className='mt-1 text-xs text-red-500'>
                  {formik.errors.refillAmount}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor='refillPeriodDays'
                className='text-xs font-medium uppercase'
              >
                Refill period (days)
              </Label>
              <Input
                id='refillPeriodDays'
                inputMode='numeric'
                placeholder='e.g. 7 (leave blank to inherit)'
                className={`mt-1 h-10 ${
                  formik.touched.refillPeriodDays &&
                  formik.errors.refillPeriodDays
                    ? 'border-red-500'
                    : ''
                }`}
                {...formik.getFieldProps('refillPeriodDays')}
              />
              {formik.touched.refillPeriodDays &&
                formik.errors.refillPeriodDays && (
                  <p className='mt-1 text-xs text-red-500'>
                    {formik.errors.refillPeriodDays}
                  </p>
                )}
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <Switch
              id='isActive'
              checked={formik.values.isActive}
              onCheckedChange={(v) => formik.setFieldValue('isActive', v)}
            />
            <Label htmlFor='isActive' className='cursor-pointer text-sm'>
              Group wallet active (scheduled refills enabled)
            </Label>
          </div>

          <div className='flex flex-wrap items-center justify-between gap-2 pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleUseSystemDefault}
              disabled={isSaving}
            >
              Use system default for both
            </Button>
            <Button
              type='submit'
              variant='default'
              disabled={isSaving || !formik.isValid}
            >
              {isSaving ? 'Saving…' : 'Save policy'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default GroupPolicyCard
