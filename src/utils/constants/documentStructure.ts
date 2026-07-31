/**
 * Vocabulary of the parsed document model.
 *
 * Mirrors the labels the backend parser attaches to each element (see
 * `core/config/document_parsing.py`). Kept as plain constants so the structure
 * view can name things the way a reader would rather than echoing the parser's
 * internal terms.
 */

export const ELEMENT_LABEL_TEXT: Record<string, string> = {
  title: 'Title',
  section_header: 'Heading',
  text: 'Text',
  list_item: 'List item',
  caption: 'Caption',
  page_header: 'Page header',
  page_footer: 'Page footer',
  footnote: 'Footnote',
  picture: 'Image',
  table: 'Table',
}

export const HEADING_LABELS = ['title', 'section_header']

/**
 * Running heads, footers and page numbers. They repeat on every page and carry
 * no content, so the structure view hides them by default — the same reason
 * the backend drops them before chunking.
 */
export const FURNITURE_LABELS = ['page_header', 'page_footer', 'footnote']
