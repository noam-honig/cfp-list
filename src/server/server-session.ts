import { UserInfo, remult } from 'remult'
import type { Request } from 'express'

declare module 'remult' {
  export interface RemultContext {
    session: CookieSessionInterfaces.CookieSessionObject
  }
}

export async function initRequest(req: Request) {
  remult.context.session = req.session!
  remult.user = req.session!['user']
  req.sessionOptions.maxAge = 365 * 86400000
}

export function setSessionUser(user: UserInfo): UserInfo {
  remult.context.session['user'] = user
  remult.user = user
  return user
}
