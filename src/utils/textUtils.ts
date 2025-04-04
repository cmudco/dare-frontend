export const stripHtml = (html: string): string => {
  if (!html) return ''

  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const plainText = tempDiv.textContent || tempDiv.innerText || ''

  return plainText.length > 120
    ? plainText.substring(0, 120) + '...'
    : plainText
}
