import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'

const MapPage = lazy(() => import('@pages/MapPage/MapPage'))
const ThankYouPage = lazy(() => import('@pages/ThankYouPage/ThankYouPage'))

export const router = createBrowserRouter([
  { path: '/', element:
      <Suspense fallback={<div>Loading…</div>}>
        <MapPage />
      </Suspense>
  },
  { path: '/thank-you', element:
      <Suspense fallback={<div>Loading…</div>}>
        <ThankYouPage />
      </Suspense>
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
