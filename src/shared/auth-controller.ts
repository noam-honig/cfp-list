import { Allow, BackendMethod, UserInfo, remult } from 'remult'
import { User } from './user'
import { generate, verify } from 'password-hash'
import { setSessionUser } from '../server/server-session'

export class AuthController {
  @BackendMethod({ allowed: Allow.authenticated })
  static async resetPassword(id: string) {
    const userRepo = remult.repo(User)
    const user = await userRepo.findId(id)
    if (!user) throw new Error('Invalid User')
    user.password = ''
    await userRepo.save(user)
    return 'Done'
  }
  @BackendMethod({ allowed: true })
  /**
   * This sign mechanism represents a simplistic sign in management utility with the following behaviors
   * 1. The first user that signs in, is created as a user and is determined as admin.
   * 2. When a user that has no password signs in, that password that they've signed in with is set as the users password
   */
  static async signIn(username: string, password: string) {
    let result: UserInfo | undefined
    const userRepo = remult.repo(User)
    let user = await userRepo.findFirst({ username })
    if (!user) {
      if ((await userRepo.count()) === 0) {
        //first ever user is the admin
        user = await userRepo.insert({
          username,
          password: generate(password),
          admin: true,
        })
      }
    }
    if (user) {
      if (!user.password) {
        // if the user has no password defined, the first password they use is their password
        await userRepo.save({ ...user, password: generate(password) })
      }

      if (verify(password, user.password)) {
        result = {
          id: user.id,
          roles: [],
          name: user.username,
        }
        setSessionUser(result)
        return result
      }
    }
    throw new Error('Invalid Sign In')
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
//[ ] - write readme for contributing
//[ ] - deploy to heroku and load data from test environment