declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number]
    filename?: string
    image?: {
      type?: string
      quality?: number
    }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      [key: string]: unknown
    }
    jsPDF?: {
      unit?: string
      format?: string
      orientation?: 'portrait' | 'landscape'
      [key: string]: unknown
    }
    [key: string]: unknown
  }

  interface Html2PdfInstance {
    from(element: HTMLElement): Html2PdfInstance
    set(options: Html2PdfOptions): Html2PdfInstance
    save(): Promise<void>
    toPdf(): unknown
    toImg(): unknown
    toCanvas(): unknown
    toBlob(): unknown
    output(type: string, options?: unknown): unknown
  }

  function html2pdf(): Html2PdfInstance
  function html2pdf(
    element: HTMLElement,
    options?: Html2PdfOptions
  ): Html2PdfInstance

  export = html2pdf
}
