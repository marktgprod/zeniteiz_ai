const STORAGE_KEY = 'zenit-course-progress'

export function getCompletedLessons(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

export function markLessonComplete(lessonId: string): Set<string> {
  const completed = getCompletedLessons()
  completed.add(lessonId)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]))
  } catch {
    // localStorage unavailable (private mode, etc.) — progress just won't persist
  }
  return completed
}
