import { useState } from 'react'
import { CFP } from '../shared/cfp-entry'
import { remult } from 'remult'

const cfpRepo = remult.repo(CFP)

export default function EditCfp() {
  const [cfp, setCfp] = useState(new CFP())

  return (
    <>
      <form>
        {(
          [
            'conferenceName',
            'link',
            'location',
            'conferenceDate',
            'cfpDate',
            'cfpLink',
            'coverExpanses',
            'whoReported',
            'notes',
          ] as (keyof CFP)[]
        ).map((key) => {
          const meta = cfpRepo.fields.find(key)
          const value = meta.toInput(cfp[key])
          const setValue = (what: string) => {
            setCfp({ ...cfp, [key]: meta.fromInput(what) })
          }

          return (
            <div key={key}>
              <label>{meta.caption}</label>
              <br />
              {meta === cfpRepo.fields.notes ? (
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              ) : (
                <input
                  type={meta.inputType}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              )}
            </div>
          )
        })}
      </form>
    </>
  )
}
