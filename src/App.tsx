// @ts-nocheck
import { useEffect, useState } from 'react'
import { AuthController } from './shared/auth-controller'
import { remult } from 'remult'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import SignIn from './components/sign-in'
import { Users } from './components/users'
import EditCfp from './components/edit-cfp'
import { CFPList } from './components/cfp-list'
import '@vonage/vivid/header';
import '@vonage/vivid/button';

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
        <vwc-header alternate>
          <div>
            Hello {remult.user?.name}
        
          <vwc-button onClick={signOut} 
                      label="Sign Out" 
                      connotation="alert" 
                      appearance="filled"
                      size="super-condensed"></vwc-button>
          </div>
          <div>
            <Link to="/">
              <vwc-button
                      label="Home"  
                      appearance="filled"></vwc-button>
            </Link>
            <Link to="/users">
              <vwc-button
                      label="Users"  
                      appearance="filled"></vwc-button>
            </Link>    
          </div>
        </vwc-header>
        </>
      ) : (
        <>
          <Link to="/signIn">
              <vwc-button
                      label="Sign In"  
                      appearance="filled"></vwc-button>
          </Link>
        </>
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
        {remult.authenticated() && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/cfps/new" element={<EditCfp createNew={true} />} />
            <Route path="/cfps/:id" element={<EditCfp createNew={false} />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/" element={<CFPList />} />
      </Routes>
      <br />
      <a href="https://github.com/noam-honig/cfp-list">
        improve this site on github
      </a>
    </>
  )
}

export default App
