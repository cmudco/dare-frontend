import { Navigate, useLocation, useParams } from 'react-router-dom'
import { INTEGRATIONS_PATH } from './paths'

/** Integrations moved under Settings; old /mcp links keep working. */
const LegacyIntegrationsRedirect = () => {
  const { '*': rest } = useParams()
  const { search } = useLocation()
  return (
    <Navigate
      to={`${INTEGRATIONS_PATH}${rest ? `/${rest}` : ''}${search}`}
      replace
    />
  )
}

export default LegacyIntegrationsRedirect
