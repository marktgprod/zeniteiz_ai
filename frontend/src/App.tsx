import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import AiPage from './pages/AiPage'
import EarnPage from './pages/EarnPage'
import PromptsPage from './pages/PromptsPage'
import NewsPage from './pages/NewsPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'
import AnalyticsPage from './pages/AnalyticsPage'
import ErrorBoundary from './components/ErrorBoundary'
import { loginIfInTelegram } from './lib/auth'

export default function App() {
  useEffect(() => {
    loginIfInTelegram()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="ai" element={<AiPage />} />
            <Route path="text" element={<Navigate to="/ai" replace />} />
            <Route path="images" element={<Navigate to="/ai" replace />} />
            <Route path="video" element={<Navigate to="/ai" replace />} />
            <Route path="earn" element={<EarnPage />} />
            <Route path="prompts" element={<PromptsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
