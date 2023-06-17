// @ts-nocheck
import { remult, EntityOrderBy } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '@vonage/vivid/data-grid';
import '@vonage/vivid/checkbox';
import '@vonage/vivid/button';
import '@vonage/vivid/action-group';
import '@vonage/vivid/layout';
import '@vonage/vivid/card';

const cfpRepo = remult.repo(CFP)

export function CFPList() {
  const [cfps, setCfps] = useState<CFP[]>([])
  const [showOverdueCfps, setShowOverdueCfps] = useState(false)
  const [viewModeState, setViewModeState] = useState('table');
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
      .subscribe((info) => setCfps(info.applyChanges))
  }, [orderBy, showOverdueCfps])
  return (
    <>
      <div>
          <vwc-checkbox
            label="Show overdue CFPs"
            name="showOverdueCfps"
            type="checkbox"
            checked={showOverdueCfps}
            onClick={(e) => setShowOverdueCfps(e.target.checked)}
          ></vwc-checkbox>

          <vwc-action-group role="radiogroup" aria-label="List Display Type">
            {([
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
            ]).map((viewMode, index, arr) => {
              return (
                <vwc-button type="button"
                            role="radio"
                            icon={viewMode.icon}
                            aria-checked={viewMode.name === viewModeState}
                            tabindex="0"
                            aria-label={viewMode.label}
                            appearance={(viewMode.name === viewModeState) ? 'filled' : 'outline'}                            
                            onClick={() => {
                              setViewModeState(viewMode.name)
                            }}
                            ></vwc-button>
              )
              })
            }
          </vwc-action-group>
      </div>
      {viewModeState === 'table' ? (

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
                <vwc-data-grid-cell cell-type="columnheader" 
                                    role="columnheader" 
                                    key={key} 
                                    onClick={sortByMe}>
                  {meta.caption}{' '}
                  {sort == 'asc' ? '\\/' : sort == 'desc' ? '/\\' : ''}
                </vwc-data-grid-cell>
              )
            })}
            {remult.authenticated() && (
                  <vwc-data-grid-cell>
                    Admin Tools
                  </vwc-data-grid-cell>
                )}
          </vwc-data-grid-row>

          {cfps.map((cfp) => {
            async function deleteCfp() {
              try {
                if (
                  confirm(
                    'Are you sure you want to delete ' + cfp.conferenceName
                  )
                ) {
                  await cfpRepo.delete(cfp)
                }
              } catch (error: any) {
                alert(error.message)
              }
            }
            return (
              <vwc-data-grid-row key={cfp.id}>
                <vwc-data-grid-cell>
                  {cfp.link ? (
                    <a href={cfp.link} target="_blank">
                      {cfp.conferenceName}
                    </a>
                  ) : (
                    cfp.conferenceName
                  )}
                </vwc-data-grid-cell>
                <vwc-data-grid-cell>{cfp.location}</vwc-data-grid-cell>
                <vwc-data-grid-cell>{cfp.conferenceDate.toLocaleDateString('he-il')}</vwc-data-grid-cell>
                <vwc-data-grid-cell>
                  <a href={cfp.cfpLink} target="_blank">
                    {cfp.cfpDate.toLocaleDateString('he-il')}- Submit
                  </a>
                </vwc-data-grid-cell>
                <vwc-data-grid-cell>{cfp.coverExpanses}</vwc-data-grid-cell>
                <vwc-data-grid-cell>{cfp.notes}</vwc-data-grid-cell>
                {remult.authenticated() && (
                  <vwc-data-grid-cell>
                      <Link to={'/cfps/' + cfp.id}>
                        <vwc-button size="super-condensed" connotation="cta" appearance="filled" label="Edit"></vwc-button>
                      </Link>
                      <a
                        href=""
                        onClick={(e) => {
                          e.preventDefault()
                          deleteCfp()
                        }}
                      >
                        <vwc-button size="super-condensed" connotation="alert" appearance="filled" label="Delete">
                        </vwc-button>
                      </a>
                  </vwc-data-grid-cell>
                )}
              </vwc-data-grid-row>
            )
          })}
      </vwc-data-grid>

      ) : (
        <vwc-layout>
          {cfps.map((cfp) => {
            async function deleteCfp() {
              try {
                if (
                  confirm(
                    'Are you sure you want to delete ' + cfp.conferenceName
                  )
                ) {
                  await cfpRepo.delete(cfp)
                }
              } catch (error: any) {
                alert(error.message)
              }
            }
            return (
              <>
              <vwc-card key={cfp.id}
                        class="cfp-card" 
                        headline={cfp.conferenceName} 
                        text={cfp.notes}>
                <img slot="media" 
                    src="https://picsum.photos/id/1015/300/200" 
                    alt="landscape"/>
                <vwc-data-grid-row slot="footer">
                  <vwc-data-grid-cell>
                    <span class="cfp-property">Name: </span>
                    {cfp.link ? (
                      <a href={cfp.link} target="_blank">
                        {cfp.conferenceName}
                      </a>
                    ) : (
                      cfp.conferenceName
                    )}
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell><span class="cfp-property">Location: </span>{cfp.location}</vwc-data-grid-cell>
                  <vwc-data-grid-cell><span class="cfp-property">Date: </span>{cfp.conferenceDate.toLocaleDateString('he-il')}</vwc-data-grid-cell>
                  <vwc-data-grid-cell>
                  <span class="cfp-property">CFP Deadline: </span><a href={cfp.cfpLink} target="_blank">
                      {cfp.cfpDate.toLocaleDateString('he-il')}- Submit
                    </a>
                  </vwc-data-grid-cell>
                  <vwc-data-grid-cell><span class="cfp-property">Cover Expanses: </span>{cfp.coverExpanses}</vwc-data-grid-cell>
                  {remult.authenticated() && (
                    <vwc-data-grid-cell>
                        <Link to={'/cfps/' + cfp.id}>
                          <vwc-button size="super-condensed" connotation="cta" appearance="filled" label="Edit"></vwc-button>
                        </Link>
                        <a
                          href=""
                          onClick={(e) => {
                            e.preventDefault()
                            deleteCfp()
                          }}
                        >
                          <vwc-button size="super-condensed" connotation="alert" appearance="filled" label="Delete">
                          </vwc-button>
                        </a>
                    </vwc-data-grid-cell>
                  )}
                </vwc-data-grid-row>
              </vwc-card>

              </>
            )
          })}
        </vwc-layout>
      )}
      {remult.authenticated() && 
        <Link to="/cfps/new">
          <vwc-button connotation="cta" appearance="filled" label="Add Cfp"></vwc-button>
        </Link>}
    </>
  )
}
