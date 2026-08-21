import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { EncyclopediaEntry, ModeContentAdapter, ModeContext } from './types'

export type EncyclopediaViewProps = {
  adapter: ModeContentAdapter
  ctx: ModeContext
  onBack: () => void
}

function normalizeQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

function matchesQuery(entry: EncyclopediaEntry, query: string): boolean {
  if (!query) return true
  return normalizeQuery(entry.searchText).includes(query)
}

export function EncyclopediaView({ adapter, ctx, onBack }: EncyclopediaViewProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const index = useMemo(() => adapter.encyclopediaIndex(ctx), [adapter, ctx])

  const filtered = useMemo(() => {
    const q = normalizeQuery(query.trim())
    return index.filter((entry) => matchesQuery(entry, q))
  }, [index, query])

  const selected = selectedId ? index.find((entry) => entry.id === selectedId) : undefined

  function openEntry(id: string): void {
    setSelectedId(id)
  }

  function backToList(): void {
    setSelectedId(null)
  }

  if (selected) {
    return (
      <section className="panel mode-panel learning-view learning-encyclopedia">
        <div className="mode-toolbar">
          <button type="button" onClick={backToList} className="ghost">
            ← {t('common.back')}
          </button>
        </div>

        <h1>{t('learning.encyclopedia')}</h1>
        <div className="learning-encyclopedia-detail">
          {adapter.renderEncyclopediaDetail(selected.id, ctx)}
        </div>
      </section>
    )
  }

  return (
    <section className="panel mode-panel learning-view learning-encyclopedia">
      <div className="mode-toolbar">
        <button type="button" onClick={onBack} className="ghost">
          ← {t('common.back')}
        </button>
      </div>

      <h1>{t('learning.encyclopedia')}</h1>

      <label className="field learning-encyclopedia-search" htmlFor="learning-encyclopedia-search">
        <span>{t('learning.search')}</span>
        <input
          id="learning-encyclopedia-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('learning.searchPlaceholder')}
          autoComplete="off"
        />
      </label>

      {filtered.length === 0 ? (
        <p className="muted">{t('learning.noResults')}</p>
      ) : (
        <ul className="learning-encyclopedia-list">
          {filtered.map((entry) => (
            <li key={entry.id}>
              <button
                type="button"
                className="learning-encyclopedia-item"
                onClick={() => openEntry(entry.id)}
              >
                <strong>{entry.title}</strong>
                {entry.subtitle ? <span className="muted">{entry.subtitle}</span> : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
