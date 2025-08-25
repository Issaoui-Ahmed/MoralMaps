export type Coordinate = [number, number]

export interface RouteConfig {
  start: Coordinate
  end: Coordinate
  waypoints?: Coordinate[]
  // add more fields if your backend returns them
}

export interface Scenario {
  id: string
  label: string
  description?: string
  // extend as needed
}

export interface SurveyField {
  name: string
  label: string
  type: 'text' | 'radio' | 'checkbox' | 'select'
  options?: string[]
}

export interface SurveyPayload {
  sessionId: string
  answers: Record<string, unknown>
}
