'use client'

import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  NativeNestedList,
  type ListItem,
} from '@/components/uitripled/native-nested-list-shadcnui'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  Search,
  X,
  CheckSquare,
  Square,
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GroupItem {
  /** Unique identifier */
  id: string
  /** Display name */
  label: string
  /** Optional icon */
  icon?: React.ReactNode
  /** Optional description shown below the label */
  description?: string
  /** Optional badge text (e.g. count, status) */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>
  /** Click handler */
  onClick?: (e: React.MouseEvent) => void
}

export interface Group {
  /** Unique group identifier */
  id: string
  /** Group display name */
  label: string
  /** Optional group icon */
  icon?: React.ReactNode
  /** Items belonging to this group */
  items: GroupItem[]
  /** Optional badge (e.g. item count) */
  badge?: string
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

export interface GroupedListProps {
  /** Array of groups to display */
  groups: Group[]
  /** Currently active item id */
  activeId?: string
  /** Callback when an item is clicked */
  onItemClick?: (item: GroupItem) => void
  /** Callback when an item is selected (checkbox mode) */
  onItemSelect?: (itemId: string, selected: boolean) => void
  /** Currently selected item ids (enables checkbox mode) */
  selectedIds?: string[]
  /** Callback for bulk selection changes */
  onSelectionChange?: (selectedIds: string[]) => void
  /** Enable search/filter */
  searchable?: boolean
  /** Placeholder text for search input */
  searchPlaceholder?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Whether to show expand/collapse icons */
  showExpandIcon?: boolean
  /** Whether groups start expanded */
  defaultExpanded?: boolean
  /** Max height for scroll area (e.g. "400px", "50vh") */
  maxHeight?: string
  /** Whether to show item counts on group headers */
  showGroupCounts?: boolean
  /** Custom empty state message */
  emptyMessage?: string
  /** Custom empty search message */
  emptySearchMessage?: string
  /** Whether to show a "collapse all / expand all" toggle */
  showCollapseToggle?: boolean
  /** Header action slot (rendered top-right) */
  headerAction?: React.ReactNode
  /** Additional className */
  className?: string
  /** Indent size in px for nesting */
  indentSize?: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function filterGroups(groups: Group[], query: string): Group[] {
  const q = query.toLowerCase().trim()
  if (!q) return groups

  return groups
    .map((group) => {
      const matchingItems = group.items.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
      // Keep group if its own label matches or it has matching items
      if (group.label.toLowerCase().includes(q) || matchingItems.length > 0) {
        return {
          ...group,
          items: matchingItems.length > 0 ? matchingItems : group.items,
        }
      }
      return null
    })
    .filter(Boolean) as Group[]
}

function groupsToListItems(
  groups: Group[],
  showGroupCounts: boolean,
  selectedIds?: string[]
): ListItem[] {
  return groups.map((group) => ({
    id: `group-${group.id}`,
    label: showGroupCounts
      ? `${group.label} (${group.items.length})`
      : group.label,
    icon: group.icon,
    metadata: {
      isGroup: true,
      groupId: group.id,
      badge: group.badge,
      badgeVariant: group.badgeVariant,
    },
    children: group.items.map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      metadata: {
        description: item.description,
        badge: item.badge,
        badgeVariant: item.badgeVariant,
        selected: selectedIds?.includes(item.id),
        ...item.metadata,
      },
    })),
  }))
}

// ── Component ──────────────────────────────────────────────────────────────────

