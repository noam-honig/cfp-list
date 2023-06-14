import { remult } from 'remult'
import { User } from '../shared/user'
import { useEffect, useState } from 'react'
import { AuthController } from '../shared/auth-controller'

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
      <ul>
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
            <li key={user.id}>
              {user.username}{' '}
              <button onClick={resetPassword}>Reset Password</button>
            </li>
          )
        })}
      </ul>
      <button onClick={() => addUser()}>Add user</button>
    </>
  )
}
