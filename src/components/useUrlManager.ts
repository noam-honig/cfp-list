import { useSearchParams } from 'react-router-dom'

const flags = [
  'showOverdue',
  'showHidden',
  'showStarred',
  'hideSubmitted',
  'recentlyAdded',
  'sortByConferenceDate',
] as const
type flagsType<T extends readonly string[]> = {
  [K in T[number]]: boolean
} & {
  [P in `toggle${Capitalize<T[number]>}`]: () => void
}

const cfpFlag = 'cfp'

export function useUrlManager() {
  const [searchParams, setSearchParams] = useSearchParams()

  const result = {} as flagsType<typeof flags>

  for (const flag of flags) {
    result[flag] = searchParams.get(flag) === ''
    //@ts-ignore
    result[`toggle${flag.charAt(0).toUpperCase() + flag.slice(1)}`] = () => {
      setSearchParams((x) => {
        if (x.has(flag)) x.delete(flag)
        else x.set(flag, '')
        return x
      })
    }
  }

  const cfp = searchParams.get(cfpFlag) || undefined
  const region = searchParams.get('region') || undefined

  return Object.assign(result, {
    cfp,
    region,
    setRegion(value: string | null) {
      setSearchParams((x) => {
        if (!value) x.delete('region')
        else x.set('region', value)
        return x
      })
    },
    setSort(value: string) {
      setSearchParams((x) => {
        x.delete('recentlyAdded')
        x.delete('sortByConferenceDate')
        if (value !== 'deadline') x.set(value, '')
        return x
      })
    },

    setCfp(id: string | null) {
      setSearchParams((x) => {
        if (!id) x.delete('cfp')
        else x.set('cfp', id!)
        return x
      })
    },
    newCfp() {
      setSearchParams((x) => {
        x.set('cfp', 'new')
        return x
      })
    },
  })
}
