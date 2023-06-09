import { remultExpress } from 'remult/remult-express'
import { User } from '../shared/user'
import { AuthController } from '../shared/auth-controller'
import { config } from 'dotenv'
import { initRequest } from './server-session'
config()

export const api = remultExpress({
  initRequest,
  entities: [User],
  controllers: [AuthController],
})
