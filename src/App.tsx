import { useEffect, useState } from 'react'
import { AuthController } from './shared/auth-controller'
import { remult } from 'remult'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SignIn from './components/sign-in'
import { Users } from './components/users'

function App() {
  const [_, render] = useState<{}>()
  const navigate = useNavigate()
  useEffect(() => {
    AuthController.currentUser().then((user) => {
      remult.user = user
      render({})
    })
  }, [])
  async function signOut() {
    await AuthController.signOut()
    remult.user = undefined
    render({})
  }
  if (_ === undefined) return <>loading</>
  return (
    <>
      {remult.authenticated() ? (
        <>
          <div>
            Hello {remult.user?.name}
            <button onClick={signOut}>sign out</button>
          </div>
          <div>
            <Link to="/">Home</Link>
            <Link to="/users">Users</Link>
          </div>
        </>
      ) : (
        <Link to="/signIn">Sign In</Link>
      )}
      <Routes>
        <Route
          path="/signIn"
          element={
            <SignIn
              signedIn={() => {
                render({})
                navigate('/')
              }}
            />
          }
        />
        {remult.authenticated() && <Route path="/users" element={<Users />} />}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<div>root</div>} />
      </Routes>
    </>
  )
}

export default App
