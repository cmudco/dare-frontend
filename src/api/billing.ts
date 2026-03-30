import {
  Transaction,
  Wallet,
  BillingModelStatsResponse,
  EnergyStatsResponse,
} from '@/redux/types/billing'
import { METHOD } from '@/utils/constants/requests'
import { baseRequest } from '@/utils/requests'

export const getWalletAPI = async (): Promise<Wallet> => {
  return await baseRequest<Wallet>({
    url: 'api/billing/wallet/',
    method: METHOD.GET,
  })
}

export const getTransactionsAPI = async (
  page: number = 1
): Promise<{
  count: number
  next: string | null
  previous: string | null
  results: Transaction[]
}> => {
  return await baseRequest<{
    count: number
    next: string | null
    previous: string | null
    results: Transaction[]
  }>({
    url: `api/billing/transactions/?page=${page}`,
    method: METHOD.GET,
  })
}

export const getBillingModelStatsAPI =
  async (): Promise<BillingModelStatsResponse> => {
    return await baseRequest<BillingModelStatsResponse>({
      url: 'api/billing/model_stats/',
      method: METHOD.GET,
    })
  }

export const getEnergyStatsAPI = async (
  period: string = 'all'
): Promise<EnergyStatsResponse> => {
  return await baseRequest<EnergyStatsResponse>({
    url: `api/billing/energy-stats/?period=${period}`,
    method: METHOD.GET,
  })
}
