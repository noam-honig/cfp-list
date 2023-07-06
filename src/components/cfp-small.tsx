import { formatDate } from '../shared/utils'
import {
  UserSelectionButtonProps,
  UserSelectionButtons,
} from './user-selection-buttons'

export default function CfpSmall({
  cfp,
  select,
  toggleUserSelection,
}: {
  select: VoidFunction
} & UserSelectionButtonProps) {
  return (
    <div
      style={{
        paddingTop: '16px',

        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid lightgray',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flexGrow: 0, flexShrink: 0, width: '100px' }}>
          <img
            onClick={select}
            src={
              cfp.image ? cfp.image : 'https://picsum.photos/id/1015/300/200'
            }
            width="100px"
          />
        </div>
        <div
          style={{
            width: '100%',
            paddingLeft: '8px',
            color: cfp.hidden ? 'gray' : undefined,
          }}
        >
          <div
            onClick={select}
            style={{
              font: 'var(--vvd-typography-base-extended-bold)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {cfp.conferenceName}{' '}
            <div>
              <a href={cfp.cfpLink} target="_blank">
                <vwc-icon name="open-line" connotation="accent"></vwc-icon>
              </a>
            </div>
          </div>
          <div>{formatDate(cfp.conferenceDate)}</div>
          <div
            style={{
              font: 'var(--vvd-typography-base-bold)',
              backgroundColor:
                cfp.cfpDate?.valueOf() - new Date().valueOf() < 86400000 * 7
                  ? 'var(--vvd-color-alert-100)'
                  : '',
            }}
          >
            CFP: {formatDate(cfp.cfpDate)}
            <vwc-icon
              name="open-line"
              connotation="accent"
              style={{
                paddingLeft: '8px',
              }}
            ></vwc-icon>
          </div>
        </div>
      </div>
      <UserSelectionButtons
        cfp={cfp}
        toggleUserSelection={toggleUserSelection}
      />
    </div>
  )
}
