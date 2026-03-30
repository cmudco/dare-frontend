/** Format Wh to the most readable unit */
export const formatEnergy = (wh: number): string => {
  if (wh >= 1000) return `${(wh / 1000).toFixed(2)} kWh`
  if (wh >= 1) return `${wh.toFixed(2)} Wh`
  return `${(wh * 1000).toFixed(1)} mWh`
}

/** Format seconds to human-friendly duration */
export const formatDuration = (seconds: number): string => {
  if (seconds >= 3600) return `${(seconds / 3600).toFixed(1)} hours`
  if (seconds >= 60) return `${(seconds / 60).toFixed(1)} minutes`
  return `${seconds.toFixed(1)} seconds`
}

/** Format carbon grams */
export const formatCarbon = (grams: number): string => {
  if (grams >= 1000) return `${(grams / 1000).toFixed(2)} kg CO₂e`
  return `${grams.toFixed(2)} g CO₂e`
}

/** Format water mL */
export const formatWater = (ml: number): string => {
  if (ml >= 1000) return `${(ml / 1000).toFixed(2)} L`
  return `${ml.toFixed(1)} mL`
}

/** Format phone battery - "5.6% of a charge" or "18.3 full charges" */
export const formatPhoneBattery = (pct: number): string => {
  if (pct >= 100) return `${(pct / 100).toFixed(1)} full charges`
  return `${pct.toFixed(1)}% of a charge`
}

/** Format Google searches equivalent */
export const formatSearches = (count: number): string => {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k searches`
  return `${count.toFixed(1)} searches`
}

/** Provider hex colors for Recharts (not Tailwind classes) */
export const PROVIDER_CHART_COLORS: Record<string, string> = {
  openai: '#10a37f',
  claude: '#cc9b7a',
  anthropic: '#cc9b7a',
  gemini: '#4285f4',
  google: '#4285f4',
  llama: '#0668E1',
  meta: '#0668E1',
  mistral: '#d946ef',
  groq: '#f59e0b',
  perplexity: '#0891b2',
  deepseek: '#2563eb',
}

export const getProviderChartColor = (provider: string): string => {
  return PROVIDER_CHART_COLORS[provider.toLowerCase()] || '#6B7280'
}
