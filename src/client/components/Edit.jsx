import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Popconfirm from 'antd/es/popconfirm'
import find from 'lodash/fp/find'

import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {difference} from '../../utils/lodash'
import {useClients} from '../hooks'
import $client from '../service'

function EditClient(props) {
  const {match} = props
  const {getFieldDecorator} = props.form
  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [client, setClient] = useState(props.location.state)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}
  const emailRules = {rules: [{type: 'email', message: t('email-invalid')}]}

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
      const nextClient = await validateFields(props.form)
      await $client.update({id: client.id, ...difference(nextClient, client)})
      return t('/clients.updated-successfully')
    })

    setLoading(false)
  }

  if (!clients || !client) {
    return null
  }

  const companyFields = {
    title: <FormCardTitle title="company" />,
    fields: [
      {name: 'name', Component: <Input autoFocus />, ...requiredRules},
      {name: 'siret'},
      {name: 'email', ...emailRules},
      {name: 'phone'},
    ],
  }

  const addressFields = {
    title: <FormCardTitle title="address" />,
    fields: [
      {name: 'address', ...requiredRules},
      {name: 'zip', ...requiredRules},
      {name: 'city', ...requiredRules},
      {name: 'country', ...requiredRules},
    ],
  }

  const fields = [companyFields, addressFields]

  return (
    <Container>
      <h1>{t('client')}</h1>

      <Form onSubmit={saveClient}>
        {fields.map((props, key) => (
          <FormCard key={key} getFieldDecorator={getFieldDecorator} model={client} {...props} />
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
