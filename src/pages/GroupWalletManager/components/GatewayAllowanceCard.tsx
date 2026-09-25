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
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { updateGroupPolicy } from '@/redux/asyncThunks/billing'
import { GatewayKey, GroupWallet } from '@/redux/types/billing'
import { formatUsd, toAmountInput } from '@/utils/wallets'
import { toast } from '@/utils/toast'

interface AllowanceFormValues {
  litellmMemberCap: string
}

const allowanceValidationSchema = Yup.object({
  litellmMemberCap: Yup.string().matches(
    /^$|^\d+(\.\d{1,2})?$/,
    'Limit must be a number with up to 2 decimals'
  ),
})

const GatewayKeyReport = ({ gatewayKey }: { gatewayKey: GatewayKey }) => (
  <div className='rounded-md border border-border p-3 text-sm'>
    <p className='font-medium'>{gatewayKey.label}</p>
    <dl className='mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2'>
      <div>
        <dt className='text-xs text-muted-foreground uppercase'>
          Gateway reports
        </dt>
        <dd className='font-medium'>
          {gatewayKey.gatewaySpend === null
            ? 'No calls reported yet'
            : `${formatUsd(gatewayKey.gatewaySpend)} spent`}
          {gatewayKey.gatewayMaxBudget !== null &&
            ` of ${formatUsd(gatewayKey.gatewayMaxBudget)} budget`}
        </dd>
      </div>
      <div>
        <dt className='text-xs text-muted-foreground uppercase'>
          DARE estimate (all members)
        </dt>
        <dd className='font-medium'>{formatUsd(gatewayKey.dareEstimate)}</dd>
      </div>
    </dl>
    {gatewayKey.gatewayReportedAt && (
      <p className='mt-2 text-xs text-muted-foreground'>
        Last reported {new Date(gatewayKey.gatewayReportedAt).toLocaleString()}
      </p>
    )}
  </div>
)

interface GatewayAllowanceCardProps {
  groupWallet: GroupWallet
}

const GatewayAllowanceCard = ({ groupWallet }: GatewayAllowanceCardProps) => {
  const dispatch = useAppDispatch()
  const isSaving = useAppSelector((state) => state.billing.groupActionLoading)

  const formik = useFormik<AllowanceFormValues>({
    initialValues: {
      litellmMemberCap: toAmountInput(groupWallet.litellmMemberCap),
    },
    enableReinitialize: true,
    validationSchema: allowanceValidationSchema,
    onSubmit: async ({ litellmMemberCap }) => {
      const clear = litellmMemberCap.trim() === ''
      try {
        await dispatch(
          updateGroupPolicy({
            groupWalletId: groupWallet.id,
            payload: clear
              ? { clearLitellmMemberCap: true }
              : { litellmMemberCap },
          })
        ).unwrap()
        toast.success(
          clear ? 'Member spend limit removed.' : 'Member spend limit saved.'
        )
      } catch {
        toast.error('Could not update the member spend limit.')
      }
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg font-medium'>
          AI gateway allowance
        </CardTitle>
        <CardDescription>
          Limit how much each member can spend through this group&apos;s LiteLLM
          gateway key. A member who reaches the limit cannot send until it is
          raised. Leave blank for no limit.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4 text-sm'>
        <form
          onSubmit={formik.handleSubmit}
          className='flex flex-col gap-2 sm:flex-row sm:items-end'
        >
          <div className='flex-1'>
            <Label
              htmlFor='litellmMemberCap'
              className='text-xs font-medium uppercase'
            >
              Limit per member (USD)
            </Label>
            <Input
              id='litellmMemberCap'
              inputMode='decimal'
              placeholder='e.g. 15.00 (leave blank for no limit)'
              className={`mt-1 h-10 ${
                formik.touched.litellmMemberCap &&
                formik.errors.litellmMemberCap
                  ? 'border-destructive'
                  : ''
              }`}
              {...formik.getFieldProps('litellmMemberCap')}
            />
            {formik.touched.litellmMemberCap &&
              formik.errors.litellmMemberCap && (
                <p className='mt-1 text-xs text-destructive'>
                  {formik.errors.litellmMemberCap}
                </p>
              )}
          </div>
          <Button type='submit' disabled={isSaving || !formik.isValid}>
            {isSaving ? 'Saving…' : 'Save limit'}
          </Button>
        </form>

        <div className='space-y-2'>
          <p className='text-xs text-muted-foreground'>
            Member usage is DARE&apos;s estimate at its own rates. The gateway
            figure comes from the gateway itself, so the two can be compared.
          </p>
          {groupWallet.gatewayKeys.length === 0 ? (
            <p className='text-muted-foreground'>
              This group has no gateway key yet. Ask a platform admin to issue
              one.
            </p>
          ) : (
            groupWallet.gatewayKeys.map((gatewayKey) => (
              <GatewayKeyReport key={gatewayKey.id} gatewayKey={gatewayKey} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default GatewayAllowanceCard
