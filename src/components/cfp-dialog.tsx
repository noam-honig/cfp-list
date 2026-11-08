import { EventThumb } from './event-thumb'
import { FormEvent, useEffect, useRef, useState } from 'react'
import { useUrlManager } from './useUrlManager'
import { CFP, cfpRepo } from '../shared/cfp'
import {
  ToggleUserSelectionMethod,
  UserSelectionButtons,
} from './user-selection-buttons'

const fields = [
  ['link', 'Conference website', 'url'],
  ['conferenceName', 'Conference name', 'text'],
  ['conferenceDate', 'Conference date', 'date'],
  ['location', 'Location', 'text'],
  ['cfpDate', 'Submission deadline', 'date'],
  ['cfpLink', 'Submission link', 'url'],
  ['coverExpanses', 'Travel & expenses covered', 'text'],
  ['whoReported', 'Shared by', 'text'],
  ['image', 'Event image URL', 'url'],
] as const
const dateLabel = (value: Date) =>
  value
    ? new Date(value).toLocaleDateString('en', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'To be announced'
const safeUrl = (value: string) =>
  /^https?:\/\//i.test(value) ? value : undefined

export default function CfpDialog({
  toggleUserSelection,
}: {
  toggleUserSelection: ToggleUserSelectionMethod
}) {
  const url = useUrlManager()
  const createNew = url.cfp === 'new'
  const [cfp, setCfp] = useState<CFP>()
  const [edit, setEdit] = useState(createNew)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CFP, string>>
  >({})
  const [lookup, setLookup] = useState<{
    state: 'idle' | 'loading' | 'failed'
    duplicateOf?: string
  }>({ state: 'idle' })
  const lastLookedUp = useRef('')
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    ref.current?.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    let active = true
    if (createNew) {
      if (cfpRepo.metadata.apiInsertAllowed()) setCfp(new CFP())
      else setError('Please sign in to add an opportunity.')
    } else
      cfpRepo
        .findId(url.cfp!, { useCache: false })
        .then((value) => {
          if (active) {
            if (value) setCfp(value)
            else setError('This opportunity could not be found.')
          }
        })
        .catch(() => {
          if (active)
            setError(
              'We couldn’t load this opportunity. Please close and try again.',
            )
        })
    return () => {
      active = false
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [])
  // When the conference website is entered, read its Open Graph info to
  // pre-fill empty fields and warn about possible duplicates.
  async function lookupLink(value: string) {
    const link = value.trim()
    if (!link || link === lastLookedUp.current) return
    lastLookedUp.current = link
    setLookup({ state: 'loading' })
    try {
      const info = await CFP.getEventOpenGraphInfo(link)
      if (lastLookedUp.current !== link) return
      setLookup({
        state: 'idle',
        duplicateOf: createNew ? info.thereIsAMatchingCfpInDb : undefined,
      })
      setCfp((current) => {
        if (!current) return current
        const result = { ...current }
        if (!result.conferenceName && info.title)
          result.conferenceName = info.title
        if (!result.image && info.image) result.image = info.image
        if (!result.notes && info.description) result.notes = info.description
        return result
      })
    } catch (e) {
      console.error(e)
      if (lastLookedUp.current === link) setLookup({ state: 'failed' })
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setFieldErrors({})
    try {
      if (createNew) await cfpRepo.insert(cfp!)
      else await cfpRepo.save(cfp!)
      url.setCfp(null)
    } catch (e: any) {
      setFieldErrors(e.modelState || {})
      setError(e.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }
  async function remove() {
    setSaving(true)
    setError('')
    try {
      await cfpRepo.delete(cfp!.id)
      url.setCfp(null)
    } catch (e: any) {
      setError(e.message || 'Could not delete. Please try again.')
      setSaving(false)
    }
  }
  return (
    <dialog
      ref={ref}
      className="opportunity-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault()
        if (!saving) url.setCfp(null)
      }}
    >
      <div className="dialog-header">
        <div>
          <div className="eyebrow">
            {createNew
              ? 'SHARE WITH THE COMMUNITY'
              : edit
                ? 'UPDATE OPPORTUNITY'
                : 'YOUR NEXT STAGE'}
          </div>
          <h2 id="dialog-title">
            {createNew
              ? 'Add an opportunity'
              : edit
                ? 'Edit opportunity'
                : cfp?.conferenceName || 'Opportunity details'}
          </h2>
        </div>
        <button
          className="close-button"
          aria-label="Close opportunity"
          disabled={saving}
          onClick={() => url.setCfp(null)}
        >
          ×
        </button>
      </div>
      {error && (
        <p className="dialog-error" role="alert">
          {error}
        </p>
      )}
      {!cfp && !error && <p role="status">Loading opportunity…</p>}
      {cfp &&
        (edit ? (
          <form onSubmit={save}>
            <p className="form-intro">
              Help another speaker find their next stage. Required fields are
              marked *.
            </p>
            <div className="form-grid">
              {fields.map(([key, label, type]) => {
                const meta = cfpRepo.fields.find(key)
                const required = [
                  'conferenceName',
                  'conferenceDate',
                  'cfpDate',
                ].includes(key)
                const fieldError = fieldErrors[key]
                return (
                  <label
                    key={key}
                    className={key === 'link' ? 'full-width' : undefined}
                  >
                    {label}
                    {required ? ' *' : ''}
                    <input
                      type={type}
                      required={required}
                      value={meta.toInput(cfp[key]) || ''}
                      disabled={saving}
                      aria-invalid={fieldError ? true : undefined}
                      onChange={(e) =>
                        setCfp({
                          ...cfp,
                          [key]: meta.fromInput(e.target.value),
                        })
                      }
                      onBlur={
                        key === 'link'
                          ? (e) => lookupLink(e.target.value)
                          : undefined
                      }
                      placeholder={type === 'url' ? 'https://' : undefined}
                    />
                    {key === 'link' && (
                      <span className="field-hint" role="status">
                        {lookup.state === 'loading'
                          ? 'Fetching details from the website…'
                          : lookup.state === 'failed'
                            ? 'Couldn’t read details from this site. Please fill them in manually.'
                            : 'Paste the website first and we’ll fill in what we can.'}
                      </span>
                    )}
                    {key === 'link' && lookup.duplicateOf && (
                      <span className="field-warning" role="alert">
                        A similar link is already listed as “
                        {lookup.duplicateOf}”. Please make sure this isn’t a
                        duplicate.
                      </span>
                    )}
                    {fieldError && (
                      <span className="field-error">{fieldError}</span>
                    )}
                  </label>
                )
              })}
              <label className="full-width">
                Additional details
                <textarea
                  rows={4}
                  value={cfp.notes}
                  disabled={saving}
                  onChange={(e) => setCfp({ ...cfp, notes: e.target.value })}
                  placeholder="Topics, speaker benefits, or anything useful to know…"
                />
              </label>
            </div>
            <div className="dialog-actions">
              <button
                className="button secondary"
                type="button"
                disabled={saving}
                onClick={() => (createNew ? url.setCfp(null) : setEdit(false))}
              >
                Cancel
              </button>
              <button
                className="button primary"
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save opportunity'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <EventThumb
              className="detail-thumb"
              image={cfp.image}
              name={cfp.conferenceName}
            />
            <div className="detail-deadline">
              <span>Submission deadline</span>
              <strong>{dateLabel(cfp.cfpDate)}</strong>
              {safeUrl(cfp.cfpLink) && (
                <a
                  className="button primary"
                  href={safeUrl(cfp.cfpLink)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit submission page ↗
                </a>
              )}
            </div>
            <dl className="detail-grid">
              <div>
                <dt>Conference date</dt>
                <dd>{dateLabel(cfp.conferenceDate)}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{cfp.location || 'To be announced'}</dd>
              </div>
              <div>
                <dt>Travel & expenses</dt>
                <dd>{cfp.coverExpanses || 'Not specified'}</dd>
              </div>
              <div>
                <dt>Shared by</dt>
                <dd>{cfp.whoReported || 'The community'}</dd>
              </div>
            </dl>
            {cfp.notes && (
              <div className="detail-notes">
                <h3>About this opportunity</h3>
                <p>{cfp.notes}</p>
              </div>
            )}
            {safeUrl(cfp.link) && (
              <a
                className="details-link"
                href={safeUrl(cfp.link)}
                target="_blank"
                rel="noreferrer"
              >
                Visit conference website ↗
              </a>
            )}
            <div className="detail-tracking">
              <UserSelectionButtons
                cfp={cfp}
                toggleUserSelection={async (selection) => {
                  const value = await toggleUserSelection(selection)
                  setCfp((x) => x && { ...x, [selection]: value })
                  return value
                }}
              />
            </div>
            <div className="dialog-actions">
              {cfpRepo.metadata.apiDeleteAllowed(cfp) && (
                <button
                  className="button danger"
                  disabled={saving}
                  onClick={() => setConfirmDelete(true)}
                >
                  Delete
                </button>
              )}
              {cfpRepo.metadata.apiUpdateAllowed(cfp) && (
                <button
                  className="button secondary"
                  onClick={() => setEdit(true)}
                >
                  Edit opportunity
                </button>
              )}
            </div>
            {confirmDelete && (
              <div className="delete-confirm" role="alert">
                <p>Delete “{cfp.conferenceName}”? This cannot be undone.</p>
                <button
                  className="button secondary"
                  disabled={saving}
                  onClick={() => setConfirmDelete(false)}
                >
                  Keep opportunity
                </button>{' '}
                <button
                  className="button danger"
                  disabled={saving}
                  onClick={remove}
                >
                  {saving ? 'Deleting…' : 'Delete opportunity'}
                </button>
              </div>
            )}
          </>
        ))}
    </dialog>
  )
}
