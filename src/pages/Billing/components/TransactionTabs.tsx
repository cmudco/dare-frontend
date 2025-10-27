import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet as WalletIcon, Key } from 'lucide-react'
import { Transaction } from '@/redux/types/billing'
import { TransactionTable } from './TransactionTable'
import { BillingMode, TransactionTab } from '@/utils/constants/billing'

interface TransactionTabsProps {
  transactions: Transaction[]
  loading: boolean
  activeTab: TransactionTab
  onTabChange: (tab: TransactionTab) => void
}

export const TransactionTabs = ({
  transactions,
  loading,
  activeTab,
  onTabChange,
}: TransactionTabsProps) => {
  // Filter transactions by billing mode
  const walletTransactions = transactions.filter(
    (t) => t.billingMode === BillingMode.WALLET
  )
  const ownApiTransactions = transactions.filter(
    (t) => t.billingMode === BillingMode.OWN_API
  )

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TransactionTab)}
      className='w-full'
    >
      <TabsList className='mb-4 grid w-full grid-cols-3'>
        <TabsTrigger value={TransactionTab.ALL} className='gap-2'>
          All
          <span className='text-xs text-muted-foreground'>
            ({transactions.length})
          </span>
        </TabsTrigger>
        <TabsTrigger value={TransactionTab.WALLET} className='gap-2'>
          <WalletIcon size={14} />
          Wallet
          <span className='text-xs text-muted-foreground'>
            ({walletTransactions.length})
          </span>
        </TabsTrigger>
        <TabsTrigger value={TransactionTab.OWN_API} className='gap-2'>
          <Key size={14} />
          Personal API Keys
          <span className='text-xs text-muted-foreground'>
            ({ownApiTransactions.length})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={TransactionTab.ALL} className='m-0'>
        <TransactionTable
          transactions={transactions}
          loading={loading}
          showAmount={true}
          showBillingMode={true}
        />
      </TabsContent>

      <TabsContent value={TransactionTab.WALLET} className='m-0'>
        <TransactionTable
          transactions={walletTransactions}
          loading={loading}
          showAmount={true}
          showBillingMode={false}
        />
      </TabsContent>

      <TabsContent value={TransactionTab.OWN_API} className='m-0'>
        <TransactionTable
          transactions={ownApiTransactions}
          loading={loading}
          showAmount={false}
          showBillingMode={false}
        />
      </TabsContent>
    </Tabs>
  )
}
