import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Table from 'antd/lib/table'
import Tag from 'antd/lib/tag'
import Tooltip from 'antd/lib/tooltip'
import find from 'lodash/fp/find'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import map from 'lodash/fp/map'
import omit from 'lodash/fp/omit'
import orderBy from 'lodash/fp/orderBy'
import pipe from 'lodash/fp/pipe'

import Title from '../../common/components/Title'
import {toEuro} from '../../utils/currency'
import {useOnboarding} from '../../utils/onboarding'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const alphabeticSort = key => (a, b) => a[key].localeCompare(b[key])
const dateSort = key => (a, b) => DateTime.fromISO(a[key]) - DateTime.fromISO(b[key])

const CustomTag = ({children, ...props}) => (
  <Tag {...props} style={{float: 'right', cursor: 'inherit', textTransform: 'lowercase'}}>
    {children}
  </Tag>
)

function DocumentList(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [pagination, setPagination] = useState({})
  const tryAndNotify = useNotification()
  const onboarding = useOnboarding()
  const {t, i18n} = useTranslation()

  useEffect(() => {
    if (documents) {
      setPagination({...pagination, total: documents.length})
    }
  }, [documents])

  if (!onboarding || !profile || !clients || !documents) {
    return null
  }

  async function importDocument() {
    await tryAndNotify(() => {
      if (!onboarding.hasValidProfile) throw new Error('/profile.error-invalid')
      if (isEmpty(clients)) throw new Error('/clients.error-empty')

      const now = DateTime.local()
      const document = {
        id: $document.generateId(),
        type: 'invoice',
        createdAt: now.toISO(),
        imported: true,
      }

      props.history.push(`/documents/${document.id}`, document)
    })
  }

  async function createDocument() {
    await tryAndNotify(() => {
      if (!onboarding.hasValidProfile) throw new Error('/profile.error-invalid')
      if (isEmpty(clients)) throw new Error('/clients.error-empty')

      const now = DateTime.local()
      const document = {
        id: $document.generateId(),
        type: 'quotation',
        createdAt: now.toISO(),
        taxRate: profile.taxRate,
        conditions: profile.quotationConditions,
        expiresIn: 60,
        paymentDeadlineAt: now.plus({days: 30}).toISO(),
      }

      props.history.push(`/documents/${document.id}`, document)
    })
  }

  function getCustomTag(document) {
    if (document.cancelledAt) {
      return <CustomTag color="red">{t('cancelled')}</CustomTag>
    }

    if (document.signedAt) {
      return <CustomTag color="green">{t('signed')}</CustomTag>
    }

    if (document.paidAt) {
      return <CustomTag color="green">{t('paid')}</CustomTag>
    }

    if (document.refundedAt) {
      return <CustomTag color="orange">{t('refunded')}</CustomTag>
    }

    if (document.sentAt) {
      return <CustomTag color="blue">{t('sent')}</CustomTag>
    }
  }

  const columns = [
    {
      title: <strong>{t('number')}</strong>,
      dataIndex: 'number',
      width: '30%',
      sorter: alphabeticSort('number'),
      render: (_, d) => (
        <>
          {d.number || <em className="ant-form-explain">{t(d.type)}</em>}
          {getCustomTag(d)}
        </>
      ),
    },
    {
      title: <strong>{t('client')}</strong>,
      dataIndex: 'client',
      sorter: alphabeticSort('client'),
      width: '30%',
      render: (client, document) => {
        if (document.imported) return client
        return pipe([find({id: client}), getOr('', 'name')])(clients)
      },
    },
    {
      title: <strong>{t('date')}</strong>,
      dataIndex: 'updatedAt',
      sorter: dateSort('updatedAt'),
      width: '20%',
      render: dateISO => {
        const date = DateTime.fromISO(dateISO, {locale: i18n.language})

        return (
          <Tooltip title={date.toFormat(t('date-format'))}>
            {date.toRelative({locale: i18n.language})}
          </Tooltip>
        )
      },
    },
    {
      title: <strong>{t('total-ht')}</strong>,
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
    orderBy('updatedAt', 'desc'),
    map(document => ({...document, key: document.id})),
  ])

  return (
    <>
      <Title label={t('quotations-and-invoices')}>
        <Button.Group>
          <Button type="dashed" onClick={importDocument}>
            <Icon type="import" />
            {t('import')}
          </Button>
          <Button type="primary" onClick={createDocument} style={{marginLeft: 4}}>
            <Icon type="plus" />
            {t('new')}
          </Button>
        </Button.Group>
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
    </>
  )
}

export default Form.create()(DocumentList)
