import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Table from 'antd/es/table'
import omit from 'lodash/fp/omit'

import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {useClients} from '../hooks'
import $client from '../service'

function ClientList(props) {
  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()

  if (!clients) {
    return null
  }

  const columns = [
    {
      title: <strong>{t('trading-name')}</strong>,
      dataIndex: 'tradeName',
      key: 'tradeName',
    },
    {
      title: <strong>{t('first-name')}</strong>,
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: <strong>{t('last-name')}</strong>,
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: <strong>{t('email')}</strong>,
      dataIndex: 'email',
      key: 'email',
    },
  ]

  async function createClient() {
    await tryAndNotify(
      async () => {
        setLoading(true)
        const id = await $client.create()
        props.history.push(`/clients/${id}`, {id})
        return t('/clients.created-successfully')
      },
      () => setLoading(false),
    )
  }

  return (
    <Container>
      <h1>{t('clients')}</h1>

      <Table
        bordered
        loading={loading}
        dataSource={clients.map(client => ({...client, key: client.id}))}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        onRow={record => ({
          onClick: () => props.history.push(`/clients/${record.id}`, {...omit('key', record)}),
        })}
        style={{background: '#ffffff', marginBottom: 15}}
        bodyStyle={{cursor: 'pointer'}}
      />

      <ActionBar>
        <Button type="primary" disabled={loading} onClick={createClient}>
          <Icon type={loading ? 'loading' : 'plus'} />
          {t('new')}
        </Button>
      </ActionBar>
    </Container>
  )
}

export default Form.create()(ClientList)
