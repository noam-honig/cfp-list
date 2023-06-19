//@ts-nocheck
import { remult } from 'remult'
import { User } from '../shared/user'
import { useEffect, useState } from 'react'
import { AuthController } from '../shared/auth-controller'
import '@vonage/vivid/button'
import '@vonage/vivid/data-grid'

const userRepo = remult.repo(User)

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    return userRepo.liveQuery().subscribe((info) => setUsers(info.applyChanges))
  }, [])

  return (
    <>
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
