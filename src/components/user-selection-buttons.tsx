import { userSelectionOptions } from '../shared/UserSelection'
import type { CFP } from '../shared/cfp'

export interface UserSelectionButtonProps {
  cfp: CFP
  toggleUserSelection: ToggleUserSelectionMethod
}
export type ToggleUserSelectionMethod = (
  selection: (typeof userSelectionOptions)[number]
) => Promise<boolean>

export function UserSelectionButtons({
  cfp,
  toggleUserSelection,
}: UserSelectionButtonProps) {
  return (
    <div>
      <vwc-button
        appearance="ghost"
        label="Star"
        icon={`star${cfp.starred ? '-solid' : ''}`}
        onClick={() => toggleUserSelection('starred')}
      />
      <vwc-button
        appearance="ghost"
        label="hide"
        icon={'eye-hide-' + (cfp.hidden ? 'solid' : 'line')}
        onClick={() => toggleUserSelection('hidden')}
      />
      <vwc-button
        appearance="ghost"
        label="Submitted"
        icon={cfp.submitted ? 'check-circle-solid' : 'radio-unchecked-line'}
        onClick={() => toggleUserSelection('submitted')}
      />
    </div>
  )
}
