import { api } from './api'
import { RouteConfig, SurveyPayload } from '@types'

export const routesService = {
  getRouteEndpoints: () => api.get<RouteConfig>('/api/route-endpoints'),
  logChoice: (data: { sessionId: string; scenarioId: string; choice: string }) =>
    api.post<{ ok: true }>('/api/log-choice', data),
  logSurvey: (payload: SurveyPayload) =>
    api.post<{ ok: true }>('/api/log-survey', payload),
}
