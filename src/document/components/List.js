import React, {useState} from 'react'
import Table from 'antd/es/table'
import Button from 'antd/es/button'
import Menu from 'antd/es/menu'
import Dropdown from 'antd/es/dropdown'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import omit from 'lodash/fp/omit'
import find from 'lodash/fp/find'

import {useDocuments} from '../hooks'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {create} from '../service'
import Container from '../../common/components/Container'

function DocumentList(props) {
  const profile = useProfile()
  const documents = useDocuments()
  const clients = useClients()
  const [loading, setLoading] = useState(false)

  async function handleCreate(e) {
    setLoading(true)

    let rawDocument = {type: e.key, taxRate: profile.taxRate}

    switch (e.key) {
      case 'quotation':
        rawDocument.conditions = profile.quotationConditions
        break

      case 'invoice':
        rawDocument.conditions = profile.invoiceConditions
        break

      case 'credit':
        rawDocument.conditions = profile.invoiceConditions
        break

      default:
    }

    const document = await create(rawDocument)
    props.history.push(`/documents/${document.id}`, document)
  }

  if (!clients || !documents) {
    return null
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: type => {
        switch (type) {
          case 'quotation':
            return 'Devis'
          case 'invoice':
            return 'Facture'
          case 'credit':
            return 'Avoir'
          default:
            return ''
        }
      },
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: id => {
        const client = find({id}, clients)
        return client.tradingName || client.email
      },
    },
  ]

  return (
    <Container>
      <Table
        loading={loading}
        dataSource={documents.map(document => ({...document, key: document.id}))}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        style={{background: '#ffffff', marginBottom: 25}}
        onRow={record => ({
          onClick: () => props.history.push(`/documents/${record.id}`, {...omit('key', record)}),
        })}
      />

      <div style={{textAlign: 'right'}}>
        <Dropdown
          overlay={
            <Menu onClick={handleCreate}>
              <Menu.Item key="quotation">Devis</Menu.Item>
              <Menu.Item key="invoice">Facture</Menu.Item>
              <Menu.Item key="credit">Avoir</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" disabled={loading || !profile}>
            <Icon type="plus" />
            Nouveau
          </Button>
        </Dropdown>
      </div>
    </Container>
  )
}

export default Form.create()(DocumentList)
