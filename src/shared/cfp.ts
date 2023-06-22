import {
  Allow,
  Entity,
  FieldRef,
  Fields,
  Validators,
  getEntityRef,
  remult,
} from 'remult'
import { Roles } from './roles'

@Entity<CFP>('cfps', {
  allowApiCrud: Allow.authenticated,
  allowApiRead: Allow.everyone,
  allowApiDelete: (cfp) =>
    remult.isAllowed(Roles.admin) ||
    (remult.authenticated() && cfp?.createUserId === remult.user!.id),
  allowApiUpdate: (cfp) =>
    remult.isAllowed(Roles.admin) ||
    (remult.authenticated() && cfp?.createUserId === remult.user!.id),
  saving: (cfp) => {
    if (getEntityRef(cfp).isNew()) {
      cfp.createUserId = remult.user!.id
    }
  },
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
  whoReported = remult.user?.name || ''
  @Fields.string()
  notes = ''
  @Fields.createdAt()
  createdAt = new Date()
  @Fields.string({
    allowApiUpdate: false,
  })
  createUserId = ''
}

export function validateDate(_: any, fieldRef: FieldRef<any, Date>) {
  if (!fieldRef.value || fieldRef.value.getFullYear() < 1900)
    throw new Error('Invalid Date')
}
