
import { useEffect, useRef, useState } from 'react';
import type { Dialog } from '@vonage/vivid/lib/dialog/dialog';
import type { Button } from '@vonage/vivid/lib/button/button';
import '@vonage/vivid/dialog';
import '@vonage/vivid/button';

export function Confirm({headline, subtitle, onClose, open}: {headline: string, subtitle: string, onClose: any, open: boolean}) {
  const confirmRef = useRef<Dialog>(null);

  const confirmButtonClick = ({ target }: { target: Button }) => {
    if (confirmRef && confirmRef.current) {
      confirmRef.current.returnValue = target.label as string
      confirmRef?.current?.close()
    }
  }
  
  const closeHandler = (e: any) => {
    console.log('closeHandler', e.target.returnValue);
    onClose(e.target.returnValue);
  }

  useEffect(()=>{
    if (open) {
      confirmRef.current?.showModal();
    } else {
      confirmRef.current?.close();
    }
  },[open]);

  useEffect(() => {
    if (confirmRef.current) {
      confirmRef.current.addEventListener('close', closeHandler);
    }
  }, [confirmRef]);

  return (
    <vwc-dialog headline={headline} 
                subtitle={subtitle}
                id="confirm" 
                ref={confirmRef}>
        <div slot="footer">
          <vwc-button
            appearance="outlined"
            label="Cancel"
            onClick={(e: any) => confirmButtonClick(e)}
          ></vwc-button>
          <vwc-button
            appearance="filled"
            label="Yes"
            onClick={(e: any) => confirmButtonClick(e)}
          ></vwc-button>
        </div>
      </vwc-dialog>
  )
}
