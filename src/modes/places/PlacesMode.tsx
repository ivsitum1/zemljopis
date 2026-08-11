import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getCountyById } from '../../data/counties'
import { curatedPlaces, getPlaceById, PLACES, type PlaceCard } from '../../data/places'
import type { DifficultyLevel } from '../../types/profile'

type PlacesModeProps = {
  level: DifficultyLevel
  onBack: () => void
}

type View = 'list' | 'card' | 'quiz'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function showAdvanced(level: DifficultyLevel): boolean {
  return level >= 3
}

export function PlacesMode({ level, onBack }: PlacesModeProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const places = useMemo(() => curatedPlaces(), [])
  const advanced = showAdvanced(level)

  const [view, setView] = useState<View>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [quiz, setQuiz] = useState(() => makeQuiz(places, language))

  const active = activeId ? getPlaceById(activeId) : undefined

  function openCard(id: string): void {
    setActiveId(id)
    setView('card')
  }

  function startQuiz(): void {
    setQuiz(makeQuiz(places, language))
    setView('quiz')
  }

  function answerQuiz(placeId: string): void {
    if (quiz.status !== 'asking') {
      return
    }
    const isCorrect = placeId === quiz.target.id
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
    setQuiz((prev) => ({
      ...prev,
      status: isCorrect ? 'correct' : 'wrong',
      pickedId: placeId,
    }))
    window.setTimeout(() => {
      setQuiz(makeQuiz(places, language, quiz.target.id))
    }, isCorrect ? 900 : 1100)
  }

  return (
    <section className="panel mode-panel">
      <div className="mode-toolbar">
        <button
          type="button"
          className="ghost"
          onClick={() => {
            if (view === 'list') {
              onBack()
            } else {
              setView('list')
              setActiveId(null)
            }
          }}
        >
          ← {t('common.back')}
        </button>
        {view === 'quiz' ? (
          <p className="score">{t('places.score', { correct: score.correct, total: score.total })}</p>
        ) : (
          <button type="button" className="ghost compact" onClick={startQuiz}>
            {t('places.quiz')}
          </button>
        )}
      </div>

      <h1>{t('modes.places.title')}</h1>

      {view === 'list' ? (
        <>
          <p className="muted">{t('places.listHint')}</p>
          <div className="place-list">
            {places.map((place) => (
              <button
                key={place.id}
                type="button"
                className="place-row"
                onClick={() => openCard(place.id)}
              >
                <strong>{place.name[language]}</strong>
                <span>{place.region[language]}</span>
              </button>
            ))}
          </div>
          {PLACES.some((place) => !place.curated) ? (
            <p className="muted hint">{t('places.stubNote')}</p>
          ) : null}
        </>
      ) : null}

      {view === 'card' && active ? (
        <PlaceDetail place={active} language={language} showAdvanced={advanced} />
      ) : null}

      {view === 'quiz' ? (
        <div className="stack">
          <p className="prompt">{t('places.quizPrompt')}</p>
          <blockquote className="fact-quote">{quiz.fact[language]}</blockquote>
          {quiz.status === 'correct' ? <p className="feedback ok">{t('places.correct')}</p> : null}
          {quiz.status === 'wrong' ? (
            <p className="feedback bad">
              {t('places.wrong', { name: quiz.target.name[language] })}
            </p>
          ) : null}
          <div className="choice-grid">
            {quiz.choices.map((place) => {
              let className = 'choice'
              if (quiz.status === 'correct' && place.id === quiz.target.id) className += ' correct'
              if (quiz.status === 'wrong' && place.id === quiz.pickedId) className += ' wrong'
              return (
                <button
                  key={place.id}
                  type="button"
                  className={className}
                  disabled={quiz.status !== 'asking'}
                  onClick={() => answerQuiz(place.id)}
                >
                  <strong>{place.name[language]}</strong>
                  <span>{place.region[language]}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function PlaceDetail({
  place,
  language,
  showAdvanced,
}: {
  place: PlaceCard
  language: 'hr' | 'en'
  showAdvanced: boolean
}) {
  const { t } = useTranslation()
  const county = getCountyById(place.countyId)

  return (
    <article className="place-card-detail">
      <p className="eyebrow">{place.region[language]}</p>
      <h2>{place.name[language]}</h2>
      <p className="muted">
        {county ? county.name[language] : place.countyId}
        {!place.curated ? ` · ${t('places.stub')}` : null}
      </p>

      <h3>{t('places.basic')}</h3>
      <ul>
        {place.facts.basic.map((fact) => (
          <li key={fact.hr}>{fact[language]}</li>
        ))}
      </ul>

      {showAdvanced && place.facts.advanced.length > 0 ? (
        <>
          <h3>{t('places.advanced')}</h3>
          <ul>
            {place.facts.advanced.map((fact) => (
              <li key={fact.hr}>{fact[language]}</li>
            ))}
          </ul>
        </>
      ) : null}

      {!showAdvanced && place.facts.advanced.length > 0 ? (
        <p className="muted hint">{t('places.advancedLocked')}</p>
      ) : null}
    </article>
  )
}

type QuizState = {
  target: PlaceCard
  fact: PlaceCard['facts']['basic'][number]
  choices: PlaceCard[]
  status: 'asking' | 'correct' | 'wrong'
  pickedId: string | null
}

function makeQuiz(places: PlaceCard[], _language: 'hr' | 'en', excludeId?: string): QuizState {
  const pool = places.filter((place) => place.facts.basic.length > 0)
  const candidates = pool.filter((place) => place.id !== excludeId)
  const target = (candidates.length > 0 ? candidates : pool)[
    Math.floor(Math.random() * (candidates.length > 0 ? candidates.length : pool.length))
  ]!
  const fact = target.facts.basic[Math.floor(Math.random() * target.facts.basic.length)]!
  const others = shuffle(pool.filter((place) => place.id !== target.id)).slice(0, 3)
  return {
    target,
    fact,
    choices: shuffle([target, ...others]),
    status: 'asking',
    pickedId: null,
  }
}
