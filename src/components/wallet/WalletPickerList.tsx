import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { WalletListItem } from './WalletListItem'
import { Plus, KeyRound, Network } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WalletPickerListProps {
  /** Compact rendering for the popover; the Billing page uses the larger variant. */
  compact?: boolean
  /**
   * Callbacks for the inline placeholder rows shown when the user hasn't set
   * up a wallet of that type yet. Provided by the parent surface (popover or
   * Billing page) so the row click opens the same modal that surface manages.
   */
  onAddLiteLLM?: () => void
  onAddBYO?: () => void
}

interface AddRowProps {
  label: string
  hint: string
  Icon: React.FC<{ className?: string }>
  onClick: () => void
  compact: boolean
}

const AddRow: React.FC<AddRowProps> = ({
  label,
  hint,
  Icon,
  onClick,
  compact,
}) => (
  <button
    type='button'
    onClick={onClick}
    className={cn(
      'group flex w-full items-center gap-3 rounded-lg border border-dashed border-[#023572]/30 bg-gradient-to-r from-[#EE183C]/[0.03] to-[#023572]/[0.03] px-3 py-2 text-left transition-colors hover:border-[#023572]/60 hover:from-[#EE183C]/[0.06] hover:to-[#023572]/[0.06] dark:border-[#EE183C]/30 dark:from-[#EE183C]/10 dark:to-[#023572]/10',
      compact ? 'text-sm' : 'text-base'
    )}
  >
    <Icon className='h-4 w-4 shrink-0 text-[#023572] dark:text-[#EE183C]' />
    <div className='min-w-0 flex-1'>
      <span className='block truncate font-medium text-foreground'>
        {label}
      </span>
      <span className='block truncate text-xs text-muted-foreground'>
        {hint}
      </span>
    </div>
    <Plus className='h-4 w-4 shrink-0 text-[#023572] opacity-60 transition-opacity group-hover:opacity-100 dark:text-[#EE183C]' />
  </button>
)

/**
 * Shared scrollable list of every wallet the user can route through. Used by
 * both the header `<WalletPopover />` and the Billing page's `<WalletSection />`
 * so behaviour stays consistent across surfaces. When BYO or LiteLLM hasn't
 * been set up yet, an inline "Add …" placeholder row replaces the absent
 * wallet so the user can both see what's missing and add it inline.
 */
export const WalletPickerList: React.FC<WalletPickerListProps> = ({
  compact = false,
  onAddLiteLLM,
  onAddBYO,
}) => {
  const wallets = useSelector((s: RootState) => s.billing.wallets)
  const byoEnabled = useSelector((s: RootState) => s.billing.byoEnabled)
  const loading = useSelector((s: RootState) => s.billing.walletsLoading)

  const hasLitellm = wallets.some((w) => w.type === 'LITELLM')
  const hasByo = wallets.some((w) => w.type === 'BYO')

  if (loading && wallets.length === 0) {
    return (
      <div className='py-6 text-center text-sm text-muted-foreground'>
        Loading wallets…
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      {wallets.map((w) => (
        <WalletListItem
          key={`${w.type}:${w.refId ?? 'none'}`}
          wallet={w}
          compact={compact}
        />
      ))}

      {!hasLitellm && onAddLiteLLM && (
        <AddRow
          label='Add LiteLLM Key'
          hint='Route through your LiteLLM proxy'
          Icon={Network}
          onClick={onAddLiteLLM}
          compact={compact}
        />
      )}

      {byoEnabled && !hasByo && onAddBYO && (
        <AddRow
          label='Add BYO Key'
          hint='Bring your own provider API key'
          Icon={KeyRound}
          onClick={onAddBYO}
          compact={compact}
        />
      )}
    </div>
  )
}
