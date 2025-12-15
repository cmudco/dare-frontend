import React, { useMemo } from 'react'
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer-continued'
import { cn } from '@/lib/utils'

interface ArtifactDiffViewProps {
  oldContent: string
  newContent: string
  oldTitle?: string
  newTitle?: string
  splitView?: boolean
}

/**
 * Component for displaying a diff between two artifact versions.
 *
 * Uses react-diff-viewer-continued for side-by-side or unified diff view.
 */
const ArtifactDiffView: React.FC<ArtifactDiffViewProps> = ({
  oldContent,
  newContent,
  oldTitle = 'Previous Version',
  newTitle = 'Current Version',
  splitView = true,
}) => {
  // Custom styles for the diff viewer
  const diffStyles = useMemo(
    () => ({
      variables: {
        light: {
          diffViewerBackground: '#ffffff',
          diffViewerColor: '#1a1a1a',
          addedBackground: '#e6ffed',
          addedColor: '#24292e',
          removedBackground: '#ffeef0',
          removedColor: '#24292e',
          wordAddedBackground: '#acf2bd',
          wordRemovedBackground: '#fdb8c0',
          addedGutterBackground: '#cdffd8',
          removedGutterBackground: '#ffdce0',
          gutterBackground: '#f7f7f7',
          gutterBackgroundDark: '#f3f1f1',
          highlightBackground: '#fffbdd',
          highlightGutterBackground: '#fff5b1',
          codeFoldGutterBackground: '#dbedff',
          codeFoldBackground: '#f1f8ff',
          emptyLineBackground: '#fafbfc',
          gutterColor: '#636e7b',
          addedGutterColor: '#22863a',
          removedGutterColor: '#b31d28',
          codeFoldContentColor: '#656d76',
          diffViewerTitleBackground: '#f6f8fa',
          diffViewerTitleColor: '#24292e',
          diffViewerTitleBorderColor: '#e1e4e8',
        },
        dark: {
          diffViewerBackground: '#0d1117',
          diffViewerColor: '#e6edf3',
          addedBackground: '#0d2818',
          addedColor: '#e6edf3',
          removedBackground: '#3d1a1a',
          removedColor: '#e6edf3',
          wordAddedBackground: '#196c2e',
          wordRemovedBackground: '#9e1c23',
          addedGutterBackground: '#0d2818',
          removedGutterBackground: '#3d1a1a',
          gutterBackground: '#161b22',
          gutterBackgroundDark: '#21262d',
          highlightBackground: '#3b2e00',
          highlightGutterBackground: '#473700',
          codeFoldGutterBackground: '#1c2128',
          codeFoldBackground: '#161b22',
          emptyLineBackground: '#0d1117',
          gutterColor: '#8b949e',
          addedGutterColor: '#3fb950',
          removedGutterColor: '#f85149',
          codeFoldContentColor: '#8b949e',
          diffViewerTitleBackground: '#161b22',
          diffViewerTitleColor: '#e6edf3',
          diffViewerTitleBorderColor: '#30363d',
        },
      },
      line: {
        padding: '4px 8px',
        fontSize: '13px',
        fontFamily:
          'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
      },
      gutter: {
        minWidth: '50px',
        padding: '0 10px',
      },
      diffContainer: {
        borderRadius: '8px',
        overflow: 'hidden',
      },
      titleBlock: {
        padding: '10px 16px',
        fontWeight: 600,
        fontSize: '13px',
      },
    }),
    []
  )

  // Detect dark mode
  const isDarkMode =
    typeof window !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  return (
    <div
      className={cn('rounded-lg border border-gray-200 dark:border-gray-700')}
    >
      <ReactDiffViewer
        oldValue={oldContent}
        newValue={newContent}
        splitView={splitView}
        leftTitle={oldTitle}
        rightTitle={newTitle}
        compareMethod={DiffMethod.WORDS}
        styles={diffStyles}
        useDarkTheme={isDarkMode}
        hideLineNumbers={false}
        showDiffOnly={false}
      />
    </div>
  )
}

export default ArtifactDiffView
