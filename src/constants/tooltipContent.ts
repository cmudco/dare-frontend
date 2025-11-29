/**
 * Centralized tooltip content for the DARE application
 * Organized by feature area for consistency and easy maintenance
 */

export const TOOLTIP_CONTENT = {
  // API Keys & Providers
  apiKeys: {
    header: {
      title: 'API Keys',
      description:
        'API keys allow you to use AI models from different providers. Keys are encrypted and securely stored.',
      tip: "You can use your own keys or purchase wallet credits to use DARE's managed service.",
    },
    openai: {
      title: 'OpenAI',
      description:
        'Powers GPT models including GPT-4, GPT-4 Turbo, and GPT-3.5. Best for general-purpose tasks, coding, and creative writing.',
      tip: 'Get your API key from platform.openai.com',
    },
    anthropic: {
      title: 'Anthropic Claude',
      description:
        'Powers Claude models (Opus, Sonnet, Haiku). Excellent for analysis, reasoning, and long-form content.',
      tip: 'Get your API key from console.anthropic.com',
    },
    google: {
      title: 'Google Gemini',
      description:
        'Powers Gemini models with strong multimodal capabilities. Great for vision tasks and diverse content generation.',
      tip: 'Get your API key from makersuite.google.com',
    },
    llama: {
      title: 'LLaMA (Local)',
      description:
        'Run models locally via Ollama. No API key required. Free but requires local setup and hardware.',
      tip: 'Install Ollama from ollama.ai and pull models to use',
    },
    activeStatus: {
      title: 'Active Key',
      description:
        'This API key has been validated and is ready to use for AI conversations.',
      tip: '',
    },
    security: {
      title: 'Secure Storage',
      description:
        'Your API keys are encrypted before storage and never exposed in logs or responses.',
      tip: 'You can safely update or delete keys at any time.',
    },
    delete: {
      title: 'Delete API Key',
      description:
        "Removing this key will prevent you from using this provider's models until you add a new key.",
      tip: 'This action cannot be undone, but you can always add the key again later.',
    },
  },

  // Billing & Payment
  billing: {
    mode: {
      title: 'Billing Mode',
      description:
        'Choose how you want to pay for AI usage. You can switch between modes at any time.',
      tip: 'Using your own API keys gives you direct control over costs and provider relationships.',
    },
    walletCredits: {
      title: 'Use Wallet Credits',
      description:
        'DARE manages the AI provider accounts. Credits are deducted from your wallet balance based on actual usage.',
      tip: 'Convenient option with unified billing across all providers. Purchase credits in your billing dashboard.',
    },
    ownApiKeys: {
      title: 'Use Own API Keys',
      description:
        'You provide your own API keys and are billed directly by the providers (OpenAI, Anthropic, etc.).',
      tip: 'Best for users with existing provider accounts or those who want direct cost control.',
    },
    requiresKey: {
      title: 'API Key Required',
      description:
        'To use your own API keys, you must add at least one provider API key in the settings.',
      tip: 'Add keys in the API Keys section above.',
    },
  },

  // Vector Database & RAG
  vectorDB: {
    provider: {
      title: 'Vector Database Provider',
      description:
        'Vector databases store document embeddings for semantic search and retrieval (RAG). Choose based on your privacy and performance needs.',
      tip: 'Both providers work well - Pinecone is faster to set up, Weaviate offers more control.',
    },
    pinecone: {
      title: 'Pinecone',
      description:
        'Managed cloud vector database. Fast setup, scalable, and reliable. Paid service with free tier available.',
      tip: 'Best for: Production use, scalability, minimal setup. Requires API key from pinecone.io',
    },
    weaviate: {
      title: 'Weaviate',
      description:
        'Open-source vector database. Can be self-hosted for complete data privacy and control.',
      tip: 'Best for: Sensitive data, self-hosting, cost control. Requires your own Weaviate instance.',
    },
    ragExplanation: {
      title: 'Vector Database for RAG',
      description:
        'Retrieval Augmented Generation (RAG) uses vector databases to find relevant document snippets and include them in AI responses.',
      tip: 'This enables the AI to answer questions based on your uploaded documents.',
    },
  },

  // Chunking & Document Processing
  chunking: {
    chunkSize: {
      title: 'Chunk Size',
      description:
        'Documents are split into chunks for processing. Chunk size is the maximum number of characters per chunk.',
      tip: 'Recommended: 500-1000 characters. Larger chunks preserve more context but may be less precise for retrieval.',
    },
    overlap: {
      title: 'Chunk Overlap',
      description:
        'Number of characters that overlap between consecutive chunks. Overlap prevents context loss at chunk boundaries.',
      tip: 'Recommended: 10-20% of chunk size (e.g., 100-200 characters for 1000-char chunks).',
    },
    tradeoffs: {
      title: 'Chunking Strategy',
      description:
        'Smaller chunks (300-500): More precise retrieval, better for Q&A. Larger chunks (800-1200): Better context preservation, good for summarization.',
      tip: 'Default settings (500/100) work well for most use cases.',
    },
  },

  // Model Configuration
  modelConfig: {
    temperature: {
      title: 'Temperature',
      description:
        'Controls randomness in responses. Lower = more focused/deterministic. Higher = more creative/diverse.',
      tip: '0.0-0.3: Factual tasks, code. 0.7-1.0: Creative writing. 1.0-2.0: Maximum creativity (experimental).',
    },
    maxTokens: {
      title: 'Max Tokens',
      description:
        "Maximum length of the AI's response. ~4 characters = 1 token. Longer responses use more tokens and cost more.",
      tip: '2000 tokens ≈ 500 words. Increase for longer responses, decrease to save costs.',
    },
    historyLimit: {
      title: 'History Limit',
      description:
        'Number of previous messages included in the conversation context. More history = better continuity but uses more tokens.',
      tip: '10-20 messages works well for most conversations. Increase for complex discussions requiring long context.',
    },
    webSearch: {
      title: 'Web Search',
      description:
        'When enabled, the AI can search the web for current information before responding. Adds latency and cost.',
      tip: 'Enable for questions requiring recent data. Disable for faster, cheaper responses from AI knowledge alone.',
    },
    imageGeneration: {
      title: 'Image Generation',
      description:
        'Allows AI to generate images using DALL-E. Automatically switches to GPT-4 when needed.',
      tip: 'Each image generation incurs additional costs. Check pricing in your billing dashboard.',
    },
    resetDefaults: {
      title: 'Reset to Defaults',
      description:
        'Restore all settings to recommended values: Temperature 0.7, Max Tokens 2000, History 20.',
      tip: "Use this if you've experimented with settings and want to start fresh.",
    },
  },

  // Model Context & RAG Settings
  modelContext: {
    maxSnippets: {
      title: 'Max Context Snippets',
      description:
        "Maximum number of relevant document chunks to include in the AI's context. More snippets = more information but slower responses.",
      tip: '3-5 snippets: Fast, focused. 8-10 snippets: Comprehensive context. Adjust based on document complexity.',
    },
    similarityThreshold: {
      title: 'Document Similarity Threshold',
      description:
        'Minimum similarity score (0-1) for including a document chunk. Higher = stricter matching, fewer but more relevant results.',
      tip: '0.2-0.3: Broad matching, more results. 0.4-0.5: Strict matching, highly relevant only. Start with 0.3.',
    },
    retrievalQuality: {
      title: 'Retrieval Quality',
      description:
        'Balance between retrieval precision and recall. Strict settings reduce noise, loose settings ensure coverage.',
      tip: 'Adjust both settings together for best results. More snippets + lower threshold = comprehensive coverage.',
    },
  },

  // Model Selection
  modelPicker: {
    provider: {
      title: 'Provider Filter',
      description:
        'Filter models by AI provider. Each provider has different strengths, pricing, and capabilities.',
      tip: 'Try different providers for the same task to compare quality and cost.',
    },
    modelInfo: {
      title: 'Model Information',
      description:
        'View detailed capabilities, context window size, pricing, and best use cases for this model.',
      tip: 'Click to see full model specifications and recommendations.',
    },
    contextWindow: {
      title: 'Context Window',
      description:
        'Maximum amount of text (in tokens) the model can process at once, including conversation history and documents.',
      tip: 'Larger context windows allow for longer conversations and more document content.',
    },
    capabilities: {
      title: 'Model Capabilities',
      description:
        'Special features this model supports: vision, function calling, JSON mode, web search, etc.',
      tip: 'Choose models with capabilities matching your task requirements.',
    },
  },

  // File Management
  files: {
    upload: {
      title: 'File Upload',
      description:
        'Upload documents for AI to analyze. Supports PDF, DOCX, TXT, MD, and more. Files are processed and stored as embeddings.',
      tip: 'Drag & drop multiple files or click to browse. Processing time depends on file size.',
    },
    chunkSettings: {
      title: 'Chunk Settings',
      description:
        'Adjust how documents are split for processing. These settings apply to all newly uploaded files.',
      tip: 'Click gear icon to customize chunk size and overlap for optimal retrieval quality.',
    },
    tags: {
      title: 'File Tags',
      description:
        'Organize files with tags for easier filtering and retrieval. Tags help the AI find relevant documents.',
      tip: "Use descriptive tags like 'research', 'legal', 'marketing' to categorize your documents.",
    },
    allowedTypes: {
      title: 'Supported File Types',
      description:
        'PDF, DOCX, DOC, TXT, MD, RTF, ODT, and more text-based formats.',
      tip: 'Images and scanned PDFs require OCR preprocessing for best results.',
    },
    maxSize: {
      title: 'Maximum File Size',
      description:
        'Individual files up to 50MB. Larger files take longer to process.',
      tip: 'For very large documents, consider splitting into smaller sections for better performance.',
    },
    contentFiles: {
      title: 'Content Files',
      description:
        'Files directly passed to the AI as context. The entire content is included in the prompt.',
      tip: 'Use for small, important files that should be fully read by the AI.',
    },
    embeddingFiles: {
      title: 'Embedding Files',
      description:
        'Files processed into vector embeddings for semantic search (RAG). Only relevant chunks are retrieved.',
      tip: 'Use for large documents where you want the AI to find and use relevant sections.',
    },
  },

  // Workflows
  workflows: {
    step: {
      title: 'Workflow Step',
      description:
        'Each step is an AI task that can use different models, prompts, and files. Steps execute in sequence.',
      tip: 'Steps can pass outputs to subsequent steps for complex multi-stage processing.',
    },
    agent: {
      title: 'Agent',
      description:
        'Agents are pre-configured AI personalities with specific prompts, models, and settings. Load an agent to quickly set up a step.',
      tip: 'Create reusable agents in the Agent Manager for consistent AI behavior across workflows.',
    },
    loadAgent: {
      title: 'Load Agent',
      description:
        'Apply all settings from a saved agent to this step. Overwrites current prompt, model, and parameter settings.',
      tip: 'You can modify agent settings after loading. Original agent remains unchanged.',
    },
    clearAgent: {
      title: 'Clear Agent',
      description:
        'Remove agent association and revert to previous step settings.',
      tip: 'Use when you want to start fresh or manually configure the step.',
    },
    prompt: {
      title: 'Prompt Template',
      description:
        "System prompt that defines the AI's behavior and task for this step. Can include variables from previous steps.",
      tip: 'Create reusable prompts in the Prompt Manager for consistent instructions.',
    },
    textInput: {
      title: 'Text Input',
      description:
        'User input or instructions for this step. Combined with prompt and files to create the complete AI request.',
      tip: 'Can reference previous step outputs using {{step_X_output}} variables.',
    },
    structuredOutput: {
      title: 'Structured Output',
      description:
        'Extract specific data fields from AI responses. Enables conditional routing and data processing in subsequent steps.',
      tip: 'Use for workflows that need to make decisions based on AI output (routing, validation, etc.).',
    },
    advancedSettings: {
      title: 'Advanced Settings',
      description:
        'Fine-tune AI behavior for this specific step. Override global settings for specialized tasks.',
      tip: 'Leave empty to use global defaults. Customize when a step needs different behavior.',
    },
    manualExecution: {
      title: 'Manual Execution',
      description:
        'Run this step individually to test and debug. Useful for complex workflows.',
      tip: 'Manual mode lets you verify each step works correctly before running the full workflow.',
    },
    stepStatus: {
      title: 'Step Status',
      description:
        'Current state: Pending (not started), Running (in progress), Completed (success), Failed (error).',
      tip: 'Click failed steps to see error details and retry.',
    },
  },

  // Agents
  agents: {
    concept: {
      title: 'AI Agents',
      description:
        'Agents are reusable AI configurations with specific prompts, models, files, and parameters. Create agents for repeated tasks.',
      tip: "Example agents: 'Code Reviewer', 'Marketing Writer', 'Research Analyst' - each with tailored settings.",
    },
    name: {
      title: 'Agent Name',
      description:
        'Descriptive name for this agent configuration. Used when loading agents into workflow steps.',
      tip: "Use clear names like 'Legal Document Analyzer' or 'Creative Story Writer'.",
    },
    basicVsAdvanced: {
      title: 'Basic vs Advanced Settings',
      description:
        'Basic: Essential settings (prompt, model, files). Advanced: Fine-tuning (temperature, tokens, context).',
      tip: 'Start with basic settings. Use advanced only when you need specific behavior adjustments.',
    },
  },

  // Dashboard & Billing
  dashboard: {
    aiMessages: {
      title: 'AI Messages',
      description:
        'Total number of AI-generated responses across all conversations. Each AI reply counts as one message.',
      tip: 'Message count helps track usage patterns and engagement.',
    },
    inputTokens: {
      title: 'Input Tokens',
      description:
        'Tokens sent to AI (your messages, conversation history, document context). Input tokens are typically cheaper than output.',
      tip: 'Click for breakdown by model. Reduce by using shorter prompts and fewer history messages.',
    },
    outputTokens: {
      title: 'Output Tokens',
      description:
        'Tokens generated by AI (responses). Output tokens usually cost 2-3x more than input tokens.',
      tip: 'Control with Max Tokens setting. Shorter responses = lower costs.',
    },
    totalTokens: {
      title: 'Total Token Usage',
      description:
        'Combined input and output tokens. Primary metric for usage tracking and cost estimation.',
      tip: '1M tokens ≈ 750,000 words. Typical conversation uses 1,000-5,000 tokens.',
    },
    walletBalance: {
      title: 'Wallet Balance',
      description:
        "Available credits for AI usage when using DARE's managed billing mode.",
      tip: 'Click to view billing page and purchase additional credits.',
    },
    tokenBreakdown: {
      title: 'Token Usage by Model',
      description:
        'Detailed breakdown showing which AI models consumed the most tokens. Helps optimize costs.',
      tip: 'More expensive models (GPT-4, Claude Opus) should be used selectively for complex tasks.',
    },
  },

  // Image Generation
  imageGen: {
    size: {
      title: 'Image Size',
      description:
        'Output image dimensions. Larger images cost more but provide better detail and quality.',
      tip: '1024x1024: Standard square. 1792x1024: Landscape. 1024x1792: Portrait. Choose based on use case.',
    },
    quality: {
      title: 'Image Quality',
      description:
        'Standard: Faster, cheaper. HD: Higher fidelity, more detail, costs 2x standard.',
      tip: 'Use standard for quick iterations, HD for final production images.',
    },
    style: {
      title: 'Image Style',
      description:
        'Vivid: Hyper-real, dramatic, high contrast. Natural: Softer, more realistic, subtle.',
      tip: 'Vivid for marketing/creative. Natural for realistic representations.',
    },
    cost: {
      title: 'Estimated Cost',
      description:
        'Approximate cost in credits or USD for generating this image. Based on size and quality settings.',
      tip: 'Actual cost may vary slightly based on provider pricing changes.',
    },
  },

  // Conversations
  conversations: {
    newConversation: {
      title: 'New Conversation',
      description:
        'Start a fresh conversation with AI. Previous context will not be included.',
      tip: 'Use Cmd/Ctrl + K shortcut to quickly create a new conversation.',
    },
    clearConversation: {
      title: 'Clear Conversation',
      description:
        'Delete the current conversation and all its messages. This action cannot be undone.',
      tip: 'Use Cmd/Ctrl + click to select multiple conversations to delete at once.',
    },
    editConversation: {
      title: 'Edit Conversation Title',
      description:
        'Click to rename this conversation. Press Enter to save or Escape to cancel.',
      tip: 'Descriptive titles help you find conversations later.',
    },
    cloneConversation: {
      title: 'Clone Conversation',
      description:
        'Create an exact copy of this conversation including all messages and settings.',
      tip: 'Useful for trying different approaches while keeping the original.',
    },
    dragReorder: {
      title: 'Reorder Conversations',
      description:
        'Drag and drop conversations to reorder them. Your preferred order is saved automatically.',
      tip: 'Keep frequently used conversations at the top for quick access.',
    },
  },

  // Billing
  billing2: {
    walletBalance: {
      title: 'Current Wallet Balance',
      description:
        'Your available credits for AI usage. Credits are deducted as you use AI models.',
      tip: 'Low balance? Click "Add Credits" to purchase more.',
    },
    addCredits: {
      title: 'Add Credits',
      description:
        'Purchase additional wallet credits to continue using AI services.',
      tip: 'Credits never expire and can be used across all AI providers.',
    },
    transactionHistory: {
      title: 'Transaction History',
      description:
        'Complete record of all credit purchases, usage, and refunds.',
      tip: 'Export to CSV for detailed expense tracking and reporting.',
    },
    exportCSV: {
      title: 'Export to CSV',
      description:
        'Download your complete transaction history as a spreadsheet file.',
      tip: 'Includes transaction type, amount, model used, and timestamps.',
    },
    costPerModel: {
      title: 'Cost by Model',
      description:
        'Breakdown of credits spent on each AI model. Helps identify expensive usage patterns.',
      tip: 'Switch to cheaper models for simple tasks to reduce costs.',
    },
  },

  // General UI Elements
  general: {
    disabled: {
      title: 'Feature Disabled',
      description:
        'This feature is currently unavailable. Check requirements or settings to enable.',
      tip: "Hover over the element to see why it's disabled.",
    },
    beta: {
      title: 'Beta Feature',
      description:
        'This feature is in beta testing. Functionality may change or have limited support.',
      tip: 'Report issues or feedback to help improve this feature.',
    },
    pro: {
      title: 'Pro Feature',
      description: 'This feature requires a Pro subscription or higher tier.',
      tip: 'Upgrade your account to access advanced capabilities.',
    },
  },

  // Technical Terms Glossary
  glossary: {
    tokens: {
      title: 'Tokens',
      description:
        'Basic units of text for AI models. Approximately 4 characters or 0.75 words per token.',
      tip: 'All AI usage and costs are measured in tokens (input + output).',
    },
    embeddings: {
      title: 'Embeddings',
      description:
        'Vector representations of text that capture semantic meaning. Used for similarity search in RAG systems.',
      tip: 'Similar texts have similar embeddings, enabling intelligent document retrieval.',
    },
    rag: {
      title: 'RAG (Retrieval Augmented Generation)',
      description:
        'Technique that retrieves relevant document chunks and includes them in AI context for more accurate, grounded responses.',
      tip: 'RAG lets AI answer questions based on your specific documents, not just general knowledge.',
    },
    contextWindow: {
      title: 'Context Window',
      description:
        'Maximum amount of text the AI can process at once, including conversation history, prompts, and documents.',
      tip: 'Measured in tokens. GPT-4: 8K-128K tokens. Claude: up to 200K tokens.',
    },
    systemPrompt: {
      title: 'System Prompt',
      description:
        "Instructions that define the AI's role, behavior, and task. Shapes how the AI interprets and responds to user input.",
      tip: 'Good system prompts are clear, specific, and include examples of desired output.',
    },
    streaming: {
      title: 'Streaming Response',
      description:
        "AI generates response progressively, showing words as they're created rather than waiting for completion.",
      tip: 'Streaming provides better user experience for long responses.',
    },
  },
}

/**
 * Helper function to get tooltip content by path
 * Example: getTooltipContent('apiKeys', 'openai')
 */
export function getTooltipContent(
  category: keyof typeof TOOLTIP_CONTENT,
  key: string
): TooltipData | null {
  const categoryContent = TOOLTIP_CONTENT[category] as Record<
    string,
    TooltipData
  >
  return categoryContent[key] || null
}

/**
 * Helper component props type for tooltips
 */
export interface TooltipData {
  title: string
  description: string
  tip?: string
}
