import { Allow, BackendMethod, remult } from 'remult'
import { User } from './user'
import { setSessionUser } from '../server/server-session'
import { Roles } from './roles'

export class AuthController {
  @BackendMethod({ allowed: true })
  static async getGithubSignInUrl() {
    if (useDevSignInInstead()) return AUTH_ON_DEV
    const query = new URLSearchParams({
      client_id: process.env['GITHUB_CLIENT_ID']!,
      redirect_uri: process.env['GITHUB_CLIENT_REDIRECT_URL']!,
      scope: ['read:user', 'user:email'].join(' '), // space separated string
      allow_signup: 'true',
    })
    return `https://github.com/login/oauth/authorize?${query.toString()}`
  }

  @BackendMethod({ allowed: true })
  static async githubSignIn(code: string) {
    const { id, name, html_url, email } = useDevSignInInstead()
      ? {
          id: code,
          name: code,
          email: '',
          html_url: '',
        }
      : await GetUserInfoFromGithub()
    const userRepo = remult.repo(User)
    let user = await userRepo.findId('github-' + id, { createIfNotFound: true })
    user.name = name
    if (email) user.email = email
    user.githubUrl = html_url
    if (!user.admin) user.admin = (await userRepo.count()) === 0 // If no user exists in the db, than the first user is an admin
    await userRepo.save(user)
    return setSessionUser({
      id: user.id,
      name: user.name,
      roles: user.admin ? [Roles.admin] : [],
    })

    async function GetUserInfoFromGithub() {
      const fetch = await import('node-fetch')
      const url = new URLSearchParams({
        client_id: process.env['GITHUB_CLIENT_ID']!,
        client_secret: process.env['GITHUB_CLIENT_SECRET']!,
        redirect_url: process.env['GITHUB_CLIENT_REDIRECT_URL']!,
        code,
      })
      const result = await fetch.default(
        'https://github.com/login/oauth/access_token?' + url.toString()
      )
      const args = new URLSearchParams(await result.text())
      const error = args.get('error')
      if (error) throw new Error(error)
      const userInfo = await fetch.default('https://api.github.com/user', {
        headers: {
          Authorization: `token ${args.get('access_token')}`,
        },
      })
      return userInfo.json()
    }
  }

  @BackendMethod({ allowed: true })
  static async currentUser() {
    return remult.user
  }
  @BackendMethod({ allowed: Allow.authenticated })
  static async signOut() {
    return setSessionUser(undefined!)
  }
}

export const AUTH_ON_DEV = 'AUTH_ON_DEV'
function useDevSignInInstead() {
  return !process.env['GITHUB_CLIENT_ID']
}
