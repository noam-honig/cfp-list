import { remult, EntityFilter } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState } from 'react'

import '@vonage/vivid/data-grid'
import '@vonage/vivid/checkbox'
import '@vonage/vivid/button'
import '@vonage/vivid/action-group'
import '@vonage/vivid/layout'
import '@vonage/vivid/card'
import '@vonage/vivid/fab'

import CfpSmall, { daysUntil } from './cfp-small'
import { useUrlManager } from './useUrlManager'
import CfpDialog from './cfp-dialog'
import { UserSelection, userSelectionOptions } from '../shared/UserSelection'
import { signInWithGithub } from './github-signin'
import { regions, regionsOf } from '../shared/regions'

const cfpRepo = remult.repo(CFP)

export function CFPList({ signedIn }: { signedIn: VoidFunction }) {
  const [cfps, setCurrentCfps] = useState<CFP[]>([])
  const url = useUrlManager()
  const [search, setSearch] = useState('')
  const [closingSoon, setClosingSoon] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  function onlySignedInUsers<T>(what: () => T) {
    if (!remult.authenticated()) {
      if (confirm('Sign in with Github?')) {
        signInWithGithub(signedIn)
      }
      return false
    }
    return what()
  }

  async function toggleUserSelection(
    cfpId: string,
    selection: (typeof userSelectionOptions)[number],
  ) {
    return onlySignedInUsers(async () => {
      let val: boolean
      try {
        val = await UserSelection.toggleUserSelection(cfpId, selection)
      } catch {
        setError('Could not update this opportunity. Please try again.')
        return false
      }
      setCurrentCfps((items) =>
        items.map((item) =>
          item.id === cfpId ? { ...item, [selection]: val } : item,
        ),
      )
      return val
    })
  }

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    const conditions: EntityFilter<CFP>[] = []
    if (url.showStarred) {
      conditions.push(CFP.filterStarred(true))
    }
    if (!url.showHidden) {
      conditions.push(CFP.filterHidden(false))
    }
    if (url.hideSubmitted) {
      conditions.push(CFP.filterSubmitted(false))
    }

    cfpRepo
      .find({
        orderBy: url.recentlyAdded
          ? {
              createdAt: 'desc',
              cfpDate: 'asc',
            }
          : url.sortByConferenceDate
            ? {
                conferenceDate: 'asc',
                cfpDate: 'asc',
              }
            : {
                cfpDate: 'asc',
                conferenceDate: 'asc',
              },
        where: {
          cfpDate: !url.showOverdue
            ? {
                '>=': new Date(new Date().setHours(0, 0, 0, 0)),
              }
            : undefined,
          $and: conditions,
        },
      })
      .then((items) => {
        if (active) setCurrentCfps(items)
      })
      .catch(() => {
        if (active)
          setError('We couldn’t load the opportunities. Please try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [
    url.showOverdue,
    url.showStarred,
    url.showHidden,
    url.hideSubmitted,
    url.recentlyAdded,
    url.sortByConferenceDate,
    url.cfp,
    retry,
  ])

  const inRegion = (cfp: CFP) =>
    !url.region || regionsOf(cfp.location).includes(url.region as never)
  const regionCounts = new Map<string, number>()
  for (const cfp of cfps)
    for (const r of regionsOf(cfp.location))
      regionCounts.set(r, (regionCounts.get(r) || 0) + 1)
  const regionOptions = regions.filter(
    (r) => regionCounts.has(r.id) || r.id === url.region,
  )
  const visible = cfps.filter(
    (cfp) =>
      inRegion(cfp) &&
      (!closingSoon ||
        (daysUntil(cfp.cfpDate) >= 0 && daysUntil(cfp.cfpDate) <= 7)) &&
      `${cfp.conferenceName} ${cfp.location} ${cfp.notes}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const soon = cfps.filter(
    (cfp) => daysUntil(cfp.cfpDate) >= 0 && daysUntil(cfp.cfpDate) <= 7,
  ).length
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> THE COMMUNITY’S CALL FOR PAPERS BOARD
          </div>
          <h1>
            Your ideas deserve
            <br />a <em>bigger stage.</em>
          </h1>
          <p>
            Find your next speaking opportunity. Share what you know.
            <br className="desktop-break" /> Connect with the tech community,
            one talk at a time.
          </p>
          <button
            className="button primary"
            onClick={() => onlySignedInUsers(() => url.newCfp())}
          >
            <span aria-hidden="true">＋</span> Add an opportunity
          </button>
          <span className="hero-note">Know a great CFP? Pass it on.</span>
        </div>
        <div className="stage-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="art-spark">✳</span>
          <div className="speech-card">
            <span className="speech-label">THE NEXT VOICE ON STAGE</span>
            <span className="speech-word">
              Could be
              <br />
              <em>you.</em>
            </span>
            <span className="speech-arrow">↗</span>
          </div>
          <span className="art-caption">BIG IDEAS. NEW CONNECTIONS.</span>
        </div>
      </section>
      <section
        className="opportunities"
        aria-labelledby="opportunities-heading"
      >
        <div className="section-heading">
          <div>
            <div className="eyebrow">FIND YOUR NEXT OPPORTUNITY</div>
            <h2 id="opportunities-heading">
              Explore calls for papers{' '}
              <span className="count">{loading ? '…' : cfps.length}</span>
            </h2>
          </div>
          <span className="community-curated">
            <span /> Community curated
          </span>
        </div>
        <div className="filter-panel">
          <div className="search-row">
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                aria-label="Search conferences, locations, or topics"
                placeholder="Search conferences, locations, or topics…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd aria-hidden="true">Search</kbd>
            </label>
            <label className="sort-field">
              Sort by{' '}
              <select
                value={
                  url.recentlyAdded
                    ? 'recentlyAdded'
                    : url.sortByConferenceDate
                      ? 'sortByConferenceDate'
                      : 'deadline'
                }
                onChange={(e) => url.setSort(e.target.value)}
              >
                <option value="deadline">Deadline: soonest</option>
                <option value="recentlyAdded">Recently added</option>
                <option value="sortByConferenceDate">Conference date</option>
              </select>
            </label>
          </div>
          <div
            className="region-filter"
            role="group"
            aria-label="Filter by region"
          >
            <span>Region</span>
            <button
              className={!url.region ? 'active' : ''}
              aria-pressed={!url.region}
              onClick={() => url.setRegion(null)}
            >
              Everywhere
            </button>
            {regionOptions.map((r) => (
              <button
                key={r.id}
                className={url.region === r.id ? 'active' : ''}
                aria-pressed={url.region === r.id}
                onClick={() =>
                  url.setRegion(url.region === r.id ? null : r.id)
                }
              >
                {r.label}
                <small>{regionCounts.get(r.id) || 0}</small>
              </button>
            ))}
          </div>
          <div className="filter-row">
            <div className="filter-tabs">
              <button
                className={!closingSoon && !url.showStarred ? 'active' : ''}
                onClick={() => {
                  setClosingSoon(false)
                  if (url.showStarred) url.toggleShowStarred()
                }}
              >
                All opportunities
              </button>
              <button
                className={closingSoon ? 'active' : ''}
                onClick={() => setClosingSoon(!closingSoon)}
                aria-pressed={closingSoon}
              >
                Closing soon <span>{soon}</span>
              </button>
              {remult.authenticated() && (
                <button
                  className={url.showStarred ? 'active' : ''}
                  aria-pressed={url.showStarred}
                  onClick={() => {
                    setClosingSoon(false)
                    url.toggleShowStarred()
                  }}
                >
                  ☆ Saved
                </button>
              )}
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={url.showOverdue}
                onChange={url.toggleShowOverdue}
              />{' '}
              Include closed CFPs
            </label>
          </div>
          {remult.authenticated() && (
            <div className="personal-filters">
              <label>
                <input
                  type="checkbox"
                  checked={url.showHidden}
                  onChange={url.toggleShowHidden}
                />{' '}
                Show hidden
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={url.hideSubmitted}
                  onChange={url.toggleHideSubmitted}
                />{' '}
                Hide submitted
              </label>
            </div>
          )}
        </div>
        <div className="results-caption" role="status">
          {loading
            ? 'Finding speaking opportunities…'
            : `${visible.length} ${visible.length === 1 ? 'opportunity' : 'opportunities'}${search ? ` matching “${search}”` : ' to share your expertise'}`}
          <span>All deadlines in your local time</span>
        </div>
        {error && (
          <div className="error-state" role="alert">
            {error}{' '}
            <button
              className="button secondary"
              onClick={() => setRetry((x) => x + 1)}
            >
              Try again
            </button>
          </div>
        )}
        {loading ? (
          <div className="card-grid" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : !error && visible.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">
              ◎
            </span>
            <h3>
              {search || closingSoon || url.showStarred || url.region
                ? 'No matching opportunities'
                : 'The next opportunity is on its way'}
            </h3>
            <p>
              {search || closingSoon || url.showStarred || url.region
                ? 'Try another search or broaden your filters.'
                : 'Check back soon, explore past CFPs, or share one with the community.'}
            </p>
            <button
              className="button secondary"
              onClick={() => {
                setSearch('')
                setClosingSoon(false)
                url.setRegion(null)
                if (url.showStarred) url.toggleShowStarred()
                if (!url.showOverdue) url.toggleShowOverdue()
              }}
            >
              Explore all CFPs
            </button>
          </div>
        ) : (
          <div className="card-grid">
            {visible.map((cfp) => (
              <CfpSmall
                key={cfp.id}
                cfp={cfp}
                select={() => url.setCfp(cfp.id)}
                toggleUserSelection={(selection) =>
                  toggleUserSelection(cfp.id, selection)
                }
              />
            ))}
          </div>
        )}
      </section>
      <aside className="community-banner">
        <div className="community-symbol" aria-hidden="true">
          ✳
        </div>
        <div>
          <h2>Better talks start with a community.</h2>
          <p>
            Swap ideas, discover opportunities, and meet other tech speakers.
          </p>
        </div>
        <a
          className="button secondary"
          href="https://chat.whatsapp.com/ErE6atVxKqnAPb6rwiT22H"
          target="_blank"
          rel="noreferrer"
        >
          Join our WhatsApp group ↗
        </a>
      </aside>
      {url.cfp && (
        <CfpDialog
          key={url.cfp}
          toggleUserSelection={(selection) =>
            toggleUserSelection(url.cfp!, selection)
          }
        />
      )}
    </>
  )
}
