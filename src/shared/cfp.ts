import { Allow, Entity, FieldRef, Fields, Validators, remult } from 'remult'

@Entity<CFP>('cfps', {
  allowApiCrud: Allow.authenticated,
  allowApiRead: Allow.everyone,
  defaultOrderBy: {
    cfpDate: 'asc',
  },
})
export class CFP {
  @Fields.cuid()
  id = ''
  @Fields.string({
    validate: Validators.required,
  })
  conferenceName = ''
  @Fields.string()
  image = ''
  @Fields.string()
  link = ''
  @Fields.string()
  location = ''
  @Fields.dateOnly({
    validate: validateDate,
  })
  conferenceDate!: Date
  @Fields.dateOnly({
    validate: validateDate,
  })
  cfpDate!: Date
  @Fields.string()
  cfpLink = ''
  @Fields.string()
  coverExpanses = ''
  @Fields.string()
  whoReported = ''
  @Fields.string()
  notes = ''
  @Fields.createdAt()
  createdAt = new Date()

  @Fields.string({
    serverExpression: () => JSON.stringify(remult.user),
  })
  test = ''
}

export function validateDate(_: any, fieldRef: FieldRef<any, Date>) {
  if (!fieldRef.value || fieldRef.value.getFullYear() < 1900)
    throw new Error('Invalid Date')
}
