import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import TextPage from './pages/TextPage'
import ImagesPage from './pages/ImagesPage'
import VideoPage from './pages/VideoPage'
import PromptsPage from './pages/PromptsPage'
import NewsPage from './pages/NewsPage'
import CommunityPage from './pages/CommunityPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="text" element={<TextPage />} />
          <Route path="images" element={<ImagesPage />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="prompts" element={<PromptsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
