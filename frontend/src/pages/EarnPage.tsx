import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Lock, Rocket } from 'lucide-react'
import { api } from '../lib/api'
import { Card, PageHeader, PrimaryButton, SegmentedTabs } from '../components/ui'
import { track } from '../lib/analytics'
import { haptic } from '../lib/haptics'
import { getCompletedLessons, markLessonComplete } from '../lib/courseProgress'
import {
  CASE_STUDIES,
  COURSE_LESSONS,
  MARATHON_DAYS,
  NICHE_GUIDES,
  TOOLKIT_PROMPTS,
  type CourseLesson,
  type EarnMode,
} from '../lib/earnContent'
import { useT } from '../lib/i18n'
import { useUserStore } from '../store/userStore'

type Tab = 'cases' | 'course' | 'toolkit' | 'guide' | 'marathon'

export default function EarnPage() {
  const [tab, setTab] = useState<Tab>('cases')
  const [marathon, setMarathon] = useState<{ started: boolean; currentDay: number } | null>(null)
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [chosenOption, setChosenOption] = useState<Record<string, number>>({})
  const navigate = useNavigate()
  const userId = useUserStore((s) => s.id)
  const lang = useUserStore((s) => s.language)
  const t = useT()

  useEffect(() => {
    if (!userId || tab !== 'marathon') return
    api
      .get(`/api/user/${userId}/marathon`)
      .then((res) => setMarathon({ started: res.data.started, currentDay: res.data.current_day }))
      .catch(() => {})
  }, [userId, tab])

  useEffect(() => {
    setCompletedLessons(getCompletedLessons())
  }, [])

  const handleTry = (mode: EarnMode, prompt: string, id: string) => {
    haptic('light')
    track('earn_toolkit_try', { prompt_id: id, mode })
    navigate('/ai', { state: { mode, prefill: prompt } })
  }

  const handleStartMarathon = async () => {
    if (!userId) return
    haptic('light')
    track('earn_marathon_start')
    const res = await api.post(`/api/user/${userId}/marathon/start`)
    setMarathon({ started: true, currentDay: res.data.current_day })
  }

  const handleAnswer = (lesson: CourseLesson, optionIndex: number) => {
    haptic('light')
    setChosenOption((s) => ({ ...s, [lesson.id]: optionIndex }))
    if (lesson.quizOptions[optionIndex].correct) {
      haptic('success')
      setCompletedLessons(markLessonComplete(lesson.id))
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-5 lg:max-w-3xl lg:px-8 lg:py-8">
      <PageHeader title={t('earn.title')} />
      <p className="-mt-3 mb-4 text-sm text-gray-500 dark:text-gray-400">{t('earn.subtitle')}</p>

      <SegmentedTabs
        options={[
          { id: 'cases', label: t('earn.tabs.cases') },
          { id: 'course', label: t('earn.tabs.course') },
          { id: 'toolkit', label: t('earn.tabs.toolkit') },
          { id: 'guide', label: t('earn.tabs.guide') },
          { id: 'marathon', label: t('earn.tabs.marathon') },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-4 space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        {tab === 'cases' &&
          CASE_STUDIES.map((c) => (
            <Card key={c.id} className="text-left">
              <h2 className="font-semibold">{c.title[lang]}</h2>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{c.steps[lang]}</p>
              <span className="mt-3 inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200">
                {c.price[lang]}
              </span>
            </Card>
          ))}

        {tab === 'course' && (
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">
                {t('earn.course.progress', { done: completedLessons.size, total: COURSE_LESSONS.length })}
              </span>
            </div>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-black transition-all dark:bg-white"
                style={{ width: `${(completedLessons.size / COURSE_LESSONS.length) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {COURSE_LESSONS.map((lesson, i) => {
                const isOpen = expandedLesson === lesson.id
                const isDone = completedLessons.has(lesson.id)
                const chosen = chosenOption[lesson.id]
                const chosenIsCorrect = chosen !== undefined && lesson.quizOptions[chosen].correct

                return (
                  <Card key={lesson.id} className="text-left">
                    <button
                      onClick={() => {
                        haptic('light')
                        setExpandedLesson(isOpen ? null : lesson.id)
                      }}
                      className="flex w-full items-center justify-between gap-2 text-left"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDone
                              ? 'bg-black text-white dark:bg-white dark:text-black'
                              : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400'
                          }`}
                        >
                          {isDone ? <Check size={12} /> : i + 1}
                        </span>
                        <span className="font-semibold">{lesson.title[lang]}</span>
                      </span>
                      <ChevronDown
                        size={16}
                        className={`shrink-0 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isOpen && (
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-600 dark:text-gray-300">{lesson.body[lang]}</p>

                        <div>
                          <p className="text-sm font-medium">{lesson.quizQuestion[lang]}</p>
                          <div className="mt-2 space-y-1.5">
                            {lesson.quizOptions.map((opt, oi) => {
                              const isChosen = chosen === oi
                              return (
                                <button
                                  key={oi}
                                  onClick={() => handleAnswer(lesson, oi)}
                                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                                    isChosen && opt.correct
                                      ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                                      : isChosen && !opt.correct
                                        ? 'border-red-300 bg-red-50 dark:border-red-500/40 dark:bg-red-500/10'
                                        : 'border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/[0.03]'
                                  }`}
                                >
                                  {opt.text[lang]}
                                </button>
                              )
                            })}
                          </div>
                          {chosen !== undefined && !chosenIsCorrect && (
                            <p className="mt-1.5 text-xs text-red-500">{t('earn.course.tryAgain')}</p>
                          )}
                        </div>

                        {lesson.tryPrompt && lesson.tryMode && (
                          <button
                            onClick={() => handleTry(lesson.tryMode!, lesson.tryPrompt![lang], `course-${lesson.id}`)}
                            className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-black"
                          >
                            {t('earn.toolkit.try')}
                            <ArrowRight size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'toolkit' &&
          TOOLKIT_PROMPTS.map((p) => (
            <Card key={p.id} className="text-left">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{p.title[lang]}</h2>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
                  {p.mode === 'image' ? t('nav.images') : t('nav.text')}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{p.description[lang]}</p>
              <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs text-gray-600 dark:bg-white/[0.03] dark:text-gray-300">
                {p.prompt[lang]}
              </p>
              <button
                onClick={() => handleTry(p.mode, p.prompt[lang], p.id)}
                className="mt-3 flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-black"
              >
                {t('earn.toolkit.try')}
                <ArrowRight size={13} />
              </button>
            </Card>
          ))}

        {tab === 'guide' &&
          NICHE_GUIDES.map((g) => (
            <Card key={g.id} className="text-left">
              <h2 className="font-semibold">{g.title[lang]}</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{g.description[lang]}</p>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-white/10 dark:text-gray-200">
                  {g.price[lang]}
                </span>
                {g.platforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </Card>
          ))}

        {tab === 'marathon' && !marathon?.started && (
          <Card className="text-left lg:col-span-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white">
              <Rocket size={18} strokeWidth={2} />
            </div>
            <h2 className="mt-3 font-semibold">{t('earn.marathon.introTitle')}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('earn.marathon.introBody')}</p>
            <PrimaryButton onClick={handleStartMarathon} disabled={!userId} className="mt-4 w-full">
              {t('earn.marathon.start')}
            </PrimaryButton>
          </Card>
        )}

        {tab === 'marathon' &&
          marathon?.started &&
          MARATHON_DAYS.map((d) => {
            const unlocked = d.day <= marathon.currentDay
            const done = d.day < marathon.currentDay
            return (
              <Card key={d.day} className={`text-left ${!unlocked ? 'opacity-50' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">
                    {t('earn.marathon.day', { n: d.day })}: {d.title[lang]}
                  </h2>
                  {done && <Check size={16} className="shrink-0 text-emerald-500" />}
                  {!unlocked && <Lock size={14} className="shrink-0 text-gray-400" />}
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{d.task[lang]}</p>
                {unlocked && d.prompt && d.mode && (
                  <button
                    onClick={() => handleTry(d.mode!, d.prompt![lang], `marathon-day-${d.day}`)}
                    className="mt-3 flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-black"
                  >
                    {t('earn.toolkit.try')}
                    <ArrowRight size={13} />
                  </button>
                )}
              </Card>
            )
          })}
      </div>
    </div>
  )
}
