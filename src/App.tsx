import { useEffect,  useState } from 'react'
import { AuthController } from './shared/auth-controller'
import { remult } from 'remult'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'

import { Users } from './components/users'
import EditCfp from './components/edit-cfp'
import { CFPList } from './components/cfp-list'
import '@vonage/vivid/header'
import '@vonage/vivid/button'
import GithubSignIn, { GithubSignInButton } from './components/github-signin'
import { Roles } from './shared/roles'

function App() {
  const [_, render] = useState<{}>()
  const navigate = useNavigate()
  useEffect(() => {
    AuthController.currentUser()
      .then((user) => {
        remult.user = user
        render({})
      })
      .catch((err) => alert(err.message))
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
          <vwc-header alternate>
            <div className="info" slot="action-items">
              Hello {remult.user?.name}
              <vwc-button
                onClick={signOut}
                label="Sign Out"
                connotation="alert"
                appearance="filled"
                size="super-condensed"
              ></vwc-button>
            </div>
            <div className="menu">
              <Link to="/">
                <vwc-button
                  size="condensed"
                  label="Home"
                  appearance="filled"
                ></vwc-button>
              </Link>
              {remult.isAllowed(Roles.admin) && (
                <Link to="/users">
                  <vwc-button
                    size="condensed"
                    label="Users"
                    appearance="filled"
                  ></vwc-button>
                </Link>
              )}
            </div>
          </vwc-header>
        </>
      ) : (
        <>
          <GithubSignInButton
            signedIn={() => {
              navigate('/')
            }}
          />
        </>
      )}

      <Routes>
        {remult.isAllowed(Roles.admin) && (
          <Route path="/users" element={<Users />} />
        )}
        {remult.authenticated() && (
          <>
            <Route path="/cfps/new" element={<EditCfp createNew={true} />} />
            <Route path="/cfps/:id" element={<EditCfp createNew={false} />} />
          </>
        )}
        <Route
          path="/github-signin"
          element={
            <GithubSignIn
              signedIn={() => {
                navigate('/')
              }}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<CFPList />} />
      </Routes>
      <br />
      <br />
      <a href="https://github.com/noam-honig/cfp-list" target="_blank">
        <vwc-button
          label="improve this site on github"
          appearance="filled"
          icon="github-mono"
        ></vwc-button>
      </a>
      <a
        href="https://chat.whatsapp.com/ErE6atVxKqnAPb6rwiT22H"
        target="_blank"
      >
        <vwc-button
          label="join our whatsapp group"
          appearance="filled"
          icon="whatsapp-mono"
        ></vwc-button>
      </a>
    </>
  )
}

export default App
