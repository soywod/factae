import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Table from 'antd/es/table'
import Tag from 'antd/es/tag'
import Tooltip from 'antd/es/tooltip'
import find from 'lodash/fp/find'
import isEmpty from 'lodash/fp/isEmpty'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import orderBy from 'lodash/fp/orderBy'
import pipe from 'lodash/fp/pipe'

import Container from '../../common/components/Container'
import Title from '../../common/components/Title'
import {toEuro} from '../../common/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {isProfileValid} from '../../profile/utils'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const alphabeticSort = key => (a, b) => a[key].localeCompare(b[key])

const CustomTag = ({children, ...props}) => (
  <Tag {...props} style={{float: 'right', textTransform: 'lowercase'}}>
    {children}
  </Tag>
)

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [pagination, setPagination] = useState({})
  const tryAndNotify = useNotification()
  const {t, i18n} = useTranslation()

  async function createDocument() {
    await tryAndNotify(() => {
      if (!isProfileValid(profile)) throw new Error('/profile.error-invalid')
      if (isEmpty(clients)) throw new Error('/clients.error-empty')

      const now = DateTime.local()
      const document = {
        id: $document.generateId(),
        type: 'quotation',
        status: 'draft',
        createdAt: now.toISO(),
        taxRate: profile.taxRate,
        conditions: profile.quotationConditions,
        expiresIn: 60,
        paymentDeadlineAt: now.plus({days: 30}).toISO(),
      }

      props.history.push(`/documents/${document.id}`, document)
    })
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
          {status === 'draft' && <CustomTag>{t('draft')}</CustomTag>}
          {status === 'sent' && <CustomTag color="blue">{t('sent')}</CustomTag>}
          {status === 'signed' && <CustomTag color="green">{t('signed')}</CustomTag>}
          {status === 'paid' && <CustomTag color="green">{t('paid')}</CustomTag>}
          {status === 'refunded' && <CustomTag color="green">{t('refunded')}</CustomTag>}
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

  const dataSource = pipe([
    orderBy('createdAt', 'desc'),
    map(document => ({...document, key: document.id})),
  ])

  return (
    <Container>
      <Title label="documents">
        <Button type="primary" onClick={createDocument}>
          <Icon type="plus" />
          {t('new')}
        </Button>
      </Title>

      <Table
        pagination={pagination}
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
