import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CURRICULUM_TOPICS } from '../types/progress'
import { listEntries, summarizeProgress } from '../storage/progress'

type ProgressPanelProps = {
  profileName: string
}

export function ProgressPanel({ profileName }: ProgressPanelProps) {
  const { t, i18n } = useTranslation()
  const language = i18n.language.startsWith('en') ? 'en' : 'hr'
  const [tag, setTag] = useState<string>('')
  const summary = useMemo(() => summarizeProgress(profileName), [profileName])
  const hardItems = useMemo(
    () => listEntries(profileName, { status: 'hard', tag: tag || undefined }).slice(0, 5),
    [profileName, tag],
  )

  return (
    <section className="progress-panel">
      <h2>{t('progress.title')}</h2>
      <div className="progress-stats">
        <div>
          <strong>{summary.known}</strong>
          <span>{t('progress.known')}</span>
        </div>
        <div>
          <strong>{summary.learning}</strong>
          <span>{t('progress.learning')}</span>
        </div>
        <div>
          <strong>{summary.hard}</strong>
          <span>{t('progress.hard')}</span>
        </div>
        <div>
          <strong>{summary.due}</strong>
          <span>{t('progress.due')}</span>
        </div>
      </div>

      <label className="field compact-field">
        <span>{t('progress.filterTag')}</span>
        <select value={tag} onChange={(event) => setTag(event.target.value)}>
          <option value="">{t('progress.allTags')}</option>
          {CURRICULUM_TOPICS.map((topic) => (
            <option key={topic.id} value={topic.id}>
              {topic.label[language]}
            </option>
          ))}
        </select>
      </label>

      {hardItems.length > 0 ? (
        <>
          <h3>{t('progress.hardList')}</h3>
          <ul className="progress-hard-list">
            {hardItems.map((entry) => (
              <li key={entry.key}>
                {t(`modes.${entry.mode}.title`)} · {entry.entityId}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="muted hint">{t('progress.emptyHard')}</p>
      )}
    </section>
  )
}
