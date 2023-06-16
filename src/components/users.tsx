//@ts-nocheck
import { remult } from 'remult'
import { User } from '../shared/user'
import { useEffect, useState } from 'react'
import { AuthController } from '../shared/auth-controller';
import '@vonage/vivid/button';
import '@vonage/vivid/data-grid';

const userRepo = remult.repo(User)

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    return userRepo.liveQuery().subscribe((info) => setUsers(info.applyChanges))
  }, [])

  async function addUser() {
    const username = prompt('New username')
    if (username != null) {
      try {
        await userRepo.insert({ username })
      } catch (err: any) {
        alert(err.message)
      }
    }
  }
  return (
    <>
      <vwc-data-grid>
        <vwc-data-grid-row role="row" class="header" row-type="header">
          <vwc-data-grid-cell cell-type="columnheader" 
                              role="columnheader">
            Username
          </vwc-data-grid-cell>
          <vwc-data-grid-cell cell-type="columnheader" 
                              role="columnheader">
            
          </vwc-data-grid-cell>
        </vwc-data-grid-row>
          {users.map((user) => {
            async function resetPassword() {
              try {
                if (
                  confirm(`Are you sure you want to reset the password for ${user.username}?
  If you do, next time they'll sign in, any password they'll set will be their password.`)
                )
                  alert(await AuthController.resetPassword(user.id))
              } catch (error: any) {
                alert(error.message)
              }
            }
            return (
              <vwc-data-grid-row key={user.id}>

                <vwc-data-grid-cell>{user.username}</vwc-data-grid-cell>
                <vwc-data-grid-cell>
                  <vwc-button onClick={resetPassword} 
                              label="Reset Password"
                              connotation="cta"></vwc-button>
                </vwc-data-grid-cell>
              </vwc-data-grid-row>
            )
          })}
      </vwc-data-grid>
      <vwc-button onClick={() => addUser()}
                  label="Add user" 
                  appearance="filled" 
                  connotation="success"></vwc-button>
    </>
  )
}
