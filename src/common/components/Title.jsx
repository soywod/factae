import React from 'react'
import {useTranslation} from 'react-i18next'

function Title({label, children}) {
  const {t} = useTranslation()

  return (
    <h1 style={{display: 'flex', alignItems: 'center'}}>
      <span style={{flex: 1}}>{t(label)}</span>
      {children}
    </h1>
  )
}

export default Title
