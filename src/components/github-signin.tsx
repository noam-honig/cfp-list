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
  return <span>waiting for github sign in....</span>
}

export function GithubSignInButton({ signedIn }: { signedIn: VoidFunction }) {
  const [githubSignInUrl, setGithubSignInUrl] = useState('')
  useEffect(() => {
    AuthController.getGithubSignInUrl().then(setGithubSignInUrl)
  }, [])
  if (!githubSignInUrl) return <></>

  if (githubSignInUrl !== AUTH_ON_DEV) {
    // if production use
    return (
      <a href={githubSignInUrl}>
        <vwc-button
          label="Sign in with github, to add cfps"
          appearance="filled"
          icon="github-mono"
        ></vwc-button>
      </a>
    )
  }

  async function signInOnDevEnvironment() {
    const devUsername = prompt('Dev username?')
    if (devUsername)
      AuthController.githubSignIn(devUsername).then((user) => {
        remult.user = user
        signedIn()
      })
  }
  return (
    <button onClick={signInOnDevEnvironment}>Sign in on dev environment</button>
  )
}
