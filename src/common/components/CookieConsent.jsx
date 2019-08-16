import React from 'react'
import {useTranslation} from 'react-i18next'
import ReactCookieConsent from 'react-cookie-consent'

function CookieConsent() {
  const {t} = useTranslation()

  return (
    <ReactCookieConsent
      cookieName="cookie-consent"
      buttonText={t('i-agree')}
      buttonStyle={{
        color: 'rgba(0, 0, 0, .65)',
        background: '#ffffff',
        borderRadius: 4,
        textShadow: '0 -1px 0 rgba(0, 0, 0, .12)',
        fontSize: '14px',
        lineHeight: '1.499',
      }}
      style={{
        position: 'fixed',
        alignItems: 'center',
        padding: '0 15px',
        width: 'auto',
        background: '#faad14',
        color: '#ffffff',
        right: 0,
        boxShadow: '0 -1px 8px rgba(0, 0, 0, .1)',
      }}
    >
      {t('cookie-consent')}
    </ReactCookieConsent>
  )
}

export default CookieConsent
