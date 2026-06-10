import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { WalletListItem } from './WalletListItem'
import { Plus, KeyRound, Network } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

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
      'group flex w-full items-center gap-3 rounded-lg border border-dashed border-dare/30 bg-dare/5 px-3 py-2 text-left transition-colors hover:border-dare/60 hover:bg-dare/10',
      compact ? 'text-sm' : 'text-base'
    )}
  >
    <Icon className='h-4 w-4 shrink-0 text-dare' />
    <div className='min-w-0 flex-1'>
      <span className='block truncate font-medium text-foreground'>
        {label}
      </span>
      <span className='block truncate text-xs text-muted-foreground'>
        {hint}
      </span>
    </div>
    <Plus className='h-4 w-4 shrink-0 text-dare opacity-60 transition-opacity group-hover:opacity-100' />
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
  const byoEnabled = useFeatureFlag('enableByok')
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

      {/*
        Note: the onAddLiteLLM callback is gated by enableLitellmWallet at the
        parent surface (popover / Billing page). When the flag is off, the
        callback is undefined and this row is suppressed automatically — same
        pattern as BYO above.
      */}
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
