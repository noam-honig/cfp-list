import { FormEvent, useState } from 'react'

import { remult } from 'remult'
import { AuthController } from '../shared/auth-controller'

export default function SignIn({ signedIn }: { signedIn: VoidFunction }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  async function signIn(e: FormEvent) {
    e.preventDefault()
    try {
      const result = await AuthController.signIn(username, password)
      remult.user = result
      signedIn()
    } catch (err: any) {
      alert(err.message)
    }
  }
  return (
    <>
      <form onSubmit={signIn}>
        <input
          value={username}
          placeholder="username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          value={password}
          type={password}
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>sign in</button>
      </form>
    </>
  )
}
