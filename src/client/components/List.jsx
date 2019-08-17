import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Table from 'antd/es/table'
import omit from 'lodash/fp/omit'

import Container from '../../common/components/Container'
import {useNotification} from '../../utils/notification'
import {useClients} from '../hooks'
import $client from '../service'

const alphabeticSort = key => (a, b) => a[key].localeCompare(b[key])

function ClientList(props) {
  const clients = useClients()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState()
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
      width: '40%',
      sorter: alphabeticSort('name'),
    },
    {
      title: <strong>{t('email')}</strong>,
      dataIndex: 'email',
      key: 'email',
      sorter: alphabeticSort('email'),
      width: '30%',
    },
    {
      title: <strong>{t('phone')}</strong>,
      dataIndex: 'phone',
      key: 'phone',
      sorter: alphabeticSort('phone'),
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
      fixed: 'right',
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

  const dataSource = clients
    .map(client => ({...client, key: client.id}))
    .filter(client => !search || JSON.stringify(client).indexOf(search) > -1)

  return (
    <Container>
      <h1>{t('clients')}</h1>

      <Input.Search
        autoFocus
        placeholder={t('search')}
        onSearch={search => setSearch(search.trim())}
        style={{marginBottom: 16}}
      />

      <Table
        bordered
        size="small"
        pagination={pagination}
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowKey={record => record.id}
        onRow={record => ({
          onClick: () => props.history.push(`/clients/${record.id}`, {...omit('key', record)}),
        })}
        bodyStyle={{background: '#ffffff', cursor: 'pointer'}}
      />
    </Container>
  )
}

export default Form.create()(ClientList)
