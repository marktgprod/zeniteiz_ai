import { create } from 'zustand'
import axios from 'axios'
import { api } from '../lib/api'
import { haptic } from '../lib/haptics'
import { translate } from '../lib/i18n'
import { useUserStore } from '../store/userStore'

// DALL-E 3 temporarily removed from selection (no OpenAI key configured yet) —
// re-add the entry to bring the model tab back, ImagesPage shows tabs automatically once there's more than one.
export const IMAGE_MODELS = [{ id: 'flux', label: 'Flux.1 Pro', endpoint: '/api/image/flux' }] as const

export type ImageModelId = (typeof IMAGE_MODELS)[number]['id']

interface ImagesState {
  model: ImageModelId
  images: string[]
  pending: boolean
  error: string | null
  comingSoon: string | null
  setModel: (id: ImageModelId) => void
  generate: (userId: string, prompt: string) => Promise<void>
}

export const useImagesStore = create<ImagesState>((set, get) => ({
  model: 'flux',
  images: [],
  pending: false,
  error: null,
  comingSoon: null,

  setModel: (id) => set({ model: id }),

  generate: async (userId, prompt) => {
    const model = IMAGE_MODELS.find((m) => m.id === get().model)!
    set({ pending: true, error: null, comingSoon: null })

    try {
      const res = await api.post(model.endpoint, { user_id: userId, prompt, size: '1024x1024', count: 1 })
      set((s) => ({ images: [...(res.data.images ?? []), ...s.images], pending: false }))
      haptic('success')
    } catch (err) {
      const lang = useUserStore.getState().language
      let error: string | null = null
      let comingSoon: string | null = null

      if (axios.isAxiosError(err) && err.response?.status === 403) {
        error = translate(lang, 'error.imageTierRequired')
      } else if (axios.isAxiosError(err) && err.response?.status === 429) {
        error = translate(lang, 'error.dailyLimit')
      } else if (axios.isAxiosError(err) && err.response?.status === 501) {
        comingSoon = err.response.data?.detail ?? translate(lang, 'error.notModelAvailable')
      } else if (axios.isAxiosError(err) && err.response?.data?.detail) {
        error = err.response.data.detail
      } else {
        error = translate(lang, 'error.generic')
      }

      set({ pending: false, error, comingSoon })
      haptic(comingSoon ? 'warning' : 'error')
    }
  },
}))
