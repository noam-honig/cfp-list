import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AUTH_ON_DEV, AuthController } from '../shared/auth-controller'
import { remult } from 'remult'

export default function GithubSignIn({ signedIn }: { signedIn: VoidFunction }) {
  const [searchParams] = useSearchParams()

  useEffect(() => {
    AuthController.githubSignIn(searchParams.get('code')!)
      .then((user) => {
        remult.user = user
        signedIn()
      })
      .catch((err: any) => alert(err.message))
  }, [])
  return <span>waiting for GitHub sign in....</span>
}

let staticGithubSignInUrl = ''
export function GithubSignInButton({ signedIn }: { signedIn: VoidFunction }) {
  const [githubSignInUrl, setGithubSignInUrl] = useState('')
  useEffect(() => {
    AuthController.getGithubSignInUrl().then(setGithubSignInUrl)
  }, [])
  if (!githubSignInUrl) return <></>
  staticGithubSignInUrl = githubSignInUrl

  return (
    <vwc-menu-item
      text="Sign in with GitHub"
      onClick={() => signInWithGithub(signedIn)}
    >
      <vwc-icon name="github-mono" slot="meta" size="-4" />
    </vwc-menu-item>
  )
}
export function signInWithGithub(signedIn: VoidFunction) {
  // if production use
  if (staticGithubSignInUrl !== AUTH_ON_DEV) {
    window.location.href = staticGithubSignInUrl
  } else {
    const devUsername = prompt('Dev username?')
    if (devUsername)
      AuthController.githubSignIn(devUsername).then((user) => {
        remult.user = user
        signedIn()
      })
  }
}
