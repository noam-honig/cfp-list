import { Entity, Fields, remult } from 'remult'
import { Roles } from './roles'
import { UserSelection } from './UserSelection'

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

  @Fields.integer<User>({
    serverExpression: async (self) =>
      remult.repo(UserSelection).count({ userId: self.id }),
  })
  interactions = 0
}
