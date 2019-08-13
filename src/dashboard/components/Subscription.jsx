import React from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'

import {useProfile} from '../../profile/hooks'
import StripeForm from './StripeFormContainer'

function Subscription() {
  const profile = useProfile()
  const {t, i18n} = useTranslation()

  if (!profile || profile.email === 'demo@factae.fr') {
    return null
  }

  const now = DateTime.local()
  const date = profile.expiresAt.setLocale(i18n.language).toFormat(t('date-format'))
  const diff = profile.expiresAt.toRelative({locale: i18n.language})

  return (
    <>
      <h2>{t('subscription')}</h2>
      {profile.expiresAt > now ? (
        <div>{t('/dashboard.subscription-expired', {date, diff})}</div>
      ) : (
        <StripeForm />
      )}
    </>
  )
}

export default Subscription
