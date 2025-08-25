import { useMemo, useState } from 'react'
import { Scenario } from '@types'

export function useScenarios(initial: Scenario[]) {
  const [index, setIndex] = useState(0)
  const scenarios = useMemo(() => initial, [initial])
  const current = scenarios[index]
  const hasNext = index < scenarios.length - 1
  const next = () => setIndex(i => Math.min(i + 1, scenarios.length - 1))
  return { scenarios, current, index, hasNext, next }
}
