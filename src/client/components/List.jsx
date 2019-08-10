import React, {useState} from 'react'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Table from 'antd/es/table'
import omit from 'lodash/fp/omit'

import {notify} from '../../utils/notification'
import Container from '../../common/components/Container'
import {useClients} from '../hooks'
import $client from '../service'

const columns = [
  {
    title: <strong>Nom commercial</strong>,
    dataIndex: 'tradingName',
    key: 'tradingName',
  },
  {
    title: <strong>Prénom</strong>,
    dataIndex: 'firstName',
    key: 'firstName',
  },
  {
    title: <strong>Nom</strong>,
    dataIndex: 'lastName',
    key: 'lastName',
  },
  {
    title: <strong>Email</strong>,
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

  async function createClient() {
    setLoading(true)

    try {
      const id = await $client.create()
      notify.success('Client créé avec succès.')
      props.history.push(`/clients/${id}`, {id})
    } catch (error) {
      notify.error(error.message)
    }
  }

  return (
    <Container>
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
        style={{background: '#ffffff', marginBottom: 25}}
        bodyStyle={{cursor: 'pointer'}}
      />

      <div style={{textAlign: 'right'}}>
        <Button type="primary" disabled={loading} onClick={createClient}>
          <Icon type={loading ? 'loading' : 'plus'} />
          Nouveau
        </Button>
      </div>
    </Container>
  )
}

export default Form.create()(ClientList)
