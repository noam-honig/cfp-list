import { FormEvent, useEffect, useState } from 'react'
import { CFP } from '../shared/cfp'
import { ErrorInfo, remult } from 'remult'
import { useNavigate, useParams } from 'react-router'

const cfpRepo = remult.repo(CFP)

export default function EditCfp({ createNew }: { createNew: boolean }) {
  const [cfp, setCfp] = useState(createNew ? () => new CFP() : undefined)
  const [errors, setErrors] = useState<ErrorInfo<CFP>>()
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!createNew) cfpRepo.findId(params.id!, { useCache: false }).then(setCfp)
  }, [createNew, params])
  async function save(e: FormEvent) {
    e.preventDefault()
    try {
      setErrors(undefined)
      if (createNew) await cfpRepo.insert(cfp!)
      else await cfpRepo.save(cfp!)
      navigate('/')
    } catch (error: any) {
      alert(error.message)
      setErrors(error)
    }
  }
  if (!cfp) return <>loading</>

  return (
    <>
      <form onSubmit={save}>
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
          const error = errors?.modelState?.[key]
          const setValue = (what: string) => {
            setCfp({ ...cfp, [key]: meta.fromInput(what) })
          }

          return (
            <div key={key}>
              <label>{meta.caption}</label>
              <div>
                {key == 'notes' ? (
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
              {error ?? <div>{error}</div>}
            </div>
          )
        })}
        <button>Save</button>
      </form>
    </>
  )
}
