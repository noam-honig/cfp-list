import { useState } from 'react'
import { userSelectionOptions } from '../shared/UserSelection'
import type { CFP } from '../shared/cfp'
export interface UserSelectionButtonProps {
  cfp: CFP
  toggleUserSelection: ToggleUserSelectionMethod
}
export type ToggleUserSelectionMethod = (
  selection: (typeof userSelectionOptions)[number],
) => Promise<boolean>
export function UserSelectionButtons({
  cfp,
  toggleUserSelection,
}: UserSelectionButtonProps) {
  const [pending, setPending] = useState(false)
  return (
    <div className="selection-buttons">
      {(['starred', 'hidden', 'submitted'] as const).map((selection) => (
        <button
          key={selection}
          className={cfp[selection] ? 'selected' : ''}
          aria-pressed={cfp[selection]}
          disabled={pending}
          onClick={async () => {
            setPending(true)
            try {
              await toggleUserSelection(selection)
            } finally {
              setPending(false)
            }
          }}
        >
          <span aria-hidden="true">
            {selection === 'starred'
              ? cfp.starred
                ? '★'
                : '☆'
              : selection === 'hidden'
                ? '◌'
                : '✓'}
          </span>{' '}
          {selection === 'starred'
            ? cfp.starred
              ? 'Saved'
              : 'Save'
            : selection === 'hidden'
              ? cfp.hidden
                ? 'Unhide'
                : 'Hide'
              : 'Submitted'}
        </button>
      ))}
    </div>
  )
}
