import React, {Fragment, useState} from 'react'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Typography from 'antd/es/typography'
import Select from 'antd/es/select'
import omitBy from 'lodash/fp/omitBy'
import isNil from 'lodash/fp/isNil'

import Container from '../../common/components/Container'
import {useProfile} from '../hooks'
import {update} from '../service'

const {Title, Paragraph} = Typography
const {Option} = Select
const {TextArea} = Input

const styles = {
  title: {
    fontSize: '1.2rem',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: '0.9rem',
    fontStyle: 'italic',
    marginBottom: 0,
    color: '#aaaaaa',
  },
  card: {
    marginBottom: '25px',
  },
  action: {
    textAlign: 'right',
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
  ['siret', 'SIRET'],
  [
    'activity',
    "Type d'activité",
    <Select size="large">
      <Option value="trade">Commerce ou hébergement</Option>
      <Option value="service">Prestation de service</Option>
    </Select>,
  ],
  ['tradingName', 'Nom commercial'],
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
  ['rate', 'Montant (€)', <InputNumber size="large" min={1} step={1} style={{width: '100%'}} />],
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

const ConditionTitle = (
  <Fragment>
    <Title level={2} style={styles.title}>
      Conditions
    </Title>
    <Paragraph style={styles.subtitle}>
      Correspond aux conditions (de paiement, de livraison, d'exécution etc) qui s'afficheront par
      défaut sur vos documents. Champs libres.
    </Paragraph>
  </Fragment>
)

const conditionFields = [
  ['quotationConditions', 'Devis', <TextArea rows={4} />],
  ['invoiceConditions', 'Factures', <TextArea rows={4} />],
]

const TaxTitle = (
  <Fragment>
    <Title level={2} style={styles.title}>
      N° de TVA Intracommunautaire
    </Title>
    <Paragraph style={styles.subtitle}>
      Renseignez uniquement si vous êtes assujetti à la TVA.
    </Paragraph>
  </Fragment>
)

const taxFields = [
  ['taxId', 'Numéro de TVA'],
  [
    'taxRate',
    'Taux de TVA (%)',
    <InputNumber size="large" min={1} step={1} style={{width: '100%'}} />,
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

const fields = [
  [ContactTitle, contactFields],
  [CompanyTitle, companyFields],
  [RateTitle, rateFields],
  [ConditionTitle, conditionFields],
  [TaxTitle, taxFields],
  [BankTitle, bankFields],
]

function Profile(props) {
  const {getFieldDecorator} = props.form
  const [loading, setLoading] = useState(false)
  const profile = useProfile()

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const data = await props.form.validateFields()
      const nextProfile = {...profile, ...omitBy(isNil, data)}
      await update(nextProfile)
      props.history.push('/')
    } catch (e) {
      setLoading(false)
    }
  }

  if (!profile) {
    return null
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={styles.card}>
            <Row gutter={25}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label={label}>
                    {getFieldDecorator(name, {
                      initialValue: profile[name],
                    })(Component)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        ))}

        <div style={styles.action}>
          <Button type="primary" htmlType="submit" loading={loading}>
            Sauvegarder
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default Form.create()(Profile)
