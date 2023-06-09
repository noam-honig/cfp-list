import { remult } from 'remult'
import { User } from '../shared/user'
import { useEffect, useState } from 'react'

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
          return <li key={user.id}>{user.username}</li>
        })}
      </ul>
      <button onClick={() => addUser()}>Add user</button>
    </>
  )
}
