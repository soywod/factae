import React, {useEffect, useState} from 'react'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Typography from 'antd/es/typography'
import isNil from 'lodash/fp/isNil'
import find from 'lodash/fp/find'
import omitBy from 'lodash/fp/omitBy'

import Container from '../../common/components/Container'
import {useClients} from '../hooks'
import {update} from '../service'

const {Title} = Typography

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

const CompanyTitle = (
  <Title level={2} style={styles.title}>
    Société
  </Title>
)

const companyFields = [
  ['tradingName', 'Nom commercial', <Input size="large" autoFocus />],
  ['siret', 'SIRET'],
]

const ContactTitle = (
  <Title level={2} style={styles.title}>
    Contact
  </Title>
)

const contactFields = [
  ['firstName', 'Prénom', <Input size="large" />],
  ['lastName', 'Nom'],
  ['email', 'Email'],
  ['phone', 'Téléphone'],
  ['address', 'Adresse'],
  ['zip', 'Code postal'],
  ['city', 'Ville'],
]

const fields = [[CompanyTitle, companyFields], [ContactTitle, contactFields]]

function EditClient(props) {
  const {match} = props
  const {getFieldDecorator} = props.form

  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(props.location.state)

  useEffect(() => {
    if (clients && !client) {
      setClient(find({id: match.params.id}, clients))
    }
  }, [client, clients, match.params.id])

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const data = await props.form.validateFields()
      const nextClient = {...client, ...omitBy(isNil, data)}
      await update(nextClient)
      props.history.push('/clients')
    } catch (e) {
      setLoading(false)
    }
  }

  if (!clients || !client) {
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
                      initialValue: client[name],
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

export default Form.create()(EditClient)
