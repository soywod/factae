import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Table from 'antd/es/table'
import omit from 'lodash/fp/omit'

import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {useClients} from '../hooks'
import $client from '../service'

function ClientList(props) {
  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({})

  const tryAndNotify = useNotification()
  const {t} = useTranslation()

  useEffect(() => {
    if (clients) {
      setPagination({...pagination, total: clients.length})
    }
  }, [clients])

  if (!clients) {
    return null
  }

  const columns = [
    {
      title: <strong>{t('name')}</strong>,
      dataIndex: 'name',
      key: 'name',
      width: '35%',
    },
    {
      title: <strong>{t('email')}</strong>,
      dataIndex: 'email',
      key: 'email',
      width: '30%',
    },
    {
      title: <strong>{t('phone')}</strong>,
      dataIndex: 'phone',
      key: 'phone',
      width: '30%',
    },
    {
      title: (
        <Button type="primary" shape="circle" onClick={createClient}>
          <Icon type="plus" />
        </Button>
      ),
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: '5%',
      render: () => (
        <Button type="link" size="small" shape="circle">
          <Icon type="edit" />
        </Button>
      ),
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
        pagination={pagination}
        loading={loading}
        dataSource={clients.map(client => ({...client, key: client.id}))}
        columns={columns}
        rowKey={record => record.id}
        onRow={record => ({
          onClick: () => props.history.push(`/clients/${record.id}`, {...omit('key', record)}),
        })}
        style={{background: '#ffffff'}}
        bodyStyle={{cursor: 'pointer'}}
      />
    </Container>
  )
}

export default Form.create()(ClientList)
