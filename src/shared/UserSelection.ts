import {
  Allow,
  BackendMethod,
  Entity,
  Fields,
  Filter,
  remult
} from 'remult';
import type { CFP } from './cfp';
import { Roles } from './roles';


export const userSelectionOptions = ["starred", "hidden", "submitted"] as const;

@Entity("userSelection", {
  allowApiRead: Roles.admin
})
export class UserSelection {
  @Fields.uuid()
  id = '';
  @Fields.string()
  cfpId = '';
  @Fields.string()
  userId = '';
  @Fields.string<UserSelection>({
    validate: s => {
      if (!userSelectionOptions.includes(s.selection))
        throw Error("Invalid Selection");
    }
  })
  selection!: (typeof userSelectionOptions)[number];
  @Fields.createdAt()
  createdAt = new Date();

  @Fields.boolean()
  selected = false


  @BackendMethod({ allowed: Allow.authenticated })
  static async toggleUserSelection(cfpId: string, selection: typeof userSelectionOptions[number]) {
    const repo = remult.repo(UserSelection);
    const existingSelections = await repo.findFirst({
      cfpId,
      userId: remult.user!.id,
      selection
    }, { createIfNotFound: true })
    existingSelections.selected = !existingSelections.selected;
    await repo.save(existingSelections);
    return existingSelections.selected;
  }
}


export function UserSelectionField(selection: typeof userSelectionOptions[number]) {
  return Fields.boolean<CFP>({
    serverExpression: async cfp => {
      if (!remult.user)
        return false;
      return await remult.repo(UserSelection).count({
        cfpId: cfp.id,
        userId: remult.user!.id,
        selection: selection,
        selected: true
      }) > 0
    }
  })
}

export function getUserSelectionFilter(selection: typeof userSelectionOptions[number]) {
  return Filter.createCustom<CFP,
    boolean
  >(
    async (match) => {

      const ids = (await remult.repo(UserSelection).find({
        where: {
          selection,
          userId: [remult.user?.id!],
          selected: true
        }
      })).map(x => x.cfpId)
      if (match)
        return {
          id: ids
        }
      else return {
        id: { $ne: ids }
      }
    })
}