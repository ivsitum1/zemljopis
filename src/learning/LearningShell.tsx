import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RoundLimit } from './deck'
import { EncyclopediaView } from './EncyclopediaView'
import { FlashcardView } from './FlashcardView'
import { MultiplayerQuizView } from './MultiplayerQuizView'
import { QuizView } from './QuizView'
import { loadLearningStyle, saveLearningStyle } from './stylePreference'
import type { LearningStyle, ModeContentAdapter, ModeContext } from './types'

export type LearningShellProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
}

type QuizEntry = 'solo' | 'multiplayer'

const STYLE_OPTIONS: ReadonlyArray<{ id: LearningStyle; labelKey: string; hintKey: string }> = [
  { id: 'flashcards', labelKey: 'learning.flashcards', hintKey: 'learning.styleHint.flashcards' },
  { id: 'quiz', labelKey: 'learning.quiz', hintKey: 'learning.styleHint.quiz' },
  {
    id: 'encyclopedia',
    labelKey: 'learning.encyclopedia',
    hintKey: 'learning.styleHint.encyclopedia',
  },
]

export function LearningShell({ adapter, ctx, onBack }: LearningShellProps) {
  const { t } = useTranslation()
  const [style, setStyle] = useState<LearningStyle | null>(() =>
    loadLearningStyle(adapter.modeId),
  )
  const [quizEntry, setQuizEntry] = useState<QuizEntry | null>(null)
  const [roundLimit, setRoundLimit] = useState<RoundLimit>(10)

  function chooseStyle(next: LearningStyle): void {
    saveLearningStyle(adapter.modeId, next)
    setStyle(next)
    setQuizEntry(null)
  }

  function backToPicker(): void {
    setStyle(null)
    setQuizEntry(null)
  }

  function backToQuizEntry(): void {
    setQuizEntry(null)
  }

  if (style === 'flashcards') {
    return <FlashcardView adapter={adapter} ctx={ctx} onBack={backToPicker} />
  }

  if (style === 'quiz' && quizEntry === 'solo') {
    return (
      <QuizView
        adapter={adapter}
        ctx={ctx}
        onBack={backToQuizEntry}
        roundLimit={roundLimit}
        onRoundLimitChange={setRoundLimit}
      />
    )
  }

  if (style === 'quiz' && quizEntry === 'multiplayer') {
    return <MultiplayerQuizView adapter={adapter} ctx={ctx} onBack={backToQuizEntry} />
  }

  if (style === 'quiz') {
    return (
      <section className="panel mode-panel learning-shell">
        <div className="mode-toolbar">
          <button type="button" onClick={backToPicker} className="ghost">
            ← {t('common.back')}
          </button>
        </div>

        <h1>{t('learning.quiz')}</h1>
        <p className="muted">{t('learning.chooseQuizMode')}</p>

        <div className="learning-style-grid">
          <button
            type="button"
            className="mode-card learning-style-card"
            onClick={() => setQuizEntry('solo')}
          >
            <span className="mode-card-text">
              <strong>{t('learning.solo')}</strong>
              <span>{t('learning.soloHint')}</span>
            </span>
          </button>
          <button
            type="button"
            className="mode-card learning-style-card"
            onClick={() => setQuizEntry('multiplayer')}
          >
            <span className="mode-card-text">
              <strong>{t('learning.multiplayer')}</strong>
              <span>{t('learning.multiplayerHint')}</span>
            </span>
          </button>
        </div>
      </section>
    )
  }

  if (style === 'encyclopedia') {
    return <EncyclopediaView adapter={adapter} ctx={ctx} onBack={backToPicker} />
  }

  return (
    <section className="panel mode-panel learning-shell">
      <div className="mode-toolbar">
        <button type="button" onClick={onBack} className="ghost">
          ← {t('common.back')}
        </button>
      </div>

      <h1>{t(`modes.${adapter.modeId}.title`)}</h1>
      <p className="muted">{t('learning.chooseStyle')}</p>

      <div className="learning-style-grid">
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="mode-card learning-style-card"
            onClick={() => chooseStyle(option.id)}
          >
            <span className="mode-card-text">
              <strong>{t(option.labelKey)}</strong>
              <span>{t(option.hintKey)}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
