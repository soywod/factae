import React, {useState} from 'react'
import Table from 'antd/es/table'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import omit from 'lodash/fp/omit'

import {useClients} from '../hooks'
import {create} from '../service'
import Container from '../../common/components/Container'

const columns = [
  {
    title: 'Nom commercial',
    dataIndex: 'tradingName',
    key: 'tradingName',
  },
  {
    title: 'Prénom',
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: 'Nom',
    dataIndex: 'lastName',
    key: 'lastName',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
]

function ClientList(props) {
  const clients = useClients()
  const [loading, setLoading] = useState(false)

  if (!clients) {
    return null
  }

  async function handleCreate() {
    setLoading(true)
    const id = await create()
    props.history.push(`/clients/${id}`, {id})
  }

  return (
    <Container>
      <Table
        loading={loading}
        dataSource={clients.map(client => ({...client, key: client.id}))}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        style={{background: '#ffffff', marginBottom: 25}}
        onRow={record => ({
          onClick: () => props.history.push(`/clients/${record.id}`, {...omit('key', record)}),
        })}
      />

      <div style={{textAlign: 'right'}}>
        <Button type="primary" disabled={loading} onClick={handleCreate}>
          <Icon type="plus" />
          Nouveau
        </Button>
      </div>
    </Container>
  )
}

export default Form.create()(ClientList)
