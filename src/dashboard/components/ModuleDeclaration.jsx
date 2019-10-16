import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import moment from 'moment'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Modal from 'antd/es/modal'
import Radio from 'antd/es/radio'
import Row from 'antd/es/row'
import Table from 'antd/es/table'
import Tooltip from 'antd/es/tooltip'
import compact from 'lodash/fp/compact'
import find from 'lodash/fp/find'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'
import pipe from 'lodash/fp/pipe'
import sumBy from 'lodash/fp/sumBy'
import upperFirst from 'lodash/fp/upperFirst'

import DatePicker from '../../common/components/DatePicker'
import {validateFields, FormCardTitle} from '../../common/components/FormCard'
import {toEuro} from '../../utils/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../../document/hooks'
import $document from '../../document/service'

import styles from './ModuleTurnover.styles'

const dateSort = key => (a, b) => DateTime.fromISO(a[key]) - DateTime.fromISO(b[key])

function ModuleDeclaration(props) {
  const {getFieldDecorator} = props.form
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [type, setType] = useState('urssaf')
  const tryAndNotify = useNotification()
  const [loading, setLoading] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const {t, i18n} = useTranslation()

  if (!profile || !clients || !documents) {
    return null
  }

  function handleChangeType(event) {
    setType(event.target.value)
  }

  const columns = [
    {
      title: <strong>{t('number')}</strong>,
      dataIndex: 'number',
      width: '30%',
    },
    {
      title: <strong>{t('client')}</strong>,
      dataIndex: 'client',
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
      width: '20%',
      align: 'right',
      render: (_, {totalHT}) => toEuro(totalHT),
    },
  ]

  const dataSource = documents.filter(d => {
    if (d.imported) return false
    if (d.type !== 'invoice') return false
    return d.paidAt && !d[`declared${upperFirst(type)}At`]
  })

  async function declareDocuments() {
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const {date: nextDate} = await validateFields(props.form)
      await Promise.all(
        documents.map(d =>
          $document.set({...d, [`declared${upperFirst(type)}At`]: nextDate.toISOString()}),
        ),
      )

      setConfirmVisible(false)
      return t('/documents.declared-successfully')
    })

    setLoading(false)
  }

  const footer = (
    <Button.Group>
      <Button onClick={() => setConfirmVisible(false)} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button
        type="primary"
        htmlType="submit"
        onClick={declareDocuments}
        disabled={loading}
        style={{marginLeft: 4}}
      >
        {loading && <Icon type="loading" />}
        {t('confirm')}
      </Button>
    </Button.Group>
  )

  function handleSelectionChange(documentsId) {
    const foundDocuments = documentsId.map(id => find({id}, documents))
    setSelectedDocuments(compact(foundDocuments))
  }

  return (
    <>
      <Card
        title={
          <div style={{display: 'flex', alignItems: 'center', flexWrap: 'wrap'}}>
            <div>
              <FormCardTitle title="current-declaration" />
              <Radio.Group value={type} onChange={handleChangeType}>
                <Radio value="urssaf">{t('urssaf')}</Radio>
                <Radio value="vat" disabled={!profile.taxId}>
                  {t('vat')}
                </Radio>
              </Radio.Group>
            </div>
            <Tooltip title={t('/dashboard.current-declaration')}>
              <Icon
                type="question-circle-o"
                style={{alignSelf: 'flex-start', margin: '6px 0 0 12px'}}
              />
            </Tooltip>
            <div style={{flex: 1, textAlign: 'right'}}>
              <Button
                type="primary"
                onClick={() => setConfirmVisible(true)}
                disabled={isEmpty(dataSource)}
              >
                {isEmpty(selectedDocuments)
                  ? t('declare-all')
                  : t('declare', {amount: toEuro(sumBy('totalHT', selectedDocuments))})}
              </Button>
            </div>
          </div>
        }
        bodyStyle={{...styles.card, padding: 0, minHeight: 'auto'}}
      >
        <Table
          rowSelection={{onChange: handleSelectionChange}}
          className="ant-table-no-border"
          style={{width: '100%', marginTop: 1}}
          pagination={false}
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
        />
      </Card>

      <Modal
        title={t('please-confirm-information')}
        visible={confirmVisible}
        footer={footer}
        onCancel={() => !loading && setConfirmVisible(false)}
        closable={!loading}
      >
        <Form noValidate layout="vertical">
          <Row gutter={15}>
            <Col xs={24}>
              <Form.Item label={t(kebabCase(`declared-${type}-at`))}>
                {getFieldDecorator('date', {
                  initialValue: moment(),
                  rules: [{required: true, message: t('field-required')}],
                })(<DatePicker />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create()(ModuleDeclaration)
