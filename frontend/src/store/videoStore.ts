import { create } from 'zustand'
import axios from 'axios'
import { api } from '../lib/api'
import { haptic } from '../lib/haptics'

const POLL_INTERVAL_MS = 4000

type VideoStatus = 'idle' | 'pending' | 'completed' | 'error'

interface VideoState {
  status: VideoStatus
  videoUrl: string | null
  error: string | null
  start: (userId: string, prompt: string) => Promise<void>
  reset: () => void
}

let pollTimer: ReturnType<typeof setTimeout> | null = null

function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

function pollStatus(requestId: string, set: (partial: Partial<VideoState>) => void) {
  pollTimer = setTimeout(async () => {
    try {
      const res = await api.get(`/api/video/status/${requestId}`)
      if (res.data.status === 'completed') {
        set({ status: 'completed', videoUrl: res.data.video_url })
        haptic('success')
      } else {
        pollStatus(requestId, set)
      }
    } catch (err) {
      set({
        status: 'error',
        error:
          axios.isAxiosError(err) && err.response?.data?.detail
            ? err.response.data.detail
            : 'Не удалось получить статус генерации.',
      })
      haptic('error')
    }
  }, POLL_INTERVAL_MS)
}

export const useVideoStore = create<VideoState>((set) => ({
  status: 'idle',
  videoUrl: null,
  error: null,

  start: async (userId, prompt) => {
    stopPolling()
    set({ status: 'pending', error: null, videoUrl: null })

    try {
      const res = await api.post('/api/video/runway', { user_id: userId, prompt })
      pollStatus(res.data.request_id, set)
    } catch (err) {
      let message = 'Не удалось отправить запрос. Проверьте, что backend запущен.'
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        message = err.response.data.detail
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        message = 'Дневной лимит запросов исчерпан. Лимит обновится завтра.'
      }
      set({ status: 'error', error: message })
      haptic('error')
    }
  },

  reset: () => {
    stopPolling()
    set({ status: 'idle', videoUrl: null, error: null })
  },
}))