export function GroupedList({
  groups,
  activeId,
  onItemClick,
  onItemSelect,
  selectedIds,
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  size = 'md',
  showExpandIcon = true,
  defaultExpanded = true,
  maxHeight,
  showGroupCounts = true,
  emptyMessage = 'No items',
  emptySearchMessage = 'No results found',
  showCollapseToggle = false,
  headerAction,
  className,
  indentSize = 16,
}: GroupedListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allExpanded, setAllExpanded] = useState(defaultExpanded)

  const isSelectable = !!selectedIds && !!onSelectionChange

  const filteredGroups = useMemo(
    () => filterGroups(groups, searchQuery),
    [groups, searchQuery]
  )

  const listItems = useMemo(
    () => groupsToListItems(filteredGroups, showGroupCounts, selectedIds),
    [filteredGroups, showGroupCounts, selectedIds]
  )

  const allItemIds = useMemo(
    () => groups.flatMap((g) => g.items.map((i) => i.id)),
    [groups]
  )

  const allSelected =
    isSelectable &&
    allItemIds.length > 0 &&
    allItemIds.every((id) => selectedIds!.includes(id))

  const handleItemClick = useCallback(
    (listItem: ListItem) => {
      // Ignore clicks on group headers
      if (listItem.metadata?.isGroup) return

      // Find the original GroupItem
      const originalItem = groups
        .flatMap((g) => g.items)
        .find((i) => i.id === listItem.id)

      if (!originalItem) return

      if (isSelectable) {
        const isSelected = selectedIds!.includes(originalItem.id)
        onItemSelect?.(originalItem.id, !isSelected)
        onSelectionChange?.(
          isSelected
            ? selectedIds!.filter((id) => id !== originalItem.id)
            : [...selectedIds!, originalItem.id]
        )
      }

      onItemClick?.(originalItem)
    },
    [
      groups,
      onItemClick,
      isSelectable,
      selectedIds,
      onItemSelect,
      onSelectionChange,
    ]
  )

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return
    onSelectionChange(allSelected ? [] : allItemIds)
  }, [allSelected, allItemIds, onSelectionChange])

  const handleToggleAll = useCallback(() => {
    setAllExpanded((prev) => !prev)
  }, [])

  const isEmpty = filteredGroups.length === 0
  const isSearchEmpty = searchQuery && isEmpty

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Header bar */}
      {(searchable || showCollapseToggle || headerAction || isSelectable) && (
        <div className='flex items-center gap-2'>
          {searchable && (
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  'pl-8',
                  size === 'sm' && 'h-8 text-xs',
                  size === 'lg' && 'h-12 text-base'
                )}
              />
              {searchQuery && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0'
                  onClick={() => setSearchQuery('')}
                >
                  <X className='h-3 w-3' />
                </Button>
              )}
            </div>
          )}

          {isSelectable && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleSelectAll}
              className='flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground'
            >
              {allSelected ? (
                <CheckSquare className='h-4 w-4' />
              ) : (
                <Square className='h-4 w-4' />
              )}
              {allSelected ? 'Deselect all' : 'Select all'}
            </Button>
          )}

          {showCollapseToggle && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleToggleAll}
              className='flex shrink-0 items-center gap-1 text-xs text-muted-foreground'
            >
              {allExpanded ? (
                <>
                  <ChevronUp className='h-3.5 w-3.5' />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className='h-3.5 w-3.5' />
                  Expand
                </>
              )}
            </Button>
          )}

          {headerAction}
        </div>
      )}

      {/* Selection count badge */}
      {isSelectable && selectedIds!.length > 0 && (
        <div className='flex items-center gap-2 px-1'>
          <Badge variant='secondary' className='text-xs'>
            {selectedIds!.length} selected
          </Badge>
          <Button
            variant='ghost'
            size='sm'
            className='h-5 px-1 text-xs text-muted-foreground'
            onClick={() => onSelectionChange?.([])}
          >
            Clear
          </Button>
        </div>
      )}

      <Separator />

      {/* List content */}
      {isEmpty ? (
        <div className='flex items-center justify-center py-8 text-sm text-muted-foreground'>
          {isSearchEmpty ? emptySearchMessage : emptyMessage}
        </div>
      ) : maxHeight ? (
        <ScrollArea style={{ maxHeight }} className='w-full'>
          <NativeNestedList
            items={listItems}
            activeId={activeId}
            onItemClick={handleItemClick}
            size={size}
            showExpandIcon={showExpandIcon}
            defaultExpanded={allExpanded}
            indentSize={indentSize}
          />
        </ScrollArea>
      ) : (
        <NativeNestedList
          items={listItems}
          activeId={activeId}
          onItemClick={handleItemClick}
          size={size}
          showExpandIcon={showExpandIcon}
          defaultExpanded={allExpanded}
          indentSize={indentSize}
        />
      )}
    </div>
  )
}

export type { ListItem } from '@/components/uitripled/native-nested-list-shadcnui'
