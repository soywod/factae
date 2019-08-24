import React from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Icon from 'antd/es/icon'

function Title({loading, label, handler, handlerIcon, handlerLabel}) {
  const {t} = useTranslation()

  return (
    <h1 style={{display: 'flex', alignItems: 'center'}}>
      <span style={{flex: 1}}>{t(label)}</span>
      {handler && (
        <Button type="primary" disabled={loading} onClick={handler}>
          <Icon type={loading ? 'loading' : handlerIcon || handlerLabel} />
          {t(handlerLabel)}
        </Button>
      )}
    </h1>
  )
}

export default Title
