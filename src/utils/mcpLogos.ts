/**
 * MCP Server Logo Utility
 *
 * Maps MCP server slugs to their corresponding logo paths.
 * Logos are stored in /public/mcp-logos/ as SVG files.
 */

// Known MCP server logos (add new servers here as they're integrated)
const MCP_LOGOS: Record<string, string> = {
  slack: '/mcp-logos/slack.svg',
  github: '/mcp-logos/github.svg',
}

/**
 * Get the logo path for an MCP server by slug.
 * Returns null if no logo exists for the server.
 */
export const getMcpLogo = (slug: string): string | null => {
  return MCP_LOGOS[slug.toLowerCase()] ?? null
}

/**
 * Check if an MCP server has a logo available.
 */
export const hasMcpLogo = (slug: string): boolean => {
  return slug.toLowerCase() in MCP_LOGOS
}

/**
 * Get all available MCP logos.
 */
export const getAllMcpLogos = (): Record<string, string> => MCP_LOGOS
