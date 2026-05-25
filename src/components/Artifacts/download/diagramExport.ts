import mermaid from 'mermaid'

interface MermaidExportOptions {
  rasterSafe?: boolean
}

const DEFAULT_MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { htmlLabels: true },
} as const

const RASTER_SAFE_MERMAID_CONFIG = {
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'strict',
  flowchart: { htmlLabels: false },
} as const

let mermaidExportQueue = Promise.resolve()

export async function generateMermaidSvg(
  code: string,
  options: MermaidExportOptions = {}
): Promise<string> {
  const exportTask = mermaidExportQueue.then(() =>
    renderMermaidSvg(code, options)
  )
  mermaidExportQueue = exportTask.then(
    () => undefined,
    () => undefined
  )
  return await exportTask
}

async function renderMermaidSvg(
  code: string,
  options: MermaidExportOptions
): Promise<string> {
  if (options.rasterSafe) {
    mermaid.initialize(RASTER_SAFE_MERMAID_CONFIG)
  }

  await mermaid.parse(code)
  const id = `mermaid_download_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`

  try {
    const { svg } = await mermaid.render(id, code)
    return svg
  } finally {
    if (options.rasterSafe) {
      mermaid.initialize(DEFAULT_MERMAID_CONFIG)
    }
  }
}
