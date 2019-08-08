import React, {useState} from 'react'
import Table from 'antd/es/table'
import Button from 'antd/es/button'
import Menu from 'antd/es/menu'
import Dropdown from 'antd/es/dropdown'
import Form from 'antd/es/form'
import Tag from 'antd/es/tag'
import Icon from 'antd/es/icon'
import omit from 'lodash/fp/omit'
import find from 'lodash/fp/find'
import moment from 'moment'

import {toEuro} from '../../common/currency'
import {useDocuments} from '../hooks'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {create} from '../service'
import Container from '../../common/components/Container'

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)

  async function createDocument(e) {
    setLoading(true)

    let rawDocument = {
      type: e.key,
      createdAt: moment().toISOString(),
      status: 'draft',
      taxRate: profile.taxRate,
      total: 0,
    }

    switch (e.key) {
      case 'quotation':
        rawDocument.rate = profile.rate
        rawDocument.rateUnit = profile.rateUnit
        rawDocument.conditions = profile.quotationConditions
        break

      case 'invoice':
        rawDocument.conditions = profile.invoiceConditions
        break

      case 'credit':
        rawDocument.invoiceNumber = ''
        rawDocument.conditions = profile.invoiceConditions
        break

      default:
    }

    const document = await create(rawDocument)
    props.history.push(`/documents/${document.id}`, document)
  }

  if (!profile || !clients || !documents) {
    return null
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '25%',
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
      width: '30%',
      render: id => {
        const client = find({id}, clients)
        return client ? client.tradingName || client.email : ''
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: '15%',
      render: status => (
        <>
          {status === 'draft' && <Tag>brouillon</Tag>}
          {status === 'sent' && <Tag color="blue">envoyé</Tag>}
          {status === 'signed' && <Tag color="green">signé</Tag>}
          {status === 'paid' && <Tag color="green">payé</Tag>}
          {status === 'refunded' && <Tag color="green">remboursé</Tag>}
        </>
      ),
    },
    {
      title: 'Total (HT)',
      dataIndex: 'total',
      key: 'total',
      width: '30%',
      align: 'right',
      render: (_, {totalHT}) => toEuro(totalHT),
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
            <Menu onClick={createDocument}>
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
