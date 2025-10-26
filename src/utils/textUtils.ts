import React from 'react'

export const stripHtml = (html: string): string => {
  if (!html) return ''

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const plainText = tempDiv.textContent || tempDiv.innerText || ''

  return plainText.length > 120
    ? plainText.substring(0, 120) + '...'
    : plainText
}

/**
 * Extracts plain text content from React children elements recursively.
 * Handles strings, numbers, arrays, and nested React elements.
 *
 * @param children - React node(s) to extract text from
 * @returns Concatenated text content as a string
 *
 * @example
 * extractTextFromChildren(<span>Hello <strong>World</strong></span>)
 * // Returns: "Hello World"
 */
export const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') {
    return children
  }

  if (typeof children === 'number') {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('')
  }

  if (React.isValidElement(children)) {
    return extractTextFromChildren(children.props.children)
  }

  return ''
}
