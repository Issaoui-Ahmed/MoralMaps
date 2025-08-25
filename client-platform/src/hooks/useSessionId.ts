import { useEffect, useRef } from 'react'

export function useSessionId() {
  const ref = useRef<string | null>(null)
  if (ref.current == null) {
    ref.current = localStorage.getItem('sessionId')
    if (!ref.current) {
      ref.current = crypto.randomUUID()
      localStorage.setItem('sessionId', ref.current)
    }
  }
  useEffect(() => {}, []) // reserve for future effects
  return ref.current
}
