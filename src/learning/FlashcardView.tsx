import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { recordAnswer } from '../storage/progress'
import { createDeckCursor } from './deck'
import type { DeckItem, ModeContentAdapter, ModeContext } from './types'

export type FlashcardViewProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
}

type SessionStats = { knew: number; total: number }

function drawInitial(cursor: ReturnType<typeof createDeckCursor<DeckItem>>): DeckItem | undefined {
  return cursor.draw()
}

export function FlashcardView({ adapter, ctx, onBack }: FlashcardViewProps) {
  const { t } = useTranslation()
  const [deck] = useState(() => adapter.buildDeck(ctx))
  const [cursor] = useState(() => createDeckCursor(deck))
  const [item, setItem] = useState<DeckItem | undefined>(() => drawInitial(cursor))
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState<SessionStats>({ knew: 0, total: 0 })
  const [phase, setPhase] = useState<'card' | 'summary'>(() =>
    deck.length === 0 ? 'summary' : 'card',
  )

  function grade(knew: boolean): void {
    if (!item) return

    recordAnswer({
      profileName: ctx.profileName,
      mode: adapter.modeId,
      entityId: item.entityId,
      correct: knew,
      tags: item.tags,
    })

    const nextStats = {
      knew: stats.knew + (knew ? 1 : 0),
      total: stats.total + 1,
    }
    setStats(nextStats)

    const next = cursor.draw()
    if (!next) {
      setItem(undefined)
      setFlipped(false)
      setPhase('summary')
      return
    }

    setItem(next)
    setFlipped(false)
  }

  function reshuffle(): void {
    cursor.reset()
    const next = cursor.draw()
    setStats({ knew: 0, total: 0 })
    setFlipped(false)
    if (!next) {
      setItem(undefined)
      setPhase('summary')
      return
    }
    setItem(next)
    setPhase('card')
  }

  return (
    <section className="panel mode-panel learning-view">
      <div className="mode-toolbar">
        <button type="button" onClick={onBack} className="ghost">
          ← {t('common.back')}
        </button>
        <p className="score">
          {t('learning.score', { correct: stats.knew, total: stats.total })}
        </p>
      </div>

      <h1>{t('learning.flashcards')}</h1>

      {phase === 'summary' ? (
        <div className="stack learning-summary">
          {deck.length === 0 ? (
            <p className="muted">{t('learning.emptyDeck')}</p>
          ) : (
            <>
              <p className="prompt">{t('learning.summary')}</p>
              <p className="muted">
                {t('learning.summaryDetail', { knew: stats.knew, total: stats.total })}
              </p>
            </>
          )}
          {deck.length > 0 ? (
            <button type="button" className="primary" onClick={reshuffle}>
              {t('learning.reshuffle')}
            </button>
          ) : null}
        </div>
      ) : item ? (
        <div className="stack learning-card">
          <div className="learning-card-face">
            {flipped ? adapter.renderDetail(item, ctx) : adapter.renderPrompt(item, ctx)}
          </div>

          {!flipped ? (
            <button type="button" className="primary" onClick={() => setFlipped(true)}>
              {t('learning.flip')}
            </button>
          ) : (
            <div className="learning-actions">
              <button type="button" className="primary" onClick={() => grade(true)}>
                {t('learning.knew')}
              </button>
              <button type="button" className="ghost" onClick={() => grade(false)}>
                {t('learning.didNotKnow')}
              </button>
            </div>
          )}
        </div>
      ) : null}
    </section>
  )
}
