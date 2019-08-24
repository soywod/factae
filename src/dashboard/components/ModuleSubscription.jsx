import React from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Card from 'antd/es/card'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import {isDemo} from '../demo'
import StripeForm from './StripeForm'

function ModuleSubscription() {
  const profile = useProfile()
  const {t, i18n} = useTranslation()

  if (!profile) {
    return null
  }

  const now = DateTime.local()
  const date = profile.expiresAt.setLocale(i18n.language).toFormat(t('date-format'))
  const diff = profile.expiresAt.toRelative({locale: i18n.language})

  return (
    <Card title={<FormCardTitle title={'subscription'} />}>
      {isDemo(profile) || profile.expiresAt > now ? (
        <div>{t('/dashboard.subscription-expired', {date, diff})}</div>
      ) : (
        <StripeForm />
      )}
    </Card>
  )
}

export default ModuleSubscription
