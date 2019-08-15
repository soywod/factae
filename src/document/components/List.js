import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
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

import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import {toEuro} from '../../common/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const Tag = ({children, ...props}) => (
  <AntdTag {...props} style={{float: 'right', textTransform: 'lowercase'}}>
    {children}
  </AntdTag>
)

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const tryAndNotify = useNotification()
  const {t, i18n} = useTranslation()

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
        return t('/documents.created-successfully')
      },
      () => setLoading(false),
    )
  }

  if (!profile || !clients || !documents) {
    return null
  }

  const columns = [
    {
      title: <strong>{t('type')}</strong>,
      dataIndex: 'type',
      key: 'type',
      width: '25%',
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
      width: '35%',
      render: id => {
        const client = find({id}, clients)
        return client ? client.tradeName || client.email : ''
      },
    },
    {
      title: <strong>{t('date')}</strong>,
      dataIndex: 'createdAt',
      key: 'createdAt',
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
      <h1>{t('documents')}</h1>

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

      <ActionBar>
        <Dropdown
          disabled={loading || !profile}
          overlay={
            <Menu onClick={createDocument}>
              <Menu.Item key="quotation">{t('quotation')}</Menu.Item>
              <Menu.Item key="invoice">{t('invoice')}</Menu.Item>
              <Menu.Item key="credit">{t('credit')}</Menu.Item>
            </Menu>
          }
        >
          <Button type="primary">
            <Icon type={loading ? 'loading' : 'plus'} />
            {t('new')}
          </Button>
        </Dropdown>
      </ActionBar>
    </Container>
  )
}

export default Form.create()(DocumentList)
