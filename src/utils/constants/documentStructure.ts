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
  document_index: 'Contents',
  formula: 'Formula',
  code: 'Code',
  form: 'Form',
}

export const HEADING_LABELS = ['title', 'section_header']

/**
 * The full vocabulary the parser can assign, grouped by what the type is for.
 *
 * Any one document only uses part of this — a newsletter has no formulas, a
 * syllabus has no photographs — so the legend shows what the model *can*
 * recognise rather than only what turned up in the file on screen.
 */
export const ELEMENT_TYPE_GROUPS: {
  title: string
  note?: string
  types: { label: string; description: string }[]
}[] = [
  {
    title: 'Structure',
    types: [
      { label: 'title', description: 'The title of the document' },
      {
        label: 'section_header',
        description: 'A heading; these form the outline',
      },
      { label: 'text', description: 'A paragraph of body text' },
      {
        label: 'list_item',
        description: 'One entry of a bulleted or numbered list',
      },
      { label: 'caption', description: 'Text bound to a figure or table' },
    ],
  },
  {
    title: 'Content blocks',
    types: [
      {
        label: 'table',
        description: 'A grid, kept as markdown rather than flattened',
      },
      { label: 'picture', description: 'A figure, chart, photograph or logo' },
      { label: 'formula', description: 'A mathematical expression' },
      { label: 'code', description: 'A block of code' },
      { label: 'document_index', description: 'A table of contents' },
      { label: 'form', description: 'A form region with fields' },
    ],
  },
  {
    title: 'Furniture',
    note: 'Repeats on every page and carries no content, so it is hidden here and dropped before chunking.',
    types: [
      {
        label: 'page_header',
        description: 'Running head at the top of a page',
      },
      { label: 'page_footer', description: 'Running foot or page number' },
      { label: 'footnote', description: 'A note at the foot of a page' },
    ],
  },
]

/**
 * Running heads, footers and page numbers. They repeat on every page and carry
 * no content, so the structure view hides them by default — the same reason
 * the backend drops them before chunking.
 */
export const FURNITURE_LABELS = ['page_header', 'page_footer', 'footnote']
