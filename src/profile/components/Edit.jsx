import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Select from 'antd/es/select'

import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import FormCard, {FormCardTitle} from '../../common/components/FormCard'
import {useNotification} from '../../utils/notification'
import {difference} from '../../utils/lodash'
import {useProfile} from '../hooks'
import $profile from '../service'

function Profile(props) {
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)
  const profile = useProfile()
  const tryAndNotify = useNotification()
  const {t} = useTranslation()

  async function saveProfile(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const form = await props.form.validateFields()
      await $profile.update(difference(form, profile))
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
      {name: 'firstName'},
      {name: 'lastName'},
      {name: 'email', Component: <Input size="large" disabled />},
      {name: 'phone'},
      {name: 'address'},
      {name: 'zip'},
      {name: 'city'},
    ],
  }

  const companyFields = {
    title: <FormCardTitle title="micro-entreprise" />,
    fields: [
      {name: 'tradingName'},
      {name: 'siret'},
      {name: 'apeCode'},
      {name: 'taxId'},
      {
        name: 'taxRate',
        Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      },
      {
        name: 'activity',
        Component: (
          <Select size="large">
            <Select.Option value="trade">{t('activity-trade')}</Select.Option>
            <Select.Option value="service">{t('activity-service')}</Select.Option>
          </Select>
        ),
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
      <h1>{t('profile')}</h1>

      <Form onSubmit={saveProfile}>
        {fields.map((props, key) => (
          <FormCard key={key} getFieldDecorator={getFieldDecorator} {...props} />
        ))}

        <ActionBar>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(Profile)
