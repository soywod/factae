import React, {Fragment, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import Typography from 'antd/es/typography'
import getOr from 'lodash/fp/getOr'

import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {difference} from '../../utils/lodash'
import {useProfile} from '../hooks'
import $profile from '../service'

const {Title, Paragraph} = Typography
const {Option} = Select
const {TextArea} = Input

const styles = {
  title: {
    fontSize: '1.2em',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: '0.9em',
    fontStyle: 'italic',
    marginBottom: 0,
    color: '#aaaaaa',
  },
  card: {
    marginBottom: 15,
  },
}

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
      return 'Profil mis à jour avec succès.'
    })

    setLoading(false)
  }

  if (!profile) {
    return null
  }

  const ContactTitle = (
    <Title level={3} style={styles.title}>
      {t('personal-informations')}
    </Title>
  )

  const contactFields = [
    ['firstName', t('first-name'), <Input size="large" />],
    ['lastName', t('first-name')],
    ['email', t('email'), <Input size="large" disabled />],
    ['phone', t('phone')],
    ['address', t('address')],
    ['zip', t('zip')],
    ['city', t('city')],
  ]

  const CompanyTitle = (
    <Title level={3} style={styles.title}>
      {t('micro-entreprise')}
    </Title>
  )

  const companyFields = [
    ['tradingName', t('trade-name')],
    ['siret', t('siret')],
    ['apeCode', t('ape-code')],
    ['taxId', t('tax-id')],
    [
      'taxRate',
      t('tax-rate'),
      <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
    ],
    [
      'activity',
      t('activity-type'),
      <Select size="large">
        <Option value="trade">{t('activity-trade')}</Option>
        <Option value="service">{t('activity-service')}</Option>
      </Select>,
    ],
  ]

  const RateTitle = (
    <Fragment>
      <Title level={3} style={styles.title}>
        {t('default-pricing')}
      </Title>
      <Paragraph style={styles.subtitle}>{t('/profile.pricing-subtitle')}</Paragraph>
    </Fragment>
  )

  const rateFields = [
    ['rate', t('amount'), <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />],
    [
      'rateUnit',
      t('unit'),
      <Select size="large">
        <Option value="hour">{t('per-hour')}</Option>
        <Option value="day">{t('per-day')}</Option>
        <Option value="service">{t('per-service')}</Option>
      </Select>,
    ],
  ]

  const BankTitle = (
    <Fragment>
      <Title level={3} style={styles.title}>
        {t('bank-informations')}
      </Title>
      <Paragraph style={styles.subtitle}>{t('/profile.bank-subtitle')}</Paragraph>
    </Fragment>
  )

  const bankFields = [['rib', t('rib')], ['iban', t('iban')], ['bic', t('bic')]]

  const ConditionTitle = (
    <Fragment>
      <Title level={3} style={styles.title}>
        {t('conditions')}
      </Title>
      <Paragraph style={styles.subtitle}>{t('/profile.conditions-subtitle')}</Paragraph>
    </Fragment>
  )

  const conditionFields = [
    ['quotationConditions', t('quotation'), <TextArea rows={4} />],
    ['invoiceConditions', t('invoice'), <TextArea rows={4} />],
  ]

  const fields = [
    [ContactTitle, contactFields],
    [CompanyTitle, companyFields],
    [RateTitle, rateFields],
    [BankTitle, bankFields],
  ]

  return (
    <Container>
      <h1>Profil</h1>
      <Form onSubmit={saveProfile}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={styles.card}>
            <Row gutter={15}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label={label}>
                    {getFieldDecorator(name, {
                      initialValue: getOr('', name, profile),
                    })(Component)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        ))}

        <Card title={ConditionTitle} style={styles.card}>
          <Row gutter={15}>
            {conditionFields.map(([name, label, Component], key) => (
              <Col key={key} xs={24}>
                <Form.Item label={label}>
                  {getFieldDecorator(name, {
                    initialValue: getOr('', name, profile),
                  })(Component)}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

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
