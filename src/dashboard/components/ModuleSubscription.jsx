import React from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Card from 'antd/es/card'
import Col from 'antd/es/col'

import {FormCardTitle} from '../../common/components/FormCard'
import {useProfile} from '../../profile/hooks'
import StripeForm from './StripeForm'

function ModuleSubscription() {
  const profile = useProfile()
  const {t, i18n} = useTranslation()

  if (!profile || profile.email === 'demo@factae.fr') {
    return null
  }

  const now = DateTime.local()
  const date = profile.expiresAt.setLocale(i18n.language).toFormat(t('date-format'))
  const diff = profile.expiresAt.toRelative({locale: i18n.language})

  return (
    <Col xs={24}>
      <Card title={<FormCardTitle title={'subscription'} />}>
        {profile.expiresAt > now ? (
          <div>{t('/dashboard.subscription-expired', {date, diff})}</div>
        ) : (
          <StripeForm />
        )}
      </Card>
    </Col>
  )
}

export default ModuleSubscription
