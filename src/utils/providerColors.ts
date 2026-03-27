export interface ProviderBrand {
  name: string
  bg: string
  text: string
  border: string
  icon: string
  lightBg: string
  logo?: string
}

export const PROVIDER_BRANDS: Record<string, ProviderBrand> = {
  openai: {
    name: 'OpenAI',
    bg: 'bg-[#10a37f]',
    text: 'text-[#10a37f]',
    border: 'border-[#10a37f]/20',
    icon: 'text-[#10a37f]',
    lightBg: 'bg-[#10a37f]/10',
    logo: '/icons/providers/openai.png',
  },
  claude: {
    name: 'Anthropic',
    bg: 'bg-[#cc9b7a]',
    text: 'text-[#cc9b7a]',
    border: 'border-[#cc9b7a]/20',
    icon: 'text-[#cc9b7a]',
    lightBg: 'bg-[#cc9b7a]/10',
    logo: '/icons/providers/claude.png',
  },
  anthropic: {
    name: 'Anthropic',
    bg: 'bg-[#cc9b7a]',
    text: 'text-[#cc9b7a]',
    border: 'border-[#cc9b7a]/20',
    icon: 'text-[#cc9b7a]',
    lightBg: 'bg-[#cc9b7a]/10',
    logo: '/icons/providers/claude.png',
  },
  gemini: {
    name: 'Google',
    bg: 'bg-[#4285f4]',
    text: 'text-[#4285f4]',
    border: 'border-[#4285f4]/20',
    icon: 'text-[#4285f4]',
    lightBg: 'bg-[#4285f4]/10',
    logo: '/icons/providers/gemini.png',
  },
  google: {
    name: 'Google',
    bg: 'bg-[#4285f4]',
    text: 'text-[#4285f4]',
    border: 'border-[#4285f4]/20',
    icon: 'text-[#4285f4]',
    lightBg: 'bg-[#4285f4]/10',
    logo: '/icons/providers/gemini.png',
  },
  llama: {
    name: 'Meta',
    bg: 'bg-[#0668E1]',
    text: 'text-[#0668E1]',
    border: 'border-[#0668E1]/20',
    icon: 'text-[#0668E1]',
    lightBg: 'bg-[#0668E1]/10',
    logo: '/icons/providers/llama.png', // Assuming image.png is Llama logo
  },
  meta: {
    name: 'Meta',
    bg: 'bg-[#0668E1]',
    text: 'text-[#0668E1]',
    border: 'border-[#0668E1]/20',
    icon: 'text-[#0668E1]',
    lightBg: 'bg-[#0668E1]/10',
    logo: '/icons/providers/llama.png',
  },
  mistral: {
    name: 'Mistral',
    bg: 'bg-[#f5d0fe]',
    text: 'text-[#d946ef]',
    border: 'border-[#d946ef]/20',
    icon: 'text-[#d946ef]',
    lightBg: 'bg-[#d946ef]/10',
  },
  groq: {
    name: 'Groq',
    bg: 'bg-[#f59e0b]',
    text: 'text-[#f59e0b]',
    border: 'border-[#f59e0b]/20',
    icon: 'text-[#f59e0b]',
    lightBg: 'bg-[#f59e0b]/10',
  },
  perplexity: {
    name: 'Perplexity',
    bg: 'bg-[#22d3ee]',
    text: 'text-[#0891b2]',
    border: 'border-[#0891b2]/20',
    icon: 'text-[#0891b2]',
    lightBg: 'bg-[#0891b2]/10',
  },
  deepseek: {
    name: 'DeepSeek',
    bg: 'bg-[#3b82f6]',
    text: 'text-[#2563eb]',
    border: 'border-[#2563eb]/20',
    icon: 'text-[#2563eb]',
    lightBg: 'bg-[#2563eb]/10',
  },
}

export const getProviderBrand = (provider: string): ProviderBrand => {
  const key = provider.toLowerCase()
  return (
    PROVIDER_BRANDS[key] || {
      name: provider,
      bg: 'bg-slate-500',
      text: 'text-slate-500',
      border: 'border-slate-500/20',
      icon: 'text-slate-500',
      lightBg: 'bg-slate-500/10',
    }
  )
}
