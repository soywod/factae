import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
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

function EditClient(props) {
  const {match} = props
  const {getFieldDecorator} = props.form

  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(props.location.state)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()

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
        return t('/clients.deleted-successfully')
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
      return t('/clients.updated-successfully')
    })

    setLoading(false)
  }

  if (!clients || !client) {
    return null
  }

  const CompanyTitle = <Title>{t('company')}</Title>
  const companyFields = [
    ['tradingName', t('trade-name'), <Input size="large" autoFocus />],
    ['siret', t('siret')],
  ]

  const ContactTitle = <Title>{t('contact')}</Title>
  const contactFields = [
    ['firstName', t('first-name'), <Input size="large" />],
    ['lastName', t('first-name')],
    ['email', t('email')],
    ['phone', t('phone')],
    ['address', t('address')],
    ['zip', t('zip')],
    ['city', t('city')],
    ['country', t('country')],
  ]

  const fields = [[CompanyTitle, companyFields], [ContactTitle, contactFields]]

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
            title={t('/clients.confirm-deletion')}
            onConfirm={deleteClient}
            okText={t('yes')}
            cancelText={t('no')}
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              {t('delete')}
            </Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(EditClient)
