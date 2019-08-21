import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import AntdTag from 'antd/es/tag'
import Button from 'antd/es/button'
import Dropdown from 'antd/es/dropdown'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Menu from 'antd/es/menu'
import Table from 'antd/es/table'
import Tooltip from 'antd/es/tooltip'
import find from 'lodash/fp/find'
import isEmpty from 'lodash/fp/isEmpty'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import orderBy from 'lodash/fp/orderBy'
import pipe from 'lodash/fp/pipe'

import Container from '../../common/components/Container'
import {toEuro} from '../../common/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {isProfileValid} from '../../profile/utils'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const Tag = ({children, ...props}) => (
  <AntdTag {...props} style={{float: 'right', textTransform: 'lowercase'}}>
    {children}
  </AntdTag>
)

const alphabeticSort = key => (a, b) => a[key].localeCompare(b[key])

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({})
  const tryAndNotify = useNotification()
  const {t, i18n} = useTranslation()

  async function createDocument(event) {
    await tryAndNotify(
      async () => {
        if (!isProfileValid(profile)) throw new Error('/profile.error-invalid')
        if (isEmpty(clients)) throw new Error('/clients.error-empty')

        setLoading(true)

        const now = DateTime.local()
        let document = {
          type: event.key,
          createdAt: now.toISO(),
          status: 'draft',
          taxRate: profile.taxRate,
          total: 0,
        }

        switch (event.key) {
          case 'quotation':
            document.conditions = profile.quotationConditions
            document.expiresAt = now.plus({days: 60}).toISO()
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
        return t('/documents.created-successfully')
      },
      () => setLoading(false),
    )
  }

  useEffect(() => {
    if (documents) {
      setPagination({...pagination, total: documents.length})
    }
  }, [documents])

  if (!profile || !clients || !documents) {
    return null
  }

  const columns = [
    {
      title: <strong>{t('type')}</strong>,
      dataIndex: 'type',
      key: 'type',
      width: '30%',
      sorter: alphabeticSort('type'),
      filters: ['quotation', 'invoice', 'credit'].map(document => ({
        text: t(document),
        value: document,
      })),
      onFilter: (value, record) => record.type.indexOf(value) === 0,
      render: (_, {type, status}) => (
        <>
          {t(type)}
          {status === 'draft' && <Tag>{t('draft')}</Tag>}
          {status === 'sent' && <Tag color="blue">{t('sent')}</Tag>}
          {status === 'signed' && <Tag color="green">{t('signed')}</Tag>}
          {status === 'paid' && <Tag color="green">{t('paid')}</Tag>}
          {status === 'refunded' && <Tag color="green">{t('refunded')}</Tag>}
        </>
      ),
    },
    {
      title: <strong>{t('client')}</strong>,
      dataIndex: 'client',
      key: 'client',
      filters: clients.map(client => ({
        text: client.name,
        value: client.id,
      })),
      onFilter: (value, record) => record.client === value,
      sorter: alphabeticSort('client'),
      width: '30%',
      render: id => {
        const client = find({id}, clients) || {name: ''}
        return client.name
      },
    },
    {
      title: <strong>{t('date')}</strong>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: alphabeticSort('createdAt'),
      width: '20%',
      render: dateISO => {
        const createdAt = DateTime.fromISO(dateISO, {locale: i18n.language})

        return (
          <Tooltip title={createdAt.toFormat(t('date-format'))}>
            {createdAt.toRelative({locale: i18n.language})}
          </Tooltip>
        )
      },
    },
    {
      title: <strong>{t('total-without-taxes')}</strong>,
      dataIndex: 'total',
      key: 'total',
      sorter: (a, b) => a.totalHT - b.totalHT,
      width: '20%',
      align: 'right',
      render: (_, {totalHT}) => toEuro(totalHT),
    },
    {
      title: (
        <Dropdown
          disabled={loading || !profile}
          placement="bottomCenter"
          overlay={
            <Menu onClick={createDocument}>
              <Menu.Item key="quotation">{t('quotation')}</Menu.Item>
              <Menu.Item key="invoice">{t('invoice')}</Menu.Item>
              <Menu.Item key="credit">{t('credit')}</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" shape="circle">
            <Icon type="plus" />
          </Button>
        </Dropdown>
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

  const dataSource = pipe([
    orderBy('createdAt', 'desc'),
    map(document => ({...document, key: document.id})),
  ])

  return (
    <Container>
      <h1>{t('documents')}</h1>

      <Table
        bordered
        size="small"
        pagination={pagination}
        loading={loading}
        dataSource={dataSource(documents)}
        columns={columns}
        rowKey={record => record.id}
        onRow={record => ({
          onClick: () => props.history.push(`/documents/${record.id}`, {...omit('key', record)}),
        })}
        bodyStyle={{background: '#ffffff', cursor: 'pointer'}}
      />
    </Container>
  )
}

export default Form.create()(DocumentList)
