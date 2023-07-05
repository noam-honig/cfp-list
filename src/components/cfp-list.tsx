import { remult, EntityOrderBy } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'

import '@vonage/vivid/data-grid'
import '@vonage/vivid/checkbox'
import '@vonage/vivid/button'
import '@vonage/vivid/action-group'
import '@vonage/vivid/layout'
import '@vonage/vivid/card'
import { Confirm } from './confirm';

const cfpRepo = remult.repo(CFP)

export function CFPList() {
  const [cfps, setCurrentCfps] = useState<CFP[]>([])
  const [showOverdueCfps, setShowOverdueCfps] = useState(false);
  const [viewModeState, setViewModeState] = useState('table');
  const [confirmOpenState, setConfirmOpenState] = useState(false);
  const confirmHeadline = 'Delete CFP';
  const confirmSubtitle = '';
  const selectedCfp = useRef<CFP | null>(null);
  
  const confirmCfpDeletion = (cfp: CFP) => {
    selectedCfp.current = cfp;
    setConfirmOpenState(true);
  }
  const deleteCfp = async (confirmValue: string) => {
    if (selectedCfp.current !== null && confirmValue === 'Yes') {
      try {
        await cfpRepo.delete(selectedCfp.current)
      } catch (error: any) {
        console.error(error.message)
      }
    }
    selectedCfp.current = null;
    setConfirmOpenState(false);
  }

  const [orderBy, setOrderBy] = useState<EntityOrderBy<CFP>>({
    cfpDate: 'asc',
    conferenceDate: 'asc',
  })

  useEffect(() => {
    return cfpRepo
      .liveQuery({
        orderBy,
        where: showOverdueCfps
          ? {}
          : {
              cfpDate: {
                '>=': new Date(),
              },
            },
      })
      .subscribe((info) => setCurrentCfps(info.applyChanges))
  }, [orderBy, showOverdueCfps])
  return (
    <>
      <Confirm headline={confirmHeadline}
            subtitle={confirmSubtitle}  
            onClose={deleteCfp}
            open={confirmOpenState}/>
      <vwc-action-group appearance='ghost'>
        <vwc-action-group role="radiogroup" aria-label="List Display Type">
          {[
            {
              name: 'table',
              icon: 'table-line',
              label: 'Table View',
            },
            {
              name: 'cards',
              icon: 'apps-line',
              label: 'Cards View',
            },
          ].map((viewMode) => {
            return (
              <vwc-button
                key={viewMode.name}
                type="button"
                role="radio"
                icon={viewMode.icon}
                aria-checked={viewMode.name === viewModeState}
                tabindex="0"
                aria-label={viewMode.label}
                appearance={
                  viewMode.name === viewModeState ? 'filled' : 'ghost'
                }
                size="condensed"
                onClick={() => {
                  setViewModeState(viewMode.name)
                }}
              ></vwc-button>
            )
          })}
        </vwc-action-group>
        <vwc-checkbox
          label="Show overdue CFPs"
          name="showOverdueCfps"
          type="checkbox"
          checked={showOverdueCfps}
          onClick={(e: any) => setShowOverdueCfps(e.target.checked)}
          class="view-option"
        ></vwc-checkbox>
      </vwc-action-group>
      {viewModeState === 'table' ? (
        <div className="table-wrapper">
          <vwc-data-grid>
          <vwc-data-grid-row role="row" class="header" row-type="header">
            {(
              [
                'conferenceName',
                'location',
                'conferenceDate',
                'cfpDate',
                'coverExpanses',
                'notes',
              ] as (keyof CFP)[]
            ).map((key) => {
              const meta = cfpRepo.fields.find(key)
              const sort = Object.keys(orderBy)[0] === key && orderBy[key]
              function sortByMe() {
                setOrderBy({
                  [key]: sort == 'asc' ? 'desc' : 'asc',
                  conferenceDate: sort == 'asc' ? 'desc' : 'asc',
                })
              }
              return (
                <vwc-data-grid-cell
                  cell-type="columnheader"
                  role="columnheader"
                  key={key}
                  onClick={sortByMe}
                >
                  <span className="table-text">{meta.caption}{' '}</span>
                  <span className="table-sort">{sort == 'asc' ? '\\/' : sort == 'desc' ? '/\\' : ''}</span>
                </vwc-data-grid-cell>
              )
            })}
            {remult.authenticated() && (
              <vwc-data-grid-cell><span>{" "}</span></vwc-data-grid-cell>
            )}
          </vwc-data-grid-row>

          {cfps.map((cfp) => {
            return (
              <vwc-data-grid-row key={cfp.id}>
                <vwc-data-grid-cell>
                  {cfp.link ? (
                    <a href={cfp.link} target="_blank" className="table-text">
                      {cfp.conferenceName}
                    </a>
                  ) : (
                    cfp.conferenceName
                  )}
                </vwc-data-grid-cell>
                <vwc-data-grid-cell>{cfp.location}</vwc-data-grid-cell>
                <vwc-data-grid-cell>
                  {cfp.conferenceDate.toLocaleDateString('he-il')}
                </vwc-data-grid-cell>
                <vwc-data-grid-cell
                  style={{
                    backgroundColor:
                      cfp.cfpDate?.valueOf() - new Date().valueOf() <
                      86400000 * 7
                        ? 'var(--vvd-color-warning-100)'
                        : '',
                  }}
                >
                  <a href={cfp.cfpLink} target="_blank">
                    {cfp.cfpDate.toLocaleDateString('he-il')}- Submit
                  </a>
                </vwc-data-grid-cell>
                <vwc-data-grid-cell><span className="table-text">{cfp.coverExpanses}</span></vwc-data-grid-cell>
                <vwc-data-grid-cell><span className="table-text">{cfp.notes}</span></vwc-data-grid-cell>
                {remult.authenticated() && (
                  <vwc-data-grid-cell>
                    {cfpRepo.metadata.apiUpdateAllowed(cfp) && (
                      <Link to={'/cfps/' + cfp.id}>
                        <vwc-button
                          size="super-condensed"
                          connotation="cta"
                          appearance="filled"
                          label="Edit"
                        ></vwc-button>
                      </Link>
                    )}
                    {cfpRepo.metadata.apiDeleteAllowed(cfp) && (
                        <vwc-button
                          size="super-condensed"
                          connotation="alert"
                          appearance="filled"
                          label="Delete"
                          onClick={() => confirmCfpDeletion(cfp)}
                        ></vwc-button>
                    )}
                  </vwc-data-grid-cell>
                )}
              </vwc-data-grid-row>
            )
          })}
        </vwc-data-grid>
        </div>
      ) : (
        <vwc-layout>
          {cfps.map((cfp) => {
            return (
              <vwc-card
                key={cfp.id}
                class="cfp-card"
                headline={cfp.conferenceName}
                text={cfp.notes}
              >
                <img
                  slot="media"
                  src={
                    cfp.image
                      ? cfp.image
                      : 'https://picsum.photos/id/1015/300/200'
                  }
                  alt="landscape"
                />
                <vwc-data-grid-row slot="footer">
                  <vwc-data-grid-cell>
                    <span className="cfp-property">Name: </span>
                    {cfp.link ? (
                      <a href={cfp.link} target="_blank">
                        {cfp.conferenceName}
                      </a>
                    ) : (
                      cfp.conferenceName
                    )}
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell>
                    <span className="cfp-property">Location: </span>
                    {cfp.location}
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell>
                    <span className="cfp-property">Date: </span>
                    {cfp.conferenceDate.toLocaleDateString('he-il')}
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell
                    style={{
                      backgroundColor:
                        cfp.cfpDate?.valueOf() - new Date().valueOf() <
                        86400000 * 7
                          ? 'var(--vvd-color-warning-100)'
                          : '',
                    }}
                  >
                    <span className="cfp-property">CFP Deadline: </span>
                    <a href={cfp.cfpLink} target="_blank">
                      {cfp.cfpDate.toLocaleDateString('he-il')}- Submit
                    </a>
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell>
                    <span className="cfp-property">Cover Expanses: </span>
                    {cfp.coverExpanses}
                  </vwc-data-grid-cell>
                  {remult.authenticated() && (
                    <vwc-data-grid-cell>
                      {cfpRepo.metadata.apiUpdateAllowed(cfp) && (
                        <Link to={'/cfps/' + cfp.id}>
                          <vwc-button
                            size="super-condensed"
                            connotation="cta"
                            appearance="filled"
                            label="Edit"
                          ></vwc-button>
                        </Link>
                      )}
                      {cfpRepo.metadata.apiDeleteAllowed(cfp) && (
                          <vwc-button
                            size="super-condensed"
                            connotation="alert"
                            appearance="filled"
                            label="Delete"
                            onClick={() => confirmCfpDeletion(cfp)}
                          ></vwc-button>
                      )}
                    </vwc-data-grid-cell>
                  )}
                </vwc-data-grid-row>
              </vwc-card>
            )
          })}
        </vwc-layout>
      )}
      {cfpRepo.metadata.apiInsertAllowed() && (
        <Link to="/cfps/new">
          <vwc-button
            connotation="cta"
            appearance="filled"
            label="Add Cfp"
            icon="plus-solid"
          ></vwc-button>
        </Link>
      )}
    </>
  )
}
