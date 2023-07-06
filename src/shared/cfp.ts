import {
  Allow,
  BackendMethod,
  Entity,
  Fields,
  Validators,
  getEntityRef,
  remult,
} from 'remult'
import { Roles } from './roles'
import { validateDate } from './utils';
import { UserSelectionField, getUserSelectionFilter } from './UserSelection';

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
  @Fields.string({ caption: 'Conference Url' })
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

  @UserSelectionField("starred")
  starred = false
  @UserSelectionField("hidden")
  hidden = false
  @UserSelectionField("submitted")
  submitted = false

  static filterStarred = getUserSelectionFilter("starred")
  static filterHidden = getUserSelectionFilter("hidden")
  static filterSubmitted = getUserSelectionFilter("submitted")




  @BackendMethod({ allowed: Allow.authenticated })
  static async getEventOpenGraphInfo(url: string) {
    const ogs = await import('open-graph-scraper')
    const r = (await ogs.default({ url })).result
    //[ ] improve open graph extraction for problems we had
    //[ ] with a link to a cfp, return correct open graph comments, so it'll share well on whatsapp
    return {
      title: r.ogTitle,
      description: r.ogDescription,
      image: r.ogImage && r.ogImage.length > 0 ? r.ogImage[0].url : '',
      thereIsAMatchingCfpInDb: (
        await remult.repo(CFP).findFirst({
          link: {
            $contains: url.trim(),
          },
        })
      )?.conferenceName,
    }
  }
}


export const cfpRepo = remult.repo(CFP)