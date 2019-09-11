import React from 'react'
import {useTranslation} from 'react-i18next'
import InputNumber from 'antd/es/input-number'
import Select from 'antd/es/select'
import Typography from 'antd/es/typography'

import DatePicker from '../../common/components/DatePicker'
import FormItems from '../../common/components/FormItems'
import {useProfile} from '../hooks'

const styles = {
  title: {
    fontSize: '1.3em',
    margin: '0 0 15px 0',
  },
}

function EditEnterprise({form}) {
  const {t} = useTranslation()
  const profile = useProfile()

  if (!profile) {
    return null
  }

  const requiredRules = {rules: [{required: true, message: t('field-required')}]}
  const companyIdentityFields = [
    {
      name: 'activityStartedAt',
      Component: <DatePicker />,
      ...requiredRules,
    },
    {
      name: 'activity',
      Component: (
        <Select size="large">
          <Select.Option value="trade">{t('activity-trade')}</Select.Option>
          <Select.Option value="service">{t('activity-service')}</Select.Option>
        </Select>
      ),
      ...requiredRules,
    },
    {name: 'siret', ...requiredRules},
    {name: 'apeCode', ...requiredRules},
    {
      name: 'declarationPeriod',
      Component: (
        <Select size="large">
          <Select.Option value="monthly">{t('monthly')}</Select.Option>
          <Select.Option value="quarterly">{t('quarterly')}</Select.Option>
        </Select>
      ),
      ...requiredRules,
    },
    {name: 'tradeName'},
    {name: 'taxId', help: t('tax-id-help')},
    {
      name: 'taxRate',
      Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      help: t('tax-rate-help'),
    },
  ]

  return (
    <>
      <Typography.Title level={2} style={styles.title}>
        {t('enterprise-identity')}
      </Typography.Title>
      <FormItems form={form} model={profile} fields={companyIdentityFields} />
    </>
  )
}

export default EditEnterprise
