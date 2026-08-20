import { Component, type ReactNode } from 'react'
import { translate } from '../lib/i18n'
import { useUserStore } from '../store/userStore'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      const lang = useUserStore.getState().language
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-3 bg-white p-6 text-center text-gray-900 dark:bg-black dark:text-gray-100">
          <p className="text-sm font-medium">{translate(lang, 'errorBoundary.title')}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{translate(lang, 'errorBoundary.body')}</p>
        </div>
      )
    }
    return this.props.children
  }
}
