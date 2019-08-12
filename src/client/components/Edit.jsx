import React, {useEffect, useState} from 'react'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Popconfirm from 'antd/es/popconfirm'
import Row from 'antd/es/row'
import Typography from 'antd/es/typography'
import find from 'lodash/fp/find'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import omitBy from 'lodash/fp/omitBy'

import {useNotification} from '../../utils/notification'
import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {useClients} from '../hooks'
import $client from '../service'

const {Title: AntdTitle} = Typography
const Title = ({children}) => (
  <AntdTitle level={3} style={{fontSize: '1.2rem', marginBottom: 0}}>
    {children}
  </AntdTitle>
)

const CompanyTitle = <Title>Société</Title>
const companyFields = [
  ['tradingName', 'Nom commercial', <Input size="large" autoFocus />],
  ['siret', 'SIRET'],
]

const ContactTitle = <Title>Contact</Title>
const contactFields = [
  ['firstName', 'Prénom', <Input size="large" />],
  ['lastName', 'Nom'],
  ['email', 'Email'],
  ['phone', 'Téléphone'],
  ['address', 'Adresse'],
  ['zip', 'Code postal'],
  ['city', 'Ville'],
  ['country', 'Pays'],
]

const fields = [[CompanyTitle, companyFields], [ContactTitle, contactFields]]

function EditClient(props) {
  const {match} = props
  const {getFieldDecorator} = props.form

  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(props.location.state)
  const tryAndNotify = useNotification()

  useEffect(() => {
    if (clients && !client) {
      setClient(find({id: match.params.id}, clients))
    }
  }, [client, clients, match.params.id])

  async function deleteClient() {
    await tryAndNotify(
      async () => {
        setLoading(true)
        await $client.delete(client)
        props.history.push('/clients')
        return 'Client supprimé avec succès.'
      },
      () => setLoading(false),
    )
  }

  async function saveClient(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const data = await props.form.validateFields()
      const nextClient = {...client, ...omitBy(isEmpty, data)}
      await $client.update(nextClient)
      return 'Client mis à jour avec succès.'
    })

    setLoading(false)
  }

  if (!clients || !client) {
    return null
  }

  return (
    <Container>
      <h1>Client</h1>
      <Form onSubmit={saveClient}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={{marginBottom: 15}}>
            <Row gutter={15}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label={label}>
                    {getFieldDecorator(name, {
                      initialValue: getOr('', name, client),
                    })(Component)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        ))}
        <ActionBar>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce client ?"
            onConfirm={deleteClient}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              Supprimer
            </Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            Sauvegarder
          </Button>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(EditClient)
