import { api } from './api'
import { WebApp } from './telegram'

function proxiedUrl(url: string, fileName: string): string {
  const base = api.defaults.baseURL ?? ''
  return `${base}/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(fileName)}`
}

function extensionFromContentType(contentType: string | null): string | null {
  if (!contentType) return null
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
  }
  return map[contentType.split(';')[0].trim()] ?? null
}

async function fallbackBlobDownload(url: string, fileName: string) {
  const res = await fetch(url)
  const blob = await res.blob()
  const ext = extensionFromContentType(res.headers.get('content-type'))
  const finalName = ext && !fileName.endsWith(`.${ext}`) ? `${fileName}.${ext}` : fileName

  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = finalName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(blobUrl)
}

export function downloadFile(url: string, fileName: string) {
  const proxied = proxiedUrl(url, fileName)

  if (WebApp && typeof WebApp.downloadFile === 'function') {
    WebApp.downloadFile({ url: proxied, file_name: fileName }, (isAccepted) => {
      if (!isAccepted) return
    })
    return
  }

  fallbackBlobDownload(proxied, fileName).catch(() => {
    window.open(url, '_blank')
  })
}
