import { useEffect, useState } from 'react'
import { AuthController } from './shared/auth-controller'
import { remult } from 'remult'
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { Users } from './components/users'
import { CFPList } from './components/cfp-list'
import GithubSignIn, { GithubSignInButton } from './components/github-signin'
import { Roles } from './shared/roles'
import '@vonage/vivid/button'
import '@vonage/vivid/layout'
import '@vonage/vivid/card'
import '@vonage/vivid/data-grid'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const [, refresh] = useState(0)
  const navigate = useNavigate()
  const signedIn = () => {
    refresh((x) => x + 1)
    navigate('/')
  }
  useEffect(() => {
    AuthController.currentUser()
      .then((user) => {
        remult.user = user
        setLoaded(true)
      })
      .catch(() => setError(true))
  }, [])
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              c<span>f</span>p.
            </span>
            <span>
              CFP List<span className="brand-caption">YOUR NEXT STAGE</span>
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <Link to="/" className="nav-link">
              Explore CFPs
            </Link>
            <a
              className="community-link"
              href="https://chat.whatsapp.com/ErE6atVxKqnAPb6rwiT22H"
              target="_blank"
              rel="noreferrer"
            >
              Join the community ↗
            </a>
            {remult.isAllowed(Roles.admin) && <Link to="/users">Users</Link>}
          </nav>
          {loaded &&
            (remult.authenticated() ? (
              <button
                className="button secondary"
                onClick={async () => {
                  await AuthController.signOut()
                  window.location.reload()
                }}
              >
                Sign out
              </button>
            ) : (
              <GithubSignInButton signedIn={signedIn} />
            ))}
        </div>
      </header>
      <main id="main" className="page-shell">
        {error ? (
          <div className="empty-state" role="alert">
            <h1>We couldn’t connect.</h1>
            <p>Please try again to load speaking opportunities.</p>
            <button
              className="button primary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : !loaded ? (
          <div className="empty-state" role="status">
            Loading speaking opportunities…
          </div>
        ) : (
          <Routes>
            {remult.isAllowed(Roles.admin) && (
              <Route path="/users" element={<Users />} />
            )}
            <Route
              path="/github-signin"
              element={<GithubSignIn signedIn={signedIn} />}
            />
            <Route path="/" element={<CFPList signedIn={signedIn} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </main>
      <footer className="site-footer">
        <span>Made for speakers. Built by the community.</span>
        <div>
          <span>Israel Tech CFP Group</span>
          <a
            href="https://github.com/noam-honig/cfp-list"
            target="_blank"
            rel="noreferrer"
          >
            GitHub ↗
          </a>
          <a href="https://remult.dev" target="_blank" rel="noreferrer">
            Powered by Remult
          </a>
        </div>
      </footer>
    </>
  )
}
export default App
