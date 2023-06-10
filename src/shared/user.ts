import { Allow, Entity, Fields, Validators } from 'remult'

@Entity('users', {
  allowApiCrud: Allow.authenticated,
})
export class User {
  @Fields.cuid()
  id = ''

  @Fields.string({
    validate: [Validators.required, Validators.uniqueOnBackend],
  })
  username = ''

  @Fields.string({ includeInApi: false })
  password = ''

  @Fields.boolean()
  admin = false

  @Fields.createdAt()
  createdAt = new Date()
}
