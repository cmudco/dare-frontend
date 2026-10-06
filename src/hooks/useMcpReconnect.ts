import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/redux/hooks'
import { startMcpOAuth } from '@/redux/asyncThunks/mcp'
import { McpAuthType } from '@/utils/constants/mcp'

const RETURN_PATH_KEY = 'mcpOAuthReturnPath'

/**
 * Path to return to after reconnecting ``serverSlug``; read once, then
 * cleared. A path saved for a different (abandoned) reconnect is ignored.
 */
export const takeMcpReturnPath = (serverSlug: string): string | null => {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RETURN_PATH_KEY) ?? 'null')
    sessionStorage.removeItem(RETURN_PATH_KEY)
    return saved?.serverSlug === serverSlug ? saved.path : null
  } catch {
    return null
  }
}

/**
 * Re-authorize an MCP connection without disconnecting it. OAuth servers go
 * straight to the provider and come back to the current page; credential
 * servers open their settings page to re-enter keys.
 */
export const useMcpReconnect = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [reconnecting, setReconnecting] = useState(false)

  const reconnect = useCallback(
    async (serverSlug: string, authType?: McpAuthType) => {
      if (authType && authType !== McpAuthType.OAUTH2) {
        navigate(`/mcp/${serverSlug}`)
        return
      }
      setReconnecting(true)
      try {
        sessionStorage.setItem(
          RETURN_PATH_KEY,
          JSON.stringify({
            serverSlug,
            path: window.location.pathname + window.location.search,
          })
        )
      } catch {
        // Without storage the callback page still offers a way back.
      }
      const result = await dispatch(startMcpOAuth(serverSlug))
      if (startMcpOAuth.fulfilled.match(result)) {
        window.location.assign(result.payload.authorizationUrl)
      } else {
        setReconnecting(false)
      }
    },
    [dispatch, navigate]
  )

  return { reconnect, reconnecting }
}
