import { remult, EntityOrderBy } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

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
        <label>
          <input
            name="showOverdueCfps"
            type="checkbox"
            checked={showOverdueCfps}
            onChange={(e) => setShowOverdueCfps(e.target.checked)}
          ></input>
          Show overdue CFPs
        </label>
      </div>
      <table>
        <thead>
          <tr>
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
                <th key={key} onClick={sortByMe}>
                  {meta.caption}{' '}
                  {sort == 'asc' ? '\\/' : sort == 'desc' ? '/\\' : ''}
                </th>
              )
            })}
            {remult.authenticated() && <th></th>}
          </tr>
        </thead>
        <tbody>
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
              <tr key={cfp.id}>
                <td>
                  <a href={cfp.link} target="_blank">
                    {cfp.conferenceName}
                  </a>
                </td>
                <td>{cfp.location}</td>
                <td>{cfp.conferenceDate.toLocaleDateString('he-il')}</td>
                <td>
                  <a href={cfp.cfpLink} target="_blank">
                    {cfp.cfpDate.toLocaleDateString('he-il')}- Submit
                  </a>
                </td>
                <td>{cfp.coverExpanses}</td>
                <td>{cfp.notes}</td>
                {remult.authenticated() && (
                  <td>
                    <Link to={'/cfps/' + cfp.id}>Edit</Link>
                    <a
                      href=""
                      onClick={(e) => {
                        e.preventDefault()
                        deleteCfp()
                      }}
                    >
                      Delete{' '}
                    </a>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
      {remult.authenticated() && <Link to="/cfps/new">Add Cfp</Link>}
    </>
  )
}
