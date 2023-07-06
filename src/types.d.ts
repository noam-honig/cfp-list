import React, { useState, DOMAttributes } from 'react'


import './alert.js'

type CustomElement<T> = Partial<T & DOMAttributes<T> & { children: any }>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['vwc-button']: CustomElement<any>
      // un comment for better typing if you want
      //['vwc-button']: CustomElement<import ('@vonage/vivid/lib/button/button').Button>
      ['vwc-header']: CustomElement<any>
      ['vwc-card']: CustomElement<any>
      ['vwc-layout']: CustomElement<any>
      ['vwc-text-area']: CustomElement<any>
      ['vwc-number-field']: CustomElement<any>
      ['vwc-text-field']: CustomElement<any>
      ['vwc-dialog']: CustomElement<any>
      ['vwc-checkbox']: CustomElement<any>
      ['vwc-action-group']: CustomElement<any>
      ['vwc-data-grid']: CustomElement<any>
      ['vwc-data-grid-row']: CustomElement<any>
      ['vwc-data-grid-cell']: CustomElement<any>
      ['vwc-icon']: CustomElement<any>
      ['vwc-fab']: CustomElement<any>
      ['vwc-side-drawer']: CustomElement<any>
      ['vwc-menu-item']: CustomElement<any>
      ['vwc-menu']: CustomElement<any>
      ['vwc-switch']: CustomElement<any>
      ['vwc-nav-item']: CustomElement<any>
    }
  }
}
