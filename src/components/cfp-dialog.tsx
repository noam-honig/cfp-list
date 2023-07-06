import { FormEvent, useEffect, useRef, useState } from 'react'
import { useUrlManager } from './useUrlManager'
import { CFP, cfpRepo } from '../shared/cfp'
import { ErrorInfo, remult } from 'remult'
import { Dialog } from '@vonage/vivid/lib/dialog/dialog'
import { Confirm } from './confirm'
import { formatDate } from '../shared/utils'
import {
  ToggleUserSelectionMethod,
  UserSelectionButtons,
} from './user-selection-buttons'
import '@vonage/vivid/text-field'

export default function CfpDialog({
  toggleUserSelection,
}: {
  toggleUserSelection: ToggleUserSelectionMethod
}) {
  const url = useUrlManager()
  const [cfp, setCfp] = useState<CFP>()
  const [errors, setErrors] = useState<ErrorInfo<CFP>>()
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState(false)
  const [confirmOpenState, setConfirmOpenState] = useState(false)

  const createNew = url.cfp === 'new'

  async function save(e: FormEvent) {
    e?.preventDefault()
    try {
      setErrors(undefined)
      if (createNew) await cfpRepo.insert(cfp!)
      else await cfpRepo.save(cfp!)
      url.setCfp(null)
    } catch (error: any) {
      alert(error.message)
      setErrors(error)
    }
  }
  const deleteCfp = async (confirmValue: string) => {
    if (confirmValue === 'Yes' && cfp) {
      try {
        await cfpRepo.delete(cfp.id)
      } catch (error: any) {
        console.error(error.message)
      }
    }
    setConfirmOpenState(false)
  }

  const ref = useRef<Dialog>()
  useEffect(() => {
    if (url.cfp) {
      if (createNew) {
        if (cfpRepo.metadata.apiInsertAllowed()) {
          setCfp(new CFP())
          setOpen(true)
          setEdit(true)
        }
      } else
        cfpRepo
          .findId(url.cfp, {
            useCache: false,
          })
          .then((x) => {
            setCfp(x)
            setOpen(true)
          })
    }
  }, [])
  useEffect(() => {
    if (open) {
      if (!ref.current?.open) ref.current?.showModal()
      ref.current?.addEventListener('close', () => {
        url.setCfp(null)
      })
    }
  }, [open])

  return (
    <vwc-dialog ref={ref} onClose={() => {}}>
      {cfp && (
        <vwc-card
          style={{ minWidth: '330px' }}
          slot="main"
          key={cfp.id}
          class="cfp-card"
          headline={cfp.conferenceName}
          text={cfp.notes}
        >
          <Confirm
            headline={'Delete CFP'}
            subtitle={
              'Are you sure you want to delete ' + cfp.conferenceDate + '?'
            }
            onClose={deleteCfp}
            open={confirmOpenState}
          />
          <div slot="media" style={{ position: 'relative' }}>
            <img
              slot="media"
              src={
                cfp.image ? cfp.image : 'https://picsum.photos/id/1015/300/200'
              }
              alt="landscape"
            />
            <vwc-button
              appearance="ghost"
              icon="close-small-line"
              style={{
                position: 'absolute',
                right: '5px',
                top: '5px',
              }}
              onClick={() => {
                url.setCfp(null)
              }}
            />
          </div>

          {edit ? (
            <div slot="footer" className="edit-cfp">
              <form onSubmit={save}>
                <vwc-layout column-basis="medium">
                  {(
                    [
                      'link',
                      'conferenceName',
                      'conferenceDate',
                      'cfpLink',
                      'cfpDate',
                      'location',
                      'coverExpanses',
                      'whoReported',
                      'image',
                    ] as (keyof CFP)[]
                  ).map((key) => {
                    const meta = cfpRepo.fields.find(key)
                    const value = meta.toInput(cfp[key])
                    const error = errors?.modelState?.[key]
                    const setValue = (what: string) => {
                      if (key === 'link') {
                        if (what != cfp.link) {
                          CFP.getEventOpenGraphInfo(what.trim())
                            .then((i) => {
                              if (i.thereIsAMatchingCfpInDb && createNew) {
                                setTimeout(() => {
                                  alert(`There is a cfp with a similar link in the db called: ${i.thereIsAMatchingCfpInDb}.
  Please Make sure that this is not a duplicate before adding it
                            `)
                                }, 100)
                              }
                              setCfp((current) => {
                                let result = { ...current! }
                                if (!result.conferenceName)
                                  result.conferenceName = i.title!
                                if (!result.image) result.image = i.image
                                if (!result.notes) result.notes = i.description!
                                return result
                              })
                            })
                            .catch((err) => {
                              console.log(err)
                              if (!cfp.conferenceName) {
                                setCfp({
                                  ...cfp,
                                  conferenceName: 'Failed to get og info',
                                })
                              }
                            })
                        }
                      }
                      setCfp({ ...cfp, [key]: meta.fromInput(what) })
                    }

                    return (
                      <div key={key}>
                        {key == 'notes' ? (
                          <></>
                        ) : (
                          <>
                            {meta.inputType === 'number' ? (
                              <vwc-number-field
                                label={meta.caption}
                                value={value}
                                onBlur={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setValue(e.target.value)}
                              ></vwc-number-field>
                            ) : (
                              <vwc-text-field
                                type={meta.inputType}
                                label={meta.caption}
                                value={value}
                                onBlur={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) => setValue(e.target.value)}
                              ></vwc-text-field>
                            )}
                          </>
                        )}

                        {error && (
                          <div style={{ color: 'var(--vvd-color-alert-700)' }}>
                            {error}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </vwc-layout>
              </form>
              <vwc-layout column-basis="medium">
                <vwc-text-area
                  style={{ paddingTop: '24px' }}
                  label="Notes"
                  value={cfp.notes}
                  onBlur={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCfp({ ...cfp, notes: e.target.value })
                  }
                ></vwc-text-area>
              </vwc-layout>
              <vwc-action-group appearance="ghost" class="edit-cfp-buttons">
                <vwc-button
                  label="Save"
                  type="submit"
                  appearance="filled"
                  connotation="success"
                  onClick={save}
                ></vwc-button>
                {!createNew && cfpRepo.metadata.apiDeleteAllowed(cfp) && (
                  <vwc-button
                    connotation="alert"
                    appearance="filled"
                    label="Delete"
                    onClick={() => {
                      if (confirm('are you sure you want to delete?')) {
                        try {
                          cfpRepo.delete(cfp.id)
                          url.setCfp(null)
                        } catch (err: any) {
                          alert(err.any)
                        }
                      }
                    }}
                  ></vwc-button>
                )}
              </vwc-action-group>
            </div>
          ) : (
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
              <vwc-data-grid-cell
                style={{
                  backgroundColor:
                    cfp.cfpDate?.valueOf() - new Date().valueOf() < 86400000 * 7
                      ? 'var(--vvd-color-alert-100)'
                      : '',
                }}
              >
                <span className="cfp-property">CFP Deadline: </span>
                <a href={cfp.cfpLink} target="_blank">
                  {formatDate(cfp.cfpDate)}- Submit
                </a>
              </vwc-data-grid-cell>
              <vwc-data-grid-cell>
                <span className="cfp-property">Event Date: </span>
                {formatDate(cfp.conferenceDate)}
              </vwc-data-grid-cell>
              <vwc-data-grid-cell>
                <span className="cfp-property">Location: </span>
                {cfp.location}
              </vwc-data-grid-cell>
              <vwc-data-grid-cell>
                <span className="cfp-property">Expanses: </span>
                {cfp.coverExpanses}
              </vwc-data-grid-cell>
              {!createNew && (
                <vwc-data-grid-cell>
                  <UserSelectionButtons
                    cfp={cfp}
                    toggleUserSelection={async (selection) => {
                      const val = await toggleUserSelection(selection)
                      setCfp((x) => x && { ...x, [selection]: val })
                      return val
                    }}
                  />
                </vwc-data-grid-cell>
              )}
              {remult.authenticated() && !edit && (
                <vwc-data-grid-cell>
                  {cfpRepo.metadata.apiUpdateAllowed(cfp) && (
                    <vwc-button
                      connotation="cta"
                      appearance="filled"
                      label="Edit"
                      onClick={() => setEdit(true)}
                    ></vwc-button>
                  )}
                </vwc-data-grid-cell>
              )}
            </vwc-data-grid-row>
          )}
        </vwc-card>
      )}
    </vwc-dialog>
  )
}
