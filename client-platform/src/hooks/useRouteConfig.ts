import { useEffect, useState } from 'react'
import { routesService } from '@services/routes'
import { RouteConfig } from '@types'

export function useRouteConfig() {
  const [data, setData] = useState<RouteConfig | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const cfg = await routesService.getRouteEndpoints()
        if (!cancelled) setData(cfg)
      } catch (e) {
        if (!cancelled) setError(e as Error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return { data, error, loading }
}
