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

import EditableTable from '../../common/components/EditableTable'
import Title from '../../common/components/Title'
import {validateFields} from '../../common/components/FormCard'
import FormItems from '../../common/components/FormItems'
import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {useClients} from '../hooks'
import $client from '../service'

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 24},
    md: {span: 24},
    lg: {span: 5},
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 24},
    md: {span: 24},
    lg: {span: 19},
  },
}

const styles = {
  title: {
    fontSize: '1.2rem',
    margin: '0 0 15px 0',
  },
}

function EditClient(props) {
  const {form} = props
  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(props.location.state)
  const [contacts, setContacts] = useState(client.contacts || [])
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  useEffect(() => {
    if (clients && !client) {
      const nextClient = find({id: props.match.params.id}, clients)
      setClient(nextClient || {})
      setContacts(nextClient.contacts || [])
    }
  }, [client, clients, props.match.params.id])

  const columns = [
    {
      title: <strong style={{marginLeft: 16}}>{t('name')}</strong>,
      dataIndex: 'name',
      key: 'name',
      editable: true,
      width: '34%',
    },
    {
      title: <strong>{t('email')}</strong>,
      dataIndex: 'email',
      key: 'email',
      editable: true,
      width: '33%',
    },
    {
      title: <strong>{t('phone')}</strong>,
      dataIndex: 'phone',
      key: 'phone',
      editable: true,
      width: '33%',
    },
    {
      title: (
        <Button type="primary" shape="circle" onClick={addContact}>
          <Icon type="plus" />
        </Button>
      ),
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      align: 'right',
      render: (_, {key}) => (
        <Button type="danger" shape="circle" onClick={() => removeContact(key)}>
          <Icon type="minus" />
        </Button>
      ),
    },
  ]

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
      let nextClient = await validateFields(form)
      nextClient.id = client.id
      nextClient.contacts = contacts
      setClient(nextClient)
      await $client.set(nextClient)
      return t('/clients.updated-successfully')
    })

    setLoading(false)
  }

  function addContact() {
    setContacts([
      ...contacts,
      {
        key: Date.now(),
        name: '',
        email: '',
        phone: '',
      },
    ])
  }

  function saveContacts(nextContact) {
    const prevContactIndex = contacts.findIndex(item => nextContact.key === item.key)
    const prevContact = contacts[prevContactIndex]

    contacts.splice(prevContactIndex, 1, {
      ...prevContact,
      ...nextContact,
    })

    setContacts([...contacts])
  }

  function removeContact(key) {
    setContacts(contacts.filter(item => item.key !== key))
  }

  if (!clients || !client) {
    return null
  }

  const companyFields = [
    {name: 'name', Component: <Input size="large" autoFocus />, ...requiredRules},
    {name: 'address', ...requiredRules},
    {name: 'zip', ...requiredRules},
    {name: 'city', ...requiredRules},
    {name: 'country', ...requiredRules},
  ]

  return (
    <Container>
      <Form noValidate {...formItemLayout} onSubmit={saveClient}>
        <Title label="client">
          <Button.Group>
            <Popconfirm
              title={t('/clients.confirm-deletion')}
              onConfirm={deleteClient}
              okText={t('yes')}
              cancelText={t('no')}
            >
              <Button type="danger" disabled={loading}>
                <Icon type="delete" />
                {t('delete')}
              </Button>
            </Popconfirm>
            <Button type="primary" htmlType="submit" disabled={loading}>
              <Icon type={loading ? 'loading' : 'save'} />
              {t('save')}
            </Button>
          </Button.Group>
        </Title>

        <Card>
          <Row gutter={24}>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Typography.Title level={2} style={styles.title}>
                {t('client-identity')}
              </Typography.Title>
              <FormItems form={form} model={client} fields={companyFields} />
            </Col>
            <Col xs={24} sm={24} md={24} lg={12}>
              <Typography.Title level={2} style={styles.title}>
                {t('contacts')}
              </Typography.Title>
              <EditableTable
                size="small"
                pagination={false}
                bodyStyle={{margin: 0}}
                dataSource={contacts}
                columns={columns}
                onSave={saveContacts}
              />
            </Col>
          </Row>
        </Card>
      </Form>
    </Container>
  )
}

export default Form.create()(EditClient)
