import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createDeckCursor, type RoundLimit } from './deck'
import type { Choice, DeckItem, ModeContentAdapter, ModeContext } from './types'

export type MultiplayerQuizViewProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
}

const PLAYER_COLORS = ['#4f46e5', '#0ea5a4', '#e11d48', '#f59e0b', '#8b5cf6', '#10b981'] as const
const MIN_PLAYERS = 2
const MAX_PLAYERS = 6

type Player = { name: string; color: string; score: number }
type Phase = 'setup' | 'playing' | 'done'
type AskStatus = 'asking' | 'correct' | 'wrong'

function playerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length]!
}

function defaultName(index: number, t: (key: string, opts?: Record<string, unknown>) => string): string {
  return t('learning.playerN', { n: index + 1 })
}

function parseRoundLimit(raw: string): RoundLimit {
  if (raw === 'endless') return 'endless'
  if (raw === '5') return 5
  if (raw === '10') return 10
  if (raw === '15') return 15
  return 10
}

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

function totalTurnsAllowed(playerCount: number, roundLimit: RoundLimit): number | null {
  if (roundLimit === 'endless') return null
  return playerCount * roundLimit
}

export function MultiplayerQuizView({ adapter, ctx, onBack }: MultiplayerQuizViewProps) {
  const { t } = useTranslation()

  const [phase, setPhase] = useState<Phase>('setup')
  const [roundLimit, setRoundLimit] = useState<RoundLimit>(10)
  const [setupNames, setSetupNames] = useState<string[]>(() => [
    defaultName(0, t),
    defaultName(1, t),
  ])
  const [setupError, setSetupError] = useState<string | null>(null)

  const [players, setPlayers] = useState<Player[]>([])
  const [turn, setTurn] = useState(0)
  const [deck, setDeck] = useState<DeckItem[]>([])
  const [cursor, setCursor] = useState<ReturnType<typeof createDeckCursor<DeckItem>> | null>(null)
  const [item, setItem] = useState<DeckItem | undefined>()
  const [choices, setChoices] = useState<Choice[]>([])
  const [status, setStatus] = useState<AskStatus>('asking')
  const [picked, setPicked] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [awaitingPass, setAwaitingPass] = useState(false)

  const currentIndex = players.length === 0 ? 0 : turn % players.length
  const currentPlayer = players[currentIndex]
  const answeredTurns = turn
  const maxTurns = totalTurnsAllowed(players.length, roundLimit)

  function addPlayer(): void {
    if (setupNames.length >= MAX_PLAYERS) return
    setSetupNames((prev) => [...prev, defaultName(prev.length, t)])
    setSetupError(null)
  }

  function removePlayer(index: number): void {
    if (setupNames.length <= MIN_PLAYERS) return
    setSetupNames((prev) => prev.filter((_, i) => i !== index))
    setSetupError(null)
  }

  function updateName(index: number, value: string): void {
    setSetupNames((prev) => prev.map((name, i) => (i === index ? value : name)))
    setSetupError(null)
  }

  function drawNext(
    nextCursor: ReturnType<typeof createDeckCursor<DeckItem>>,
    nextDeck: DeckItem[],
  ): DeckItem | undefined {
    let next = nextCursor.draw()
    if (!next) {
      nextCursor.reset()
      next = nextCursor.draw()
    }
    if (next) {
      setItem(next)
      setChoices(adapter.buildChoices(next, nextDeck, ctx))
      setStatus('asking')
      setPicked(null)
      setHintShown(false)
      setAwaitingPass(false)
    }
    return next
  }

  function startGame(): void {
    if (setupNames.length < MIN_PLAYERS || setupNames.length > MAX_PLAYERS) {
      setSetupError(t('learning.needPlayers', { min: MIN_PLAYERS, max: MAX_PLAYERS }))
      return
    }

    const named = setupNames.map((raw, i) => {
      const trimmed = raw.trim()
      return {
        name: trimmed || defaultName(i, t),
        color: playerColor(i),
        score: 0,
      }
    })

    const built = adapter.buildDeck(ctx)
    const nextCursor = createDeckCursor(built)
    const first = drawNext(nextCursor, built)

    setPlayers(named)
    setDeck(built)
    setCursor(nextCursor)
    setTurn(0)

    if (built.length === 0 || !first) {
      setItem(undefined)
      setChoices([])
      setPhase('done')
      return
    }

    setPhase('playing')
  }

  function finishSession(): void {
    setAwaitingPass(false)
    setPhase('done')
  }

  function advanceToNextQuestion(): void {
    if (maxTurns !== null && turn >= maxTurns) {
      finishSession()
      return
    }

    if (!cursor) {
      finishSession()
      return
    }

    const next = drawNext(cursor, deck)
    if (!next) {
      setItem(undefined)
      setChoices([])
      finishSession()
    }
  }

  function handlePick(choiceId: string): void {
    if (phase !== 'playing' || status !== 'asking' || !item || awaitingPass) return

    const choice = choices.find((c) => c.id === choiceId)
    const correct = choice?.correct ?? false

    // Session-only scores — never write long-term progress in multiplayer.
    if (correct) {
      setPlayers((prev) =>
        prev.map((p, i) => (i === currentIndex ? { ...p, score: p.score + 1 } : p)),
      )
    }

    const nextTurn = turn + 1
    setTurn(nextTurn)
    setPicked(choiceId)
    setStatus(correct ? 'correct' : 'wrong')

    if (maxTurns !== null && nextTurn >= maxTurns) {
      setAwaitingPass(false)
      setPhase('done')
      return
    }

    setAwaitingPass(true)
  }

  function continueAfterPass(): void {
    if (!awaitingPass) return
    advanceToNextQuestion()
  }

  function restartSamePlayers(): void {
    const resetPlayers = players.map((p) => ({ ...p, score: 0 }))
    const built = adapter.buildDeck(ctx)
    const nextCursor = createDeckCursor(built)
    setPlayers(resetPlayers)
    setDeck(built)
    setCursor(nextCursor)
    setTurn(0)

    const first = drawNext(nextCursor, built)
    if (built.length === 0 || !first) {
      setItem(undefined)
      setChoices([])
      setPhase('done')
      return
    }
    setPhase('playing')
  }

  function backToSetup(): void {
    setPhase('setup')
    setAwaitingPass(false)
    setPicked(null)
    setHintShown(false)
  }

  const hintText = item ? hintFromPayload(item, ctx.language) : null
  const ranked = [...players].sort((a, b) => b.score - a.score)
  const topScore = ranked[0]?.score ?? 0
  const winners = ranked.filter((p) => p.score === topScore)
  const currentRound =
    players.length === 0 ? 1 : Math.floor(answeredTurns / players.length) + 1

  if (phase === 'setup') {
    return (
      <section className="panel mode-panel learning-view learning-multi">
        <div className="mode-toolbar">
          <button type="button" onClick={onBack} className="ghost">
            ← {t('common.back')}
          </button>
        </div>

        <h1>{t('learning.multiplayer')}</h1>
        <p className="muted">{t('learning.multiplayerHint')}</p>

        <div className="learning-rounds field">
          <label htmlFor="mp-round-limit">{t('learning.rounds')}</label>
          <select
            id="mp-round-limit"
            value={String(roundLimit)}
            onChange={(event) => setRoundLimit(parseRoundLimit(event.target.value))}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="endless">{t('learning.roundsEndless')}</option>
          </select>
          <p className="muted learning-rounds-hint">{t('learning.roundsPerPlayer')}</p>
        </div>

        <div className="learning-player-setup stack">
          <h2 className="learning-subhead">{t('learning.playerNames')}</h2>
          {setupNames.map((name, index) => (
            <div key={index} className="learning-player-row">
              <span
                className="learning-pdot"
                style={{ background: playerColor(index) }}
                aria-hidden
              />
              <input
                type="text"
                maxLength={14}
                value={name}
                aria-label={t('learning.playerN', { n: index + 1 })}
                onChange={(event) => updateName(index, event.target.value)}
              />
              {setupNames.length > MIN_PLAYERS ? (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => removePlayer(index)}
                  aria-label={t('learning.removePlayer')}
                >
                  ×
                </button>
              ) : null}
            </div>
          ))}

          {setupNames.length < MAX_PLAYERS ? (
            <button type="button" className="ghost" onClick={addPlayer}>
              {t('learning.addPlayer')}
            </button>
          ) : null}

          {setupError ? <p className="feedback bad">{setupError}</p> : null}

          <button type="button" className="primary" onClick={startGame}>
            {t('learning.startGame')}
          </button>
        </div>
      </section>
    )
  }

  if (phase === 'done') {
    return (
      <section className="panel mode-panel learning-view learning-multi">
        <div className="mode-toolbar">
          <button type="button" onClick={onBack} className="ghost">
            ← {t('common.back')}
          </button>
        </div>

        <h1>{t('learning.sessionDone')}</h1>

        {deck.length === 0 ? (
          <p className="muted">{t('learning.emptyDeck')}</p>
        ) : (
          <div className="stack learning-summary">
            <p className="prompt">
              {winners.length > 1
                ? t('learning.tie')
                : t('learning.winner', { name: winners[0]?.name ?? '' })}
            </p>

            <ol className="learning-medal-list">
              {ranked.map((player, index) => {
                const medalKey =
                  index === 0
                    ? 'learning.medalGold'
                    : index === 1
                      ? 'learning.medalSilver'
                      : index === 2
                        ? 'learning.medalBronze'
                        : null
                const origIndex = players.findIndex(
                  (p) => p.name === player.name && p.color === player.color,
                )
                return (
                  <li
                    key={`${player.name}-${player.color}-${index}`}
                    className={
                      player.score === topScore ? 'learning-medal-row win' : 'learning-medal-row'
                    }
                  >
                    <span className="learning-medal" aria-hidden>
                      {medalKey ? t(medalKey) : `${index + 1}.`}
                    </span>
                    <span
                      className="learning-pdot"
                      style={{ background: playerColor(origIndex >= 0 ? origIndex : index) }}
                      aria-hidden
                    />
                    <span className="learning-medal-name">{player.name}</span>
                    <span className="learning-medal-score">{player.score}</span>
                  </li>
                )
              })}
            </ol>

            <div className="learning-actions">
              <button type="button" className="primary" onClick={restartSamePlayers}>
                {t('learning.again')}
              </button>
              <button type="button" className="ghost" onClick={backToSetup}>
                {t('learning.newSetup')}
              </button>
            </div>
          </div>
        )}
      </section>
    )
  }

  // phase === 'playing'
  return (
    <section className="panel mode-panel learning-view learning-multi">
      <div className="mode-toolbar">
        <button type="button" onClick={onBack} className="ghost">
          ← {t('common.back')}
        </button>
        {roundLimit !== 'endless' ? (
          <p className="score">
            {t('learning.roundOf', {
              current: Math.min(currentRound, roundLimit),
              total: roundLimit,
            })}
          </p>
        ) : null}
      </div>

      <h1>{t('learning.multiplayer')}</h1>

      <div className="learning-scoreboard" role="list">
        {players.map((player, index) => (
          <span
            key={`${player.color}-${player.name}`}
            role="listitem"
            className={
              index === currentIndex
                ? 'learning-score-chip active'
                : 'learning-score-chip'
            }
            style={{ ['--pc' as string]: player.color }}
          >
            <span className="learning-pdot" style={{ background: player.color }} aria-hidden />
            {player.name} <b>{player.score}</b>
          </span>
        ))}
      </div>

      {currentPlayer ? (
        <p className="learning-turn-banner">
          <span
            className="learning-pdot"
            style={{ background: currentPlayer.color }}
            aria-hidden
          />
          {t('learning.turn')} <strong>{currentPlayer.name}</strong>
        </p>
      ) : null}

      {awaitingPass && currentPlayer ? (
        <div className="stack learning-pass-device">
          {status === 'correct' ? (
            <p className="feedback ok">{t('learning.correct')}</p>
          ) : null}
          {status === 'wrong' ? (
            <p className="feedback bad">{t('learning.wrong')}</p>
          ) : null}
          <p className="prompt">
            {t('learning.passDevice', { name: currentPlayer.name })}
          </p>
          <button type="button" className="primary" onClick={continueAfterPass}>
            {t('learning.continue')}
          </button>
        </div>
      ) : null}

      {!awaitingPass && item ? (
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
