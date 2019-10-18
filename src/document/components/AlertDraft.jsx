import React from 'react'
import {useSpring, animated} from 'react-spring'
import Button from 'antd/lib/button'
import Alert from 'antd/lib/alert'
import {useTranslation} from 'react-i18next'

function AlertDraft({document, onConfirm: handleConfirm}) {
  const style = useSpring(getStyle(document))
  const {t} = useTranslation()

  return (
    <animated.div style={style}>
      <Alert
        message={t('warning')}
        description={
          <div style={{display: 'flex', alignItems: 'flex-end'}}>
            <span style={{display: 'flex', flexDirection: 'column', flex: 1}}>
              <span>{t('/documents.warning-draft-1')}</span>
              <span>{t('/documents.warning-draft-2')}</span>
            </span>
            <span>
              <Button type="link" onClick={handleConfirm}>
                {t('confirm')}
              </Button>
            </span>
          </div>
        }
        type="warning"
        showIcon
        style={{marginBottom: 24}}
      />
    </animated.div>
  )
}

function getStyle(document) {
  if (document.number) return {opacity: 0, maxHeight: 0}
  return {opacity: 1, maxHeight: 200}
}

export default AlertDraft
