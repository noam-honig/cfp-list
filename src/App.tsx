import { useEffect, useRef, useState } from 'react'
import { AuthController } from './shared/auth-controller'
import { remult } from 'remult'
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation,
} from 'react-router-dom'

import { Users } from './components/users'
import { CFPList } from './components/cfp-list'
import '@vonage/vivid/header'
import '@vonage/vivid/button'
import '@vonage/vivid/nav-item'

import GithubSignIn, { GithubSignInButton } from './components/github-signin'
import { Roles } from './shared/roles'
import '@vonage/vivid/side-drawer'
import '@vonage/vivid/menu'
import '@vonage/vivid/menu-item'
import '@vonage/vivid/switch'

import { SideDrawer } from '@vonage/vivid/lib/side-drawer/side-drawer'
import { User } from './shared/user'
import { useUrlManager } from './components/useUrlManager'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const navigate = useNavigate()
  const url = useUrlManager()
  function navigateAndCloseDrawer(path: string) {
    navigate(path)
    setDrawer(false)
  }
  function link(path: string, sameWindow = false) {
    if (sameWindow) window.location.href = path
    else window.open(path, '_blank')
  }
  const location = useLocation()
  const drawerRef = useRef<SideDrawer>()
  const showingCfp = location.pathname == '/'
  useEffect(() => {
    AuthController.currentUser()
      .then((user) => {
        remult.user = user
        setLoaded(true)
      })
      .catch((err) => alert(err.message))
  }, [])
  useEffect(() => {
    drawerRef.current?.addEventListener('close', () => {
      setDrawer(false)
    })
  }, [loaded])
  async function signOut() {
    await AuthController.signOut()
    window.location.reload()
  }

  if (!loaded) return <>loading</>
  return (
    <>
      <vwc-header>
        <vwc-button icon="menu-solid" onClick={() => setDrawer(!drawer)} />
        CFP List{' '}
      </vwc-header>
      <vwc-side-drawer modal open={drawer} ref={drawerRef}>
        <vwc-layout gutters="small" row-spacing="small">
          <vwc-button icon="menu-solid" onClick={() => setDrawer(!drawer)} />
          <vwc-menu-item
            text="Sort by Recently Added"
            onClick={() => {
              url.toggleRecentlyAdded()
              if (!url.recentlyAdded && url.sortByConferenceDate) {
                url.toggleSortByConferenceDate()
              }
            }}
          >
            <vwc-switch slot="meta" current-checked={url.recentlyAdded}></vwc-switch>
          </vwc-menu-item>

          <vwc-menu-item
            text="Sort by Conference Date"
            onClick={() => {
              if (!url.sortByConferenceDate && url.recentlyAdded)
                url.toggleRecentlyAdded()
              url.toggleSortByConferenceDate()
            }}
          >
            <vwc-switch
              slot="meta"
              current-checked={url.sortByConferenceDate}
            ></vwc-switch>
          </vwc-menu-item>
          <vwc-menu-item
            text="Show overdue CFPs"
            onClick={() => url.toggleShowOverdue()}
          >
            <vwc-switch slot="meta" current-checked={url.showOverdue}></vwc-switch>
          </vwc-menu-item>
          {remult.authenticated() && (
            <>
              <vwc-menu-item
                text="Only show starred"
                onClick={() => url.toggleShowStarred()}
              >
                <vwc-switch slot="meta" current-checked={url.showStarred}></vwc-switch>
              </vwc-menu-item>
              <vwc-menu-item
                text="Show hidden"
                onClick={() => url.toggleShowHidden()}
              >
                <vwc-switch slot="meta" current-checked={url.showHidden}></vwc-switch>
              </vwc-menu-item>
              <vwc-menu-item
                text="Hide Submitted"
                onClick={() => url.toggleHideSubmitted()}
              >
                <vwc-switch
                  slot="meta"
                  current-checked={url.hideSubmitted}
                ></vwc-switch>
              </vwc-menu-item>
            </>
          )}

          {showingCfp ? (
            remult.repo(User).metadata.apiReadAllowed && (
              <vwc-menu-item
                text="Users"
                onClick={() => navigateAndCloseDrawer('/users')}
              ></vwc-menu-item>
            )
          ) : (
            <vwc-menu-item
              text="CFP List"
              onClick={() => navigateAndCloseDrawer('/')}
            />
          )}

          <vwc-menu-item
            text="Join our whatsapp group"
            onClick={() =>
              link('https://chat.whatsapp.com/ErE6atVxKqnAPb6rwiT22H')
            }
          >
            <vwc-icon slot="meta" name="whatsapp-mono" size="-4" />
          </vwc-menu-item>
          <vwc-menu-item
            text="Built using remult"
            onClick={() => {
              link('https://remult.dev')
            }}
          >
            <img
              style={{ width: '24px' }}
              slot="meta"
              src="https://github.com/remult/remult/raw/master/docs/public/logo.png"
            ></img>
          </vwc-menu-item>
          <vwc-menu-item
            text="Source on Github"
            onClick={() => link('https://github.com/noam-honig/cfp-list')}
          >
            <vwc-icon slot="meta" name="github-mono" size="-4" />
          </vwc-menu-item>
          {remult.authenticated() ? (
            <vwc-menu-item text="Sign Out" onClick={signOut}>
              <vwc-icon name="exit-solid" slot="meta" size="-4" />
            </vwc-menu-item>
          ) : (
            <GithubSignInButton
              signedIn={() => {
                navigateAndCloseDrawer('/')
              }}
            />
          )}
        </vwc-layout>

        <vwc-layout
          column-basis="block"
          gutters="small"
          column-spacing="small"
          className="layout"
          slot="app-content"
        >
          <Routes>
            {remult.isAllowed(Roles.admin) && (
              <Route path="/users" element={<Users />} />
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
            <Route
              path="/"
              element={
                <CFPList
                  signedIn={() => {
                    navigate('/')
                  }}
                />
              }
            />
          </Routes>
        </vwc-layout>
      </vwc-side-drawer>
    </>
  )
}

export default App
