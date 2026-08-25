import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/redux/store'
import {
  setActiveWallet,
  removeLiteLLMKey,
  renameLiteLLMKey,
} from '@/redux/asyncThunks/billing'
import { setActiveWalletOptimistic } from '@/redux/billingSlice'
import { UnifiedWallet } from '@/redux/types/billing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmation } from '@/components/DeleteConfirmation'
import { cn } from '@/lib/utils'
import {
  Wallet as WalletIcon,
  KeyRound,
  Network,
  CheckCircle2,
  MoreVertical,
  Pencil,
  Plug,
  SlidersHorizontal,
  Trash2,
  Clock,
} from 'lucide-react'
import { testLiteLLMSavedAPI } from '@/api/billing'
import { EditLiteLLMModelsModal } from './EditLiteLLMModelsModal'
import { toast } from '@/utils/toast'

interface WalletListItemProps {
  wallet: UnifiedWallet
  /** Compact rendering for the popover; the Billing page uses the larger variant. */
  compact?: boolean
}

const ICON_FOR_TYPE: Record<
  UnifiedWallet['type'],
  React.FC<{ className?: string }>
> = {
  DARE: WalletIcon,
  BYO: KeyRound,
  LITELLM: Network,
}

const providerDisplayName = (provider: string): string => {
  switch (provider) {
    case 'openai':
      return 'OpenAI'
    case 'claude':
      return 'Claude'
    case 'gemini':
      return 'Gemini'
    case 'llama':
      return 'LLaMA'
    default:
      return provider
  }
}

const isAdminIssued = (w: UnifiedWallet) =>
  w.type === 'LITELLM' && w.source !== 'USER'

/**
 * Single row in the wallet picker. Click to make active (optimistic dispatch
 * with server rollback). Trailing kebab menu only appears for user-owned
 * LiteLLM keys (where rename + remove apply); BYO and admin-issued LiteLLM
 * rows are display-only here — BYO removal is handled in the BYO dialog
 * (same flow as Settings).
 */
