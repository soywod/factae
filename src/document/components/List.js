import React, {useState} from 'react'
import AntdTag from 'antd/es/tag'
import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Menu from 'antd/es/menu'
import Table from 'antd/es/table'
import Tooltip from 'antd/es/tooltip'
import find from 'lodash/fp/find'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import orderBy from 'lodash/fp/orderBy'
import pipe from 'lodash/fp/pipe'
import {DateTime} from 'luxon'

import {useNotification} from '../../utils/notification'
import Container from '../../common/components/Container'
import {toEuro} from '../../common/currency'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const Tag = ({children, ...props}) => (
  <AntdTag {...props} style={{float: 'right'}}>
    {children}
  </AntdTag>
)

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const tryAndNotify = useNotification()

  async function createDocument(event) {
    await tryAndNotify(
      async () => {
        setLoading(true)
        let document = {
          type: event.key,
          createdAt: DateTime.local().toISO(),
          status: 'draft',
          taxRate: profile.taxRate,
          total: 0,
        }

        switch (event.key) {
          case 'quotation':
            document.rate = profile.rate
            document.rateUnit = profile.rateUnit
            document.conditions = profile.quotationConditions
            break

          case 'invoice':
            document.conditions = profile.invoiceConditions
            break

          case 'credit':
            document.invoiceNumber = ''
            document.conditions = profile.invoiceConditions
            break

          default:
        }

        const id = await $document.create(document)
        props.history.push(`/documents/${id}`, {...document, id})
        return 'Document créé avec succès.'
      },
      () => setLoading(false),
    )
  }

  if (!profile || !clients || !documents) {
    return null
  }

  const columns = [
    {
      title: <strong>Titre</strong>,
      dataIndex: 'type',
      key: 'type',
      width: '25%',
      render: (_, {type, status}) => (
        <>
          {type === 'quotation' && 'Devis'}
          {type === 'invoice' && 'Facture'}
          {type === 'credit' && 'Avoir'}
          {status === 'draft' && <Tag>brouillon</Tag>}
          {status === 'sent' && <Tag color="blue">envoyé</Tag>}
          {status === 'signed' && <Tag color="green">signé</Tag>}
          {status === 'paid' && <Tag color="green">payé</Tag>}
          {status === 'refunded' && <Tag color="green">remboursé</Tag>}
        </>
      ),
    },
    {
      title: <strong>Client</strong>,
      dataIndex: 'client',
      key: 'client',
      width: '35%',
      render: id => {
        const client = find({id}, clients)
        return client ? client.tradingName || client.email : ''
      },
    },
    {
      title: <strong>Date</strong>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '20%',
      render: dateISO => {
        const createdAt = DateTime.fromISO(dateISO, {locale: 'fr'})

        return (
          <Tooltip title={createdAt.toFormat("'Le' d LLL yyyy 'à' HH'h'mm")}>
            {createdAt.toRelative({locale: 'fr'})}
          </Tooltip>
        )
      },
    },
    {
      title: <strong>Total HT</strong>,
      dataIndex: 'total',
      key: 'total',
      width: '20%',
      align: 'right',
      render: (_, {totalHT}) => toEuro(totalHT),
    },
  ]

  const dataSource = pipe([
    orderBy('createdAt', 'desc'),
    map(document => ({...document, key: document.id})),
  ])

  return (
    <Container>
      <h1>Documents</h1>
      <Table
        bordered
        loading={loading}
        dataSource={dataSource(documents)}
        columns={columns}
        pagination={false}
        rowKey={record => record.id}
        onRow={record => ({
          onClick: () => props.history.push(`/documents/${record.id}`, {...omit('key', record)}),
        })}
        style={{background: '#ffffff', marginBottom: 15}}
        bodyStyle={{cursor: 'pointer'}}
      />

      <div style={{textAlign: 'right'}}>
        <Dropdown
          disabled={loading || !profile}
          overlay={
            <Menu onClick={createDocument}>
              <Menu.Item key="quotation">Devis</Menu.Item>
              <Menu.Item key="invoice">Facture</Menu.Item>
              <Menu.Item key="credit">Avoir</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary">
            <Icon type={loading ? 'loading' : 'plus'} />
            Nouveau
          </Button>
        </Dropdown>
      </div>
    </Container>
  )
}

export default Form.create()(DocumentList)
