import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wallet as WalletIcon, Key, Network } from 'lucide-react'
import { Transaction, TransactionSummary } from '@/redux/types/billing'
import { TransactionTable } from './TransactionTable'
import { TransactionTab } from '@/utils/constants/billing'

interface TransactionTabsProps {
  transactions: Transaction[]
  summary: TransactionSummary
  loading: boolean
  activeTab: TransactionTab
  onTabChange: (tab: TransactionTab) => void
  showPlatformColumn: boolean
}

export const TransactionTabs = ({
  transactions,
  summary,
  loading,
  activeTab,
  onTabChange,
  showPlatformColumn,
}: TransactionTabsProps) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => onTabChange(value as TransactionTab)}
      className='w-full'
    >
      <TabsList className='mb-4 grid w-full grid-cols-4'>
        <TabsTrigger value={TransactionTab.ALL} className='gap-2'>
          All
          <span className='text-xs text-muted-foreground'>({summary.all})</span>
        </TabsTrigger>
        <TabsTrigger value={TransactionTab.WALLET} className='gap-2'>
          <WalletIcon size={14} />
          Wallet
          <span className='text-xs text-muted-foreground'>
            ({summary.wallet})
          </span>
        </TabsTrigger>
        <TabsTrigger value={TransactionTab.OWN_API} className='gap-2'>
          <Key size={14} />
          Personal API Keys
          <span className='text-xs text-muted-foreground'>
            ({summary.ownApi})
          </span>
        </TabsTrigger>
        <TabsTrigger value={TransactionTab.LITELLM} className='gap-2'>
          <Network size={14} />
          LiteLLM
          <span className='text-xs text-muted-foreground'>
            ({summary.litellm})
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value={activeTab} className='m-0'>
        <TransactionTable
          transactions={transactions}
          loading={loading}
          showAmount={
            activeTab !== TransactionTab.OWN_API &&
            activeTab !== TransactionTab.LITELLM
          }
          showBillingMode={activeTab === TransactionTab.ALL}
          showPlatform={showPlatformColumn}
        />
      </TabsContent>
    </Tabs>
  )
}
