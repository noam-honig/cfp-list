// @ts-nocheck
import { remult, EntityOrderBy } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '@vonage/vivid/data-grid'
import '@vonage/vivid/checkbox'
import '@vonage/vivid/button'
import { Roles } from '../shared/roles'

const cfpRepo = remult.repo(CFP)

export function CFPList() {
  const [cfps, setCfps] = useState<CFP[]>([])
  const [showOverdueCfps, setShowOverdueCfps] = useState(false)
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
      </div>
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
                {meta.caption}{' '}
                {sort == 'asc' ? '\\/' : sort == 'desc' ? '/\\' : ''}
              </vwc-data-grid-cell>
            )
          })}
          {remult.authenticated() && (
            <vwc-data-grid-cell>Admin Tools</vwc-data-grid-cell>
          )}
        </vwc-data-grid-row>

        {cfps.map((cfp) => {
          async function deleteCfp() {
            try {
              if (
                confirm('Are you sure you want to delete ' + cfp.conferenceName)
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
              <vwc-data-grid-cell>
                {cfp.conferenceDate.toLocaleDateString('he-il')}
              </vwc-data-grid-cell>
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
                    <vwc-button
                      size="super-condensed"
                      connotation="cta"
                      appearance="filled"
                      label="Edit"
                    ></vwc-button>
                  </Link>
                  <a
                    href=""
                    onClick={(e) => {
                      e.preventDefault()
                      deleteCfp()
                    }}
                  >
                    <vwc-button
                      size="super-condensed"
                      connotation="alert"
                      appearance="filled"
                      label="Delete"
                    ></vwc-button>
                  </a>
                </vwc-data-grid-cell>
              )}
            </vwc-data-grid-row>
          )
        })}
      </vwc-data-grid>
      {remult.isAllowed(Roles.admin) && (
        <Link to="/cfps/new">
          <vwc-button
            connotation="cta"
            appearance="filled"
            label="Add Cfp"
          ></vwc-button>
        </Link>
      )}
    </>
  )
}
