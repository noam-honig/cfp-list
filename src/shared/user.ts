import { Entity, Fields } from 'remult'
import { Roles } from './roles'

@Entity('users', {
  allowApiCrud: Roles.admin,
})
export class User {
  @Fields.cuid()
  id = ''
  @Fields.string()
  name = ''
  @Fields.string()
  email = ''
  @Fields.string()
  githubUrl = ''

  @Fields.boolean()
  admin = false

  @Fields.createdAt()
  createdAt = new Date()
}
