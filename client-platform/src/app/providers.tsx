import { PropsWithChildren } from 'react'

export default function Providers({ children }: PropsWithChildren) {
  // Add global providers here (ErrorBoundary, QueryClientProvider, etc.)
  return <>{children}</>
}
