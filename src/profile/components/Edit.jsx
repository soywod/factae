import React, {Fragment, useState} from 'react'
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
import omitBy from 'lodash/fp/omitBy'
import isNil from 'lodash/fp/isNil'
import getOr from 'lodash/fp/getOr'

import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {notify} from '../../utils/notification'
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

const ContactTitle = (
  <Title level={2} style={styles.title}>
    Informations personnelles
  </Title>
)

const contactFields = [
  ['firstName', 'Prénom', <Input size="large" autoFocus />],
  ['lastName', 'Nom'],
  ['email', 'Email', <Input size="large" disabled />],
  ['phone', 'Téléphone'],
  ['address', 'Adresse'],
  ['zip', 'Code postal'],
  ['city', 'Ville'],
]

const CompanyTitle = (
  <Title level={2} style={styles.title}>
    Micro-entreprise
  </Title>
)

const companyFields = [
  ['tradingName', 'Nom commercial'],
  ['siret', 'SIRET'],
  ['apeCode', 'Code APE'],
  ['taxId', 'N° TVA Intracommunautaire'],
  [
    'taxRate',
    'Taux de TVA (%)',
    <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
  ],
  [
    'activity',
    "Type d'activité",
    <Select size="large">
      <Option value="trade">Commerce ou hébergement</Option>
      <Option value="service">Prestation de service</Option>
    </Select>,
  ],
]

const RateTitle = (
  <Fragment>
    <Title level={2} style={styles.title}>
      Tarification par défaut
    </Title>
    <Paragraph style={styles.subtitle}>
      Correspond au taux horaire / journalier / forfaitaire qui s'affichera par défaut sur vos
      devis.
    </Paragraph>
  </Fragment>
)

const rateFields = [
  ['rate', 'Montant (€)', <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />],
  [
    'rateUnit',
    'Unité',
    <Select size="large">
      <Option value="hour">Par heure</Option>
      <Option value="day">Par jour</Option>
      <Option value="service">Par prestation</Option>
    </Select>,
  ],
]

const BankTitle = (
  <Fragment>
    <Title level={2} style={styles.title}>
      Informations bancaires
    </Title>
    <Paragraph style={styles.subtitle}>
      Ces informations s'afficheront sur vos documents, pour faciliter le paiement de vos clients.
    </Paragraph>
  </Fragment>
)

const bankFields = [['rib', 'RIB'], ['iban', 'IBAN'], ['bic', 'BIC']]

const ConditionTitle = (
  <Fragment>
    <Title level={2} style={styles.title}>
      Conditions
    </Title>
    <Paragraph style={styles.subtitle}>
      Correspond aux conditions (de paiement, de livraison, d'exécution etc) qui s'afficheront par
      défaut sur vos documents.
    </Paragraph>
  </Fragment>
)

const conditionFields = [
  ['quotationConditions', 'Devis', <TextArea rows={4} />],
  ['invoiceConditions', 'Factures', <TextArea rows={4} />],
]

const fields = [
  [ContactTitle, contactFields],
  [CompanyTitle, companyFields],
  [RateTitle, rateFields],
  [BankTitle, bankFields],
]

function Profile(props) {
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)
  const profile = useProfile()

  async function saveProfile(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const data = await props.form.validateFields()
      const nextProfile = {...profile, ...omitBy(isNil, data)}
      await $profile.update(nextProfile)
      notify.success('Profil mis à jour avec succès.')
    } catch (error) {
      if (error.message) {
        notify.error(error.message)
      }
    }

    setLoading(false)
  }

  if (!profile) {
    return null
  }

  return (
    <Container>
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
            Sauvegarder
          </Button>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(Profile)
