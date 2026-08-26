import { ProviderType } from '@/redux/types/apiKeys'

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  openai: 'OpenAI',
  claude: 'Anthropic (Claude)',
  gemini: 'Google (Gemini)',
  llama: 'Meta (LLaMA)',
}

export const PROVIDERS = [
  { type: 'openai' as const, label: PROVIDER_LABELS.openai },
  { type: 'claude' as const, label: PROVIDER_LABELS.claude },
  { type: 'gemini' as const, label: PROVIDER_LABELS.gemini },
  { type: 'llama' as const, label: PROVIDER_LABELS.llama },
]

export const BILLING_MODE_INFO = {
  wallet: {
    title: 'Using Platform Credits',
    description:
      "You're using the platform's API keys. Costs will be deducted from your wallet balance.",
    helperText:
      'Platform API keys are used and costs are deducted from your wallet balance.',
  },
  own_api: {
    title: 'Using Your Own API Keys',
    description:
      'Your API keys are being used. You pay providers directly. No wallet charges apply.',
    helperText:
      'Your own API keys are used and you pay the providers directly. No wallet charges.',
  },
  litellm: {
    title: 'Using a LiteLLM Proxy',
    description:
      'Requests are routed through your LiteLLM proxy key. You pay that account directly. No wallet charges apply.',
    helperText:
      'A LiteLLM proxy key is used and you pay that account directly. No wallet charges.',
  },
}

export const INFO_MESSAGES = {
  configureKeys: {
    title: 'Configure Your API Keys',
    description:
      'Add your API keys below, then switch to "Use Own API Keys" mode to use them. Keys are stored securely with AES-256 encryption.',
  },
  loading: 'Loading API key status...',
}

export const ALERT_STYLES = {
  success: {
    container:
      'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    title: 'text-green-900 dark:text-green-100',
    text: 'text-green-700 dark:text-green-300',
  },
  warning: {
    container:
      'border-purple-200 bg-purple-50 dark:border-purple-900/50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    title: 'text-purple-900 dark:text-purple-100',
    text: 'text-purple-700 dark:text-purple-300',
  },
  error: {
    container:
      'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    title: 'text-red-900 dark:text-red-100',
    text: 'text-red-700 dark:text-red-300',
  },
  info: {
    container:
      'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-900 dark:text-blue-100',
    text: 'text-blue-700 dark:text-blue-300',
  },
} as const