export const WalletListItem: React.FC<WalletListItemProps> = ({
  wallet,
  compact = false,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [renaming, setRenaming] = useState(false)
  const [draftLabel, setDraftLabel] = useState(wallet.label)
  const [showDelete, setShowDelete] = useState(false)
  const [testing, setTesting] = useState(false)
  const [editingModels, setEditingModels] = useState(false)

  const Icon = ICON_FOR_TYPE[wallet.type]
  const adminIssued = isAdminIssued(wallet)
  const canRenameOrDelete =
    wallet.type === 'LITELLM' && wallet.source === 'USER'

  const handleSelect = () => {
    if (wallet.isActive || renaming) return
    dispatch(
      setActiveWalletOptimistic({ type: wallet.type, refId: wallet.refId })
    )
    dispatch(setActiveWallet({ type: wallet.type, refId: wallet.refId }))
  }

  const handleRename = () => {
    if (!wallet.refId || !draftLabel.trim() || draftLabel === wallet.label) {
      setRenaming(false)
      return
    }
    dispatch(renameLiteLLMKey({ id: wallet.refId, label: draftLabel.trim() }))
    setRenaming(false)
  }

  const handleDelete = () => {
    if (wallet.refId) {
      dispatch(removeLiteLLMKey(wallet.refId))
    }
    setShowDelete(false)
  }

  return (
    <div
      role={wallet.isActive ? undefined : 'button'}
      onClick={handleSelect}
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card px-3 py-2 transition-colors',
        compact ? 'text-sm' : 'text-base',
        wallet.isActive
          ? 'cursor-default border-dare/40 bg-dare/5'
          : 'cursor-pointer border-border hover:border-dare/30 hover:bg-accent/40'
      )}
      data-wallet-type={wallet.type}
      data-wallet-active={wallet.isActive}
    >
      <Icon className='h-4 w-4 shrink-0 text-muted-foreground' />

      <div className='min-w-0 flex-1'>
        <div className='flex flex-wrap items-center gap-2'>
          {renaming ? (
            <Input
              autoFocus
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setRenaming(false)
                  setDraftLabel(wallet.label)
                }
              }}
              className='h-7 max-w-[200px]'
            />
          ) : (
            <span className='truncate font-medium text-foreground'>
              {wallet.label}
            </span>
          )}

          {wallet.type === 'BYO' && wallet.provider && (
            <span className='inline-flex flex-wrap items-center gap-1'>
              {(() => {
                const providers = wallet.provider
                  .split(',')
                  .map((p) => p.trim())
                  .filter(Boolean)
                return (
                  <>
                    <Badge
                      variant='secondary'
                      className='border-0 bg-dare/15 text-[10px] font-semibold tracking-wide text-dare uppercase'
                    >
                      {providers.length}{' '}
                      {providers.length === 1 ? 'key' : 'keys'} configured
                    </Badge>
                    {providers.map((p) => (
                      <Badge
                        key={p}
                        variant='outline'
                        className='border-dare/20 text-[10px]'
                      >
                        {providerDisplayName(p)}
                      </Badge>
                    ))}
                  </>
                )
              })()}
            </span>
          )}

          {wallet.type === 'LITELLM' &&
            wallet.source === 'ADMIN_GROUP' &&
            wallet.groupName && (
              <Badge variant='outline' className='text-[10px]'>
                Issued by {wallet.groupName}
              </Badge>
            )}
          {wallet.type === 'LITELLM' && wallet.source === 'ADMIN_USER' && (
            <Badge variant='outline' className='text-[10px]'>
              Admin-issued
            </Badge>
          )}
        </div>

        <div className='mt-0.5 flex items-center gap-2 text-xs text-muted-foreground'>
          {wallet.status.kind === 'BALANCE' ? (
            <span>
              Balance: ${parseFloat(wallet.status.balance).toFixed(2)}
            </span>
          ) : wallet.type === 'BYO' ? (
            <span>
              Routes each request to your matching provider key — DARE wallet
              not charged.
            </span>
          ) : wallet.source === 'ADMIN_GROUP' ? (
            <span>
              Billed to your group's gateway — your DARE wallet is not charged.
            </span>
          ) : (
            <span>External billing</span>
          )}
          {wallet.status.kind === 'EXTERNAL' && wallet.status.spend && (
            <span>Spent ${parseFloat(wallet.status.spend).toFixed(4)}</span>
          )}
          {wallet.expiresAt && (
            <span className='inline-flex items-center gap-1'>
              <Clock className='h-3 w-3' />
              Expires {new Date(wallet.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {wallet.isActive && (
        <span className='inline-flex items-center gap-1 rounded-full bg-dare px-2 py-0.5 text-xs font-medium text-dare-foreground'>
          <CheckCircle2 className='h-3 w-3' aria-label='active' />
          Active
        </span>
      )}

      {canRenameOrDelete && !adminIssued && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 shrink-0 opacity-60 group-hover:opacity-100'
              aria-label={`More actions for ${wallet.label}`}
            >
              <MoreVertical className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem
              disabled={testing || !wallet.refId}
              onClick={async () => {
                if (!wallet.refId) return
                setTesting(true)
                try {
                  const res = await testLiteLLMSavedAPI(wallet.refId)
                  if (res.ok) {
                    toast.success(
                      `Connection OK — ${res.models.length} ${
                        res.models.length === 1 ? 'model' : 'models'
                      } available.`
                    )
                  } else {
                    toast.error(
                      res.error || 'Connection failed — check the proxy.'
                    )
                  }
                } catch (err) {
                  toast.error(
                    err instanceof Error ? err.message : 'Test request failed.'
                  )
                } finally {
                  setTesting(false)
                }
              }}
            >
              <Plug className='mr-2 h-3.5 w-3.5' />
              Test connection
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setRenaming(true)
                setDraftLabel(wallet.label)
              }}
            >
              <Pencil className='mr-2 h-3.5 w-3.5' />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditingModels(true)}>
              <SlidersHorizontal className='mr-2 h-3.5 w-3.5' />
              Models
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setShowDelete(true)}
              className='text-destructive focus:text-destructive'
            >
              <Trash2 className='mr-2 h-3.5 w-3.5' />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <EditLiteLLMModelsModal
        isOpen={editingModels}
        onClose={() => setEditingModels(false)}
        wallet={wallet}
      />

      <DeleteConfirmation
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onDelete={handleDelete}
        title='Remove LiteLLM key'
        itemName={wallet.label}
      />
    </div>
  )
}
