import { getMcpLogo } from '@/utils/mcpLogos'

interface MCPServerLogoProps {
  /** Server slug (e.g., 'slack', 'github') */
  slug: string
  /** Size of the logo in pixels (default: 24) */
  size?: number
  /** Additional CSS classes */
  className?: string
  /** Fallback emoji if no logo exists */
  fallbackEmoji?: string
}

/**
 * MCPServerLogo - Displays the logo for an MCP server.
 *
 * If a logo exists for the server slug, it renders the SVG image.
 * Otherwise, it falls back to an emoji or default icon.
 */
export const MCPServerLogo = ({
  slug,
  size = 24,
  className = '',
  fallbackEmoji = '🔌',
}: MCPServerLogoProps) => {
  const logoPath = getMcpLogo(slug)

  if (logoPath) {
    return (
      <img
        src={logoPath}
        alt={`${slug} logo`}
        width={size}
        height={size}
        className={`object-contain ${className}`}
      />
    )
  }

  // Fallback to emoji
  return (
    <span
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.75 }}
    >
      {fallbackEmoji}
    </span>
  )
}

export default MCPServerLogo
