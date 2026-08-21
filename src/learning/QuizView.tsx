import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { recordAnswer } from '../storage/progress'
import { createDeckCursor, shouldEndSession, type RoundLimit } from './deck'
import type { Choice, DeckItem, ModeContentAdapter, ModeContext } from './types'

export type QuizViewProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
  roundLimit: RoundLimit
  onRoundLimitChange?: (n: RoundLimit) => void
}

// Encyclopedia UI lives in Task 11 (EncyclopediaView); this view is solo quiz only.

type Score = { correct: number; total: number }

function hintFromPayload(item: DeckItem, language: 'hr' | 'en'): string | null {
  const payload = item.payload
  if (typeof payload === 'string' && payload.trim()) return payload

  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>

  for (const key of ['hint', 'fact', 'detail'] as const) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value
    if (
      value &&
      typeof value === 'object' &&
      language in value &&
      typeof (value as Record<string, unknown>)[language] === 'string'
    ) {
      return (value as Record<string, string>)[language]
    }
  }

  return null
}

function parseRoundLimit(raw: string): RoundLimit {
  if (raw === 'endless') return 'endless'
  if (raw === '5') return 5
  if (raw === '10') return 10
  if (raw === '15') return 15
  return 10
}

export function QuizView({
  adapter,
  ctx,
  onBack,
  roundLimit,
  onRoundLimitChange,
}: QuizViewProps) {
  const { t } = useTranslation()
  const advanceTimerRef = useRef<number | null>(null)
  const [boot] = useState(() => {
    const built = adapter.buildDeck(ctx)
    const cursor = createDeckCursor(built)
    const first = cursor.draw()
    return {
      deck: built,
      cursor,
      first,
      choices: first ? adapter.buildChoices(first, built, ctx) : ([] as Choice[]),
    }
  })
  const { deck, cursor } = boot
  const [item, setItem] = useState<DeckItem | undefined>(boot.first)
  const [choices, setChoices] = useState<Choice[]>(boot.choices)
  const [score, setScore] = useState<Score>({ correct: 0, total: 0 })
  const [answered, setAnswered] = useState(0)
  const [status, setStatus] = useState<'asking' | 'correct' | 'wrong' | 'done'>(() =>
    boot.deck.length === 0 || !boot.first ? 'done' : 'asking',
  )
  const [picked, setPicked] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)

  function clearAdvanceTimer(): void {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current)
        advanceTimerRef.current = null
      }
    }
  }, [])

  function advanceAfterAnswer(nextAnswered: number): void {
    advanceTimerRef.current = null

    if (shouldEndSession(nextAnswered, roundLimit)) {
      setStatus('done')
      return
    }

    let next = cursor.draw()
    if (!next) {
      cursor.reset()
      next = cursor.draw()
    }

    if (!next) {
      setItem(undefined)
      setChoices([])
      setStatus('done')
      return
    }

    setItem(next)
    setChoices(adapter.buildChoices(next, deck, ctx))
    setStatus('asking')
    setPicked(null)
    setHintShown(false)
  }

  function handlePick(choiceId: string): void {
    if (status !== 'asking' || !item) return

    const choice = choices.find((c) => c.id === choiceId)
    const correct = choice?.correct ?? false

    recordAnswer({
      profileName: ctx.profileName,
      mode: adapter.modeId,
      entityId: item.entityId,
      correct,
      tags: item.tags,
    })

    const nextAnswered = answered + 1
    setAnswered(nextAnswered)
    setPicked(choiceId)
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }))
    setStatus(correct ? 'correct' : 'wrong')

    clearAdvanceTimer()
    advanceTimerRef.current = window.setTimeout(() => {
      advanceAfterAnswer(nextAnswered)
    }, 850)
  }

  function restart(): void {
    clearAdvanceTimer()
    cursor.reset()
    const next = cursor.draw()
    setScore({ correct: 0, total: 0 })
    setAnswered(0)
    setPicked(null)
    setHintShown(false)
    if (!next) {
      setItem(undefined)
      setChoices([])
      setStatus('done')
      return
    }
    setItem(next)
    setChoices(adapter.buildChoices(next, deck, ctx))
    setStatus('asking')
  }

  const hintText = item ? hintFromPayload(item, ctx.language) : null

  return (
    <section className="panel mode-panel learning-view">
      <div className="mode-toolbar">
        <button type="button" onClick={onBack} className="ghost">
          ← {t('common.back')}
        </button>
        <p className="score">
          {t('learning.score', { correct: score.correct, total: score.total })}
        </p>
      </div>

      <h1>{t('learning.quiz')}</h1>

      <div className="learning-rounds field">
        <label htmlFor="learning-round-limit">{t('learning.rounds')}</label>
        <select
          id="learning-round-limit"
          value={String(roundLimit)}
          disabled={!onRoundLimitChange}
          onChange={(event) => {
            onRoundLimitChange?.(parseRoundLimit(event.target.value))
          }}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="endless">{t('learning.roundsEndless')}</option>
        </select>
      </div>

      {status === 'done' ? (
        <div className="stack learning-summary">
          {deck.length === 0 ? (
            <p className="muted">{t('learning.emptyDeck')}</p>
          ) : (
            <>
              <p className="prompt">{t('learning.sessionDone')}</p>
              <p className="muted">
                {t('learning.score', { correct: score.correct, total: score.total })}
              </p>
              <button type="button" className="primary" onClick={restart}>
                {t('learning.again')}
              </button>
            </>
          )}
        </div>
      ) : item ? (
        <div className="stack learning-quiz">
          <div className="learning-card-face">{adapter.renderPrompt(item, ctx)}</div>

          {status === 'correct' ? (
            <p className="feedback ok">{t('learning.correct')}</p>
          ) : null}
          {status === 'wrong' ? (
            <p className="feedback bad">{t('learning.wrong')}</p>
          ) : null}

          {adapter.renderChoices ? (
            adapter.renderChoices(item, choices, ctx, {
              onPick: handlePick,
              status,
              picked,
            })
          ) : (
            <div className="choice-grid">
              {choices.map((choice) => {
                let className = 'choice'
                if (status === 'correct' && choice.correct) className += ' correct'
                if (status === 'wrong' && picked === choice.id) className += ' wrong'
                if (status === 'wrong' && choice.correct) className += ' correct'
                return (
                  <button
                    key={choice.id}
                    type="button"
                    className={className}
                    disabled={status !== 'asking'}
                    onClick={() => handlePick(choice.id)}
                  >
                    {choice.label}
                  </button>
                )
              })}
            </div>
          )}

          <div className="learning-hint-row">
            <button
              type="button"
              className="ghost"
              disabled={hintShown || status !== 'asking'}
              onClick={() => setHintShown(true)}
            >
              {t('learning.hint')}
            </button>
            {hintShown ? (
              <div className="muted hint learning-hint-panel">
                {hintText ?? adapter.renderDetail(item, ctx)}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}
