import { remult } from 'remult'
import { User } from '../shared/user'

import { useEffect, useState, useRef } from 'react'
import '@vonage/vivid/button'
import '@vonage/vivid/data-grid'
import '@vonage/vivid/dialog'
import { Dialog } from '@vonage/vivid/lib/dialog/dialog'
import { Button } from '@vonage/vivid/lib/button/button'

const userRepo = remult.repo(User)

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const confirmRef = useRef<Dialog>(null)
  const confirmButtonClick = ({ target }: { target: Button }) => {
    if (confirmRef && confirmRef.current) {
      confirmRef.current.returnValue = target.label as string
      confirmRef?.current?.close()
    }
  }
  useEffect(() => {
    return userRepo.liveQuery().subscribe((info) => setUsers(info.applyChanges))
  }, [])

  return (
    <>
      <vwc-dialog id="alert"></vwc-dialog>
      <vwc-dialog id="confirm" ref={confirmRef}>
        <div slot="footer">
          <vwc-button
            appearance="outlined"
            label="Cancel"
            onClick={(e: any) => confirmButtonClick(e)}
          ></vwc-button>
          <vwc-button
            appearance="filled"
            label="Yes"
            onClick={(e: any) => confirmButtonClick(e)}
          ></vwc-button>
        </div>
      </vwc-dialog>
      <vwc-data-grid>
        <vwc-data-grid-row role="row" class="header" row-type="header">
          <vwc-data-grid-cell cell-type="columnheader" role="columnheader">
            Username
          </vwc-data-grid-cell>
          <vwc-data-grid-cell cell-type="columnheader" role="columnheader">
            admin
          </vwc-data-grid-cell>
        </vwc-data-grid-row>

        {users.map((user) => {
          return (
            <vwc-data-grid-row key={user.id}>
              <vwc-data-grid-cell>{user.name}</vwc-data-grid-cell>
              <vwc-data-grid-cell
                onClick={() => userRepo.save({ ...user, admin: !user.admin })}
              >
                {(user.admin || false).toString()}
              </vwc-data-grid-cell>
            </vwc-data-grid-row>
          )
        })}
      </vwc-data-grid>
    </>
  )
}
