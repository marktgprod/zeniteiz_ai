import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageHeader, SegmentedTabs } from '../components/ui'
import { useT } from '../lib/i18n'
import TextPage from './TextPage'
import ImagesPage from './ImagesPage'
import VideoPage from './VideoPage'

type Mode = 'text' | 'image' | 'video'

interface AiNavState {
  mode?: Mode
  prefill?: string
}

export default function AiPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = (location.state as AiNavState | null) ?? null
  const [mode, setMode] = useState<Mode>(navState?.mode ?? 'text')
  const [prefill] = useState<string | undefined>(navState?.prefill)
  const t = useT()

  const titleKey = mode === 'text' ? 'text.title' : mode === 'image' ? 'images.title' : 'video.title'

  const handleModeChange = (id: Mode) => {
    setMode(id)
    if (navState) navigate(location.pathname, { replace: true, state: null })
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t(titleKey)} />

      <SegmentedTabs
        options={[
          { id: 'text', label: t('nav.text') },
          { id: 'image', label: t('nav.images') },
          { id: 'video', label: t('nav.video') },
        ]}
        value={mode}
        onChange={handleModeChange}
      />

      <div className="mt-3 flex-1">
        {mode === 'text' && <TextPage initialPrompt={mode === navState?.mode ? prefill : undefined} />}
        {mode === 'image' && <ImagesPage initialPrompt={mode === navState?.mode ? prefill : undefined} />}
        {mode === 'video' && <VideoPage initialPrompt={mode === navState?.mode ? prefill : undefined} />}
      </div>
    </div>
  )
}
