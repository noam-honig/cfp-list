// @ts-nocheck
import { FormEvent, useEffect, useState } from 'react'
import { CFP } from '../shared/cfp'
import { ErrorInfo, remult } from 'remult'
import { useNavigate, useParams } from 'react-router'
import '@vonage/vivid/text-field';
import '@vonage/vivid/text-area';
import '@vonage/vivid/button';
import '@vonage/vivid/card';
import '@vonage/vivid/layout';

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
    <vwc-card headline="Edit Conference">
      
        <form class="edit-cfp" slot="footer" onSubmit={save}>
          <vwc-layout gutters="small" column-basis="medium">
          {(
            [
              'conferenceName',
              'link',
              'location',
              'cfpLink',
              'conferenceDate',
              'cfpDate',
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
                  {key == 'notes' ? (
                    <vwc-text-area
                      label="Notes"
                      value={value}
                      onBlur={(e) => setValue(e.target.value)}
                    ></vwc-text-area>
                  ) : (
                    <>
                    {meta.inputType === 'number' ? (
                      <vwc-number-field label={meta.caption} 
                                        value={value} 
                                        onBlur={(e) => setValue(e.target.value)}>
                      </vwc-number-field>
                    ) : (
                      <vwc-text-field type={meta.inputType}
                                      label={meta.caption} 
                                      value={value} 
                                      onBlur={(e) => setValue(e.target.value)}>
                      </vwc-text-field>
                    )}
                    </>
                  )}
                {error ?? <div>{error}</div>}
              </div>
            )
          })}
          </vwc-layout>
          <vwc-button label="Save" 
                      type="submit" 
                      appearance="filled" 
                      connotation="success"></vwc-button>
        </form>

    </vwc-card>
  )
}
