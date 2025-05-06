export interface BillingState {
  wallet: Wallet | null
  transactions: Transaction[]
  transactionCount: number
  nextPage: string | null
  previousPage: string | null
  loading: boolean
  error: string | null
}

export interface Wallet {
  displayBalance: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: number
  displayAmount: string
  type: string
  message: string
  createdAt: string
  updatedAt: string
}
