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
import isNil from 'lodash/fp/isNil'
import omitBy from 'lodash/fp/omitBy'

import {notify} from '../../utils/notification'
import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {useClients} from '../hooks'
import $client from '../service'

const {Title: AntdTitle} = Typography
const Title = ({children}) => (
  <AntdTitle level={2} style={{fontSize: '1.2rem', marginBottom: 0}}>
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

  async function deleteClient() {
    setLoading(true)

    try {
      await $client.delete(client)
      notify.success('Client supprimé avec succès.')
      props.history.push('/clients')
    } catch (error) {
      if (error.message) notify.error(error.message)
      setLoading(false)
    }
  }

  async function saveClient(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      const data = await props.form.validateFields()
      const nextClient = {...client, ...omitBy(isNil, data)}
      await $client.update(nextClient)
      notify.success('Client mis à jour avec succès.')
    } catch (error) {
      if (error.message) {
        notify.error(error.message)
      }
    }

    setLoading(false)
  }

  if (!clients || !client) {
    return null
  }

  return (
    <Container>
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
      </Form>

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
    </Container>
  )
}

export default Form.create()(EditClient)
