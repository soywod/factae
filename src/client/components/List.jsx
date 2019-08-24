import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import Table from 'antd/es/table'
import omit from 'lodash/fp/omit'

import Title from '../../common/components/Title'
import Container from '../../common/components/Container'
import {useClients} from '../hooks'
import $client from '../service'

const alphabeticSort = key => (a, b) => a[key].localeCompare(b[key])

function ClientList(props) {
  const clients = useClients()
  const [search, setSearch] = useState()
  const [pagination, setPagination] = useState({})
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
      title: '',
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

  function createClient() {
    const client = {id: $client.generateId()}
    props.history.push(`/clients/${client.id}`, client)
  }

  const dataSource = clients
    .map(client => ({...client, key: client.id}))
    .filter(client => !search || JSON.stringify(client).indexOf(search) > -1)

  return (
    <Container>
      <Title label="clients">
        <Button type="primary" onClick={createClient}>
          <Icon type="plus" />
          {t('new')}
        </Button>
      </Title>

      <Input.Search
        size="large"
        placeholder={t('search')}
        onSearch={search => setSearch(search.trim())}
        style={{marginBottom: 16}}
      />

      <Table
        pagination={pagination}
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
