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

import Container from '../../common/components/Container'
import {toEuro} from '../../common/currency'
import {useDocuments} from '../../document/hooks'
import {useRecords} from '../hooks'
import $record from '../service'

const alphabeticSort = key => (a, b) => a[key] && b[key] && a[key].localeCompare(b[key])

const CustomTag = ({children, ...props}) => (
  <Tag {...props} style={{float: 'right', textTransform: 'lowercase'}}>
    {children}
  </Tag>
)

function RecordList(props) {
  const records = useRecords()
  const documents = useDocuments()
  const [pagination, setPagination] = useState({})
  const {t, i18n} = useTranslation()

  useEffect(() => {
    if (records) {
      setPagination({...pagination, total: records.length})
    }
  }, [records])

  if (!records || !documents) {
    return null
  }

  const columns = [
    {
      title: <strong>{t('client')}</strong>,
      dataIndex: 'client',
      key: 'client',
      sorter: alphabeticSort('client'),
      width: '25%',
    },
    {
      title: <strong>{t('nature')}</strong>,
      dataIndex: 'nature',
      key: 'nature',
      sorter: alphabeticSort('nature'),
      width: '35%',
      render: (_, {nature, type}) => (
        <>
          {nature}
          <CustomTag color={type === 'revenue' ? 'green' : 'red'}>{t(type)}</CustomTag>
        </>
      ),
    },
    {
      title: <strong>{t('date')}</strong>,
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: alphabeticSort('createdAt'),
      width: '20%',
      render: createdAtISO => {
        const createdAt = DateTime.fromISO(createdAtISO, {locale: i18n.language})

        return (
          <Tooltip title={createdAt.toFormat(t('date-format'))}>
            {createdAt.toRelative({locale: i18n.language})}
          </Tooltip>
        )
      },
    },
    {
      title: <strong>{t('total-ht')}</strong>,
      dataIndex: 'totalHT',
      key: 'totalHT',
      sorter: (a, b) => a.totalHT - b.totalHT,
      width: '20%',
      align: 'right',
      render: (_, {type, totalHT}) => {
        let style = {fontWeight: 'bold'}
        let sign = ''

        const isRevenue = type === 'revenue'
        const isPurchase = type === 'purchase'
        const isPositive = totalHT > 0
        const isNegative = totalHT < 0

        if ((isRevenue && isPositive) || (isPurchase && isNegative)) {
          style.color = '#52c41a'
          sign = '+ '
        } else if ((isRevenue && isNegative) || (isPurchase && isPositive)) {
          style.color = '#f5222d'
          sign = '- '
        }

        return (
          <span style={style}>
            {sign}
            {toEuro(Math.abs(totalHT || 0))}
          </span>
        )
      },
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

  function createRecord() {
    const record = {id: $record.generateId()}
    props.history.push(`/records/${record.id}`, record)
  }

  const dataSource = records.map(record => ({...record, key: record.id}))

  return (
    <Container>
      <h1 style={{display: 'flex', alignItems: 'center'}}>
        <span style={{flex: 1}}>{t('records')}</span>
        <Button type="primary" onClick={createRecord}>
          <Icon type="plus" />
          {t('new')}
        </Button>
      </h1>

      <Table
        bordered
        pagination={pagination}
        dataSource={dataSource}
        columns={columns}
        rowKey={row => row.id}
        onRow={row => ({
          onClick: () => {
            if (row.document) {
              const document = find({id: row.document}, documents)
              props.history.push(`/documents/${row.document}`, document)
            } else {
              const record = find({id: row.id}, records)
              props.history.push(`/records/${record.id}`, record)
            }
          },
        })}
        bodyStyle={{background: '#ffffff', cursor: 'pointer'}}
      />
    </Container>
  )
}

export default Form.create()(RecordList)
