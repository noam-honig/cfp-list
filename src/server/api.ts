import { remultExpress } from 'remult/remult-express'
import { User } from '../shared/user'
import { AuthController } from '../shared/auth-controller'
import { config } from 'dotenv'
import { initRequest } from './server-session'
import { createPostgresWithSchemaDataProvider } from './postgres-with-schema'
import { CFP } from '../shared/cfp'
config()

const entities = [User, CFP]

export const api = remultExpress({
  initRequest,
  entities,
  controllers: [AuthController],
  dataProvider: async () => {
    if (process.env['NODE_ENV'] === 'production')
      return createPostgresWithSchemaDataProvider('cfp', entities)
    return undefined //use the basic json db for dev
  },
})
