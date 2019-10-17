import React, {forwardRef, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Card from 'antd/lib/card'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Popconfirm from 'antd/lib/popconfirm'
import Row from 'antd/lib/row'
import find from 'lodash/fp/find'

import EditableTable from '../../common/components/EditableTable'
import Title from '../../common/components/Title'
import {validateFields} from '../../common/components/FormCard'
import FormItems from '../../common/components/FormItems'
import {useNotification} from '../../utils/notification'
import {useClients} from '../hooks'
import $client from '../service'

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
      width: '34%',
      EditField: forwardRef(({save, blur, ...props}, ref) => (
        <Input ref={ref} onPressEnter={save} {...props} />
      )),
    },
    {
      title: <strong>{t('email')}</strong>,
      dataIndex: 'email',
      key: 'email',
      width: '33%',
      EditField: forwardRef(({save, blur, ...props}, ref) => (
        <Input ref={ref} onPressEnter={save} {...props} />
      )),
    },
    {
      title: <strong>{t('phone')}</strong>,
      dataIndex: 'phone',
      key: 'phone',
      width: '33%',
      EditField: forwardRef(({save, blur, ...props}, ref) => (
        <Input ref={ref} onPressEnter={save} {...props} />
      )),
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
    <Form noValidate layout="vertical" onSubmit={saveClient}>
      <Title label={t('client')}>
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
          <Button type="primary" htmlType="submit" disabled={loading} style={{marginLeft: 4}}>
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </Button.Group>
      </Title>

      <Row gutter={24}>
        <Col lg={6}>
          <FormItems form={props.form} model={client} fields={companyFields} />
        </Col>
        <Col lg={18}>
          <Form.Item label={t('contacts')} required>
            <Card bodyStyle={{padding: 0}}>
              <EditableTable
                size="small"
                pagination={false}
                bodyStyle={{margin: 0}}
                dataSource={contacts}
                columns={columns}
                onSave={saveContacts}
              />
            </Card>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default Form.create()(EditClient)
