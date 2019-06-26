import React from 'react'
import Table from 'antd/es/table'

import {useClients} from '../hooks'
import Container from '../../common/components/Container'

const styles = {
  table: {
    background: '#ffffff',
    margin: '4px',
  },
}
const columns = [
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Prénom',
    dataIndex: 'firstName',
    key: 'firstName',
  },
]

function ClientList(props) {
  const clients = useClients()

  if (!clients) {
    return null
  }

  const dataSource = clients.map(c => ({...c, key: c.email}))

  return (
    <Container>
      <Table dataSource={dataSource} columns={columns} pagination={false} style={styles.table} />
    </Container>
  )
}

export default ClientList
