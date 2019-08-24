import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Select from 'antd/es/select'

import Container from '../../common/components/Container'
import DatePicker from '../../common/components/DatePicker'
import Title from '../../common/components/Title'
import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../hooks'
import $profile from '../service'

function Profile(props) {
  const {getFieldDecorator} = props.form
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
      let nextProfile = await validateFields(props.form)
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
    title: <FormCardTitle title="personal-informations" />,
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
    title: <FormCardTitle title="micro-entreprise" />,
    fields: [
      {name: 'tradeName'},
      {name: 'siret', ...requiredRules},
      {name: 'apeCode', ...requiredRules},
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
      {
        name: 'activityStartedAt',
        Component: <DatePicker />,
        ...requiredRules,
      },
      {name: 'taxId'},
      {
        name: 'taxRate',
        Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      },
    ],
  }

  const rateFields = {
    title: <FormCardTitle title="default-pricing" subtitle="/profile.pricing-subtitle" />,
    fields: [
      {
        name: 'rate',
        Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      },
      {
        name: 'rateUnit',
        Component: (
          <Select size="large">
            <Select.Option value="hour">{t('per-hour')}</Select.Option>
            <Select.Option value="day">{t('per-day')}</Select.Option>
            <Select.Option value="service">{t('per-service')}</Select.Option>
          </Select>
        ),
      },
    ],
  }

  const bankFields = {
    title: <FormCardTitle title="bank-informations" subtitle="/profile.bank-subtitle" />,
    fields: [{name: 'rib'}, {name: 'iban'}, {name: 'bic'}],
  }

  const conditionsFields = {
    title: <FormCardTitle title="conditions" subtitle="/profile.conditions-subtitle" />,
    fields: [
      {name: 'quotationConditions', fluid: true, Component: <Input.TextArea rows={4} />},
      {name: 'invoiceConditions', fluid: true, Component: <Input.TextArea rows={4} />},
    ],
  }

  const fields = [contactFields, companyFields, rateFields, bankFields, conditionsFields]

  return (
    <Container>
      <Form noValidate layout="vertical" onSubmit={saveProfile}>
        <Title label="profile">
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </Title>

        {fields.map((props, key) => (
          <FormCard key={key} getFieldDecorator={getFieldDecorator} model={profile} {...props} />
        ))}
      </Form>
    </Container>
  )
}

export default Form.create()(Profile)
