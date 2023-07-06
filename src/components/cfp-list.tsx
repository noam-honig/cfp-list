import { remult,  EntityFilter } from 'remult'
import { CFP } from '../shared/cfp'
import { useEffect, useState } from 'react'

import '@vonage/vivid/data-grid'
import '@vonage/vivid/checkbox'
import '@vonage/vivid/button'
import '@vonage/vivid/action-group'
import '@vonage/vivid/layout'
import '@vonage/vivid/card'
import '@vonage/vivid/fab'

import CfpSmall from './cfp-small'
import { useUrlManager } from './useUrlManager'
import CfpDialog from './cfp-dialog'
import { UserSelection, userSelectionOptions } from '../shared/UserSelection'
import { signInWithGithub } from './github-signin'

const cfpRepo = remult.repo(CFP)

export function CFPList({ signedIn }: { signedIn: VoidFunction }) {
  const [cfps, setCurrentCfps] = useState<CFP[]>([])
  const url = useUrlManager()
  function onlySignedInUsers<T>(what: () => T) {
    if (!remult.authenticated()) {
      if (confirm('Sign in with Github?')) {
        signInWithGithub(signedIn)
      }
      return false
    }
    return what()
  }

  async function toggleUserSelection(
    cfpId: string,
    selection: (typeof userSelectionOptions)[number]
  ) {
    return onlySignedInUsers(async () => {
      const val = await UserSelection.toggleUserSelection(cfpId, selection)
      setCurrentCfps((items) =>
        items.map((item) =>
          item.id === cfpId ? { ...item, [selection]: val } : item
        )
      )
      return val
    })
  }

  useEffect(() => {
    const conditions: EntityFilter<CFP>[] = []
    if (url.showStarred) {
      conditions.push(CFP.filterStarred(true))
    }
    if (!url.showHidden) {
      conditions.push(CFP.filterHidden(false))
    }
    if (url.hideSubmitted) {
      conditions.push(CFP.filterSubmitted(false))
    }

    return cfpRepo
      .liveQuery({
        orderBy: url.recentlyAdded
          ? {
              conferenceDate: 'desc',
              cfpDate: 'asc',
            }
          : {
              cfpDate: 'asc',
              conferenceDate: 'asc',
            },
        where: {
          cfpDate: !url.showOverdue
            ? {
                '>=': new Date(),
              }
            : undefined,
          $and: conditions,
        },
      })
      .subscribe((info) => setCurrentCfps(info.applyChanges))
  }, [
    url.showOverdue,
    url.showStarred,
    url.showHidden,
    url.hideSubmitted,
    url.recentlyAdded,
  ])

  return (
    <div>
      <vwc-fab
        connotation="cta"
        label="Add Cfp"
        icon="plus-solid"
        style={{
          position: 'fixed',
          bottom: '8px',
          right: '8px',
        }}
        onClick={() => onlySignedInUsers(() => url.newCfp())}
      ></vwc-fab>
      {url.cfp && (
        <CfpDialog
          toggleUserSelection={(selection) =>
            toggleUserSelection(url.cfp!, selection)
          }
        />
      )}
      {cfps.map((cfp) => (
        <CfpSmall
          cfp={cfp}
          key={cfp.id}
          select={() => url.setCfp(cfp.id)}
          toggleUserSelection={async (selection) =>
            toggleUserSelection(cfp.id, selection)
          }
        />
      ))}
    </div>
  )
}
