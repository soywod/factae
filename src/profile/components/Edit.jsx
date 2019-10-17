import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Select from 'antd/lib/select'

import DatePicker from '../../common/components/DatePicker'
import DocumentThemePicker from '../../common/components/DocumentThemePicker'
import Title from '../../common/components/Title'
import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../hooks'
import $profile from '../service'

function Profile({form}) {
  const [loading, setLoading] = useState(false)
  const profile = useProfile()
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  async function saveProfile(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      let nextProfile = await validateFields(form)
      nextProfile.activityStartedAt = nextProfile.activityStartedAt.toISOString()
      await $profile.set(nextProfile)
      return t('/profile.updated-successfully')
    })

    setLoading(false)
  }

  if (!profile) {
    return null
  }

  const contactFields = {
    title: <FormCardTitle title="personal-identity" />,
    fields: [
      {name: 'firstName', Component: <Input size="large" autoFocus />, ...requiredRules},
      {name: 'lastName', ...requiredRules},
      {name: 'email', Component: <Input size="large" disabled />, ...requiredRules},
      {name: 'phone'},
      {name: 'address', ...requiredRules},
      {name: 'zip', ...requiredRules},
      {name: 'city', ...requiredRules},
    ],
  }

  const companyFields = {
    title: <FormCardTitle title="enterprise-identity" />,
    fields: [
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
    ],
  }

  const bankFields = {
    title: <FormCardTitle title="bank-informations" subtitle="/profile.bank-subtitle" />,
    fields: [{name: 'rib'}, {name: 'iban'}, {name: 'bic'}],
  }

  const conditionsFields = {
    title: (
      <FormCardTitle title="mentions-and-conditions" subtitle="/profile.conditions-subtitle" />
    ),
    fields: [
      {name: 'quotationConditions', fluid: true, Component: <Input.TextArea rows={5} />},
      {name: 'invoiceConditions', fluid: true, Component: <Input.TextArea rows={5} />},
    ],
  }

  const preferencesFields = {
    title: <FormCardTitle title="preferences" />,
    fields: [
      {
        name: 'documentsTheme',
        Component: (
          <DocumentThemePicker
            preview={form.getFieldValue('documentsTheme') || profile.documentsTheme}
          />
        ),
        ...requiredRules,
      },
    ],
  }

  const fields = [contactFields, companyFields, conditionsFields, bankFields, preferencesFields]

  return (
    <Form noValidate layout="vertical" onSubmit={saveProfile}>
      <Title label="profile">
        <Button type="primary" htmlType="submit" disabled={loading}>
          <Icon type={loading ? 'loading' : 'save'} />
          {t('save')}
        </Button>
      </Title>

      {fields.map((props, key) => (
        <FormCard key={key} form={form} model={profile} {...props} />
      ))}
    </Form>
  )
}

export default Form.create()(Profile)
