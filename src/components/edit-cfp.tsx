import { useState } from 'react'
import { CFP } from '../shared/cfp-entry'
import { remult } from 'remult'

const cfpRepo = remult.repo(CFP)

export default function EditCfp() {
  const [cfp, setCfp] = useState(new CFP())

  return (
    <>
      <h1>123</h1>
      <form>
        {(['conferenceName'] as (keyof CFP)[]).map((key) => {
          return (
            <div key={key}>
              <label>{key}</label>
            </div>
          )
        })}
      </form>
    </>
  )
}
