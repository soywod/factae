import React, {forwardRef, useState} from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Alert from 'antd/lib/alert'
import Button from 'antd/lib/button'
import Card from 'antd/lib/card'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import InputNumber from 'antd/lib/input-number'
import Popconfirm from 'antd/lib/popconfirm'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import find from 'lodash/fp/find'
import omit from 'lodash/fp/omit'
import range from 'lodash/fp/range'

import Title from '../../common/components/Title'
import {getFields, validateFields} from '../../common/components/FormCard'
import FormItems from '../../common/components/FormItems'
import EditableTable from '../../common/components/EditableTable'
import DatePicker from '../../common/components/DatePicker'
import AutoCompleteReference from '../../common/components/AutoCompleteReference'
import SelectStatus from '../../common/components/SelectStatus'
import {toEuro} from '../../utils/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import ModalPreview from './ModalPreview'
import ModalSender from './ModalSender'

const BACK_KEY_CODE = 8
const ENTER_KEY_CODE = 13
const DOT_KEY_CODE = 190
const NUMBER_KEY_CODES = range(48, 58)
const KEYPAD_KEY_CODES = range(96, 106)
const ARROWS_KEY_CODES = range(37, 41)
const INPUT_NUMBER_VALID_KEY_CODES = [
  BACK_KEY_CODE,
  DOT_KEY_CODE,
  ...ARROWS_KEY_CODES,
  ...NUMBER_KEY_CODES,
  ...KEYPAD_KEY_CODES,
]

function handleInputNumberKeyDown(event) {
  if (event.keyCode === ENTER_KEY_CODE) {
    event.stopPropagation()
    event.currentTarget.blur()
  } else if (!INPUT_NUMBER_VALID_KEY_CODES.includes(event.keyCode)) {
    event.preventDefault()
  }
}

function EditDefaultDocument(props) {
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.document)
  const [items, setItems] = useState((document && document.items) || [])
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [senderVisible, setSenderVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [discountRate, setDiscountRate] = useState(document.discountRate || 0)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  function postPreview(showSender) {
    setPreviewVisible(false)
    setLoading(false)
    if (showSender) setSenderVisible(true)
  }

  async function saveType(type) {
    const conditionType = type === 'quotation' ? 'quotation' : 'invoice'
    const conditions = (profile && profile[conditionType + 'Conditions']) || ''
    const nextDocument = await buildNextDocument({type, conditions}, getFields)
    setDocument(nextDocument)
  }

  async function buildNextDocument(override = {}, validator = validateFields) {
    const fields = await validator(props.form)
    const nextItems = items.filter(item => item.unitPrice)
    const subtotal = nextItems.reduce((sum, {amount}) => sum + amount, 0)
    const totalDiscount = -(subtotal * (discountRate || 0)) / 100
    const totalHT = subtotal + totalDiscount
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    return {
      ...document,
      ...fields,
      items: nextItems,
      subtotal,
      totalDiscount,
      totalHT,
      totalTVA,
      totalTTC,
      ...override,
    }
  }

  async function buildNextDocumentWithPdf() {
    const now = DateTime.local()
    let nextDocument = await buildNextDocument({createdAt: now.toISO()})
    const nextClient = find({id: nextDocument.client}, clients)

    if (!nextDocument.number) {
      const prefix = t(nextDocument.type)[0].toUpperCase()
      const count = documents.reduce((count, d) => {
        if (nextDocument.id === d.id) return count
        if (nextDocument.type !== d.type) return count
        if (d.imported) return count
        if (!d.number) return count
        if (DateTime.fromISO(d.createdAt).month !== now.month) return count
        if (DateTime.fromISO(d.createdAt).year !== now.year) return count
        return count + 1
      }, 1)

      nextDocument.number = `${prefix}-${now.toFormat('yyMM')}-${count}`
      nextDocument.edited = false
    }

    return await $document.generatePdf(profile, nextClient, nextDocument)
  }

  async function previewDocument() {
    setLoading(true)
    setPreviewVisible(true)
    await tryAndNotify(async () => setDocument(await buildNextDocumentWithPdf()))
    setLoading(false)
  }

  async function sendDocument(data) {
    if (loading) return
    if (!data) return setSenderVisible(false)
    setLoading(true)

    await tryAndNotify(
      async () => {
        const nextDocument = await buildNextDocument({
          sentAt: DateTime.local().toISO(),
        })

        setDocument(nextDocument)
        await $document.set(nextDocument)
        await $document.sendMail(data)
        props.history.push('/documents')
        return t('/documents.sent-successfully')
      },
      () => setLoading(false),
    )
  }

  function addItem() {
    setItems([
      ...items,
      {
        key: Date.now(),
        designation: '',
        unit: 'unit-unit',
        unitPrice: document.rate || profile.rate || 0,
        quantity: 1,
      },
    ])
  }

  function removeItem(key) {
    setItems(items.filter(item => item.key !== key))
  }

  function saveItems(row) {
    const prevItemIndex = items.findIndex(item => row.key === item.key)
    const prevItem = items[prevItemIndex]

    const quantity = Number(row.quantity)
    const unitPrice = Math.round(row.unitPrice * 100) / 100
    const amount = Math.round(quantity * unitPrice * 100) / 100
    const nextItem = {...row, quantity, unitPrice, amount}

    items.splice(prevItemIndex, 1, {
      ...prevItem,
      ...nextItem,
    })

    setItems([...items])
  }

  async function deleteDocument() {
    if (loading) return
    await tryAndNotify(
      async () => {
        setLoading(true)
        await $document.delete(document)
        props.history.push('/documents')
        return t('/documents.deleted-successfully')
      },
      () => setLoading(false),
    )
  }

  async function cloneDocument() {
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = omit(
        [
          'number',
          'pdf',
          'conditions',
          'sentAt',
          'signedAt',
          'paidAt',
          'refundedAt',
          'declaredUrssafAt',
          'declaredVatAt',
        ],
        await buildNextDocument({
          id: $document.generateId(),
          createdAt: DateTime.local().toISO(),
          items,
        }),
      )

      await $document.set(nextDocument)
      props.history.push('/documents')
      props.history.replace(`/documents/${nextDocument.id}`, nextDocument)
      return t('/documents.cloned-successfully')
    })

    setLoading(false)
  }

  async function saveDocument(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = await buildNextDocument({edited: true})
      setDocument(nextDocument)
      await $document.set(nextDocument)
      return t('/documents.updated-successfully')
    })

    setLoading(false)
  }

  if (!clients || !documents || !document) {
    return null
  }

  const readOnly = Boolean(document.sentAt)

  const Footer = () => {
    const subtotal = items.reduce((sum, {amount}) => sum + (amount || 0), 0)
    const totalDiscount = -(subtotal * (discountRate || 0)) / 100
    const totalHT = subtotal + totalDiscount
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    return (
      <>
        {discountRate > 0 && (
          <div
            style={{textAlign: 'right', fontStyle: 'italic'}}
            dangerouslySetInnerHTML={{
              __html: t('/documents.total', {
                title: t('subtotal'),
                value: toEuro(subtotal),
              }),
            }}
          />
        )}
        <div
          style={{textAlign: 'right', fontStyle: 'italic'}}
          dangerouslySetInnerHTML={{
            __html: t('/documents.total', {
              title: t(discountRate > 0 ? 'total-ht-with-discount' : 'total-ht'),
              value: toEuro(totalHT),
            }),
          }}
        />
        {totalTVA > 0 && (
          <div
            style={{textAlign: 'right', fontStyle: 'italic'}}
            dangerouslySetInnerHTML={{
              __html: t('/documents.total', {
                title: t('total-ttc'),
                value: toEuro(totalTTC),
              }),
            }}
          />
        )}
      </>
    )
  }

  const columns = [
    {
      title: <strong style={{marginLeft: readOnly ? 0 : 16}}>{t('description')}</strong>,
      dataIndex: 'designation',
      width: '45%',
      EditField: readOnly
        ? null
        : forwardRef(({save, blur, ...props}, ref) => (
            <Input ref={ref} onPressEnter={save} {...props} />
          )),
    },
    {
      title: <strong>{t('quantity')}</strong>,
      dataIndex: 'quantity',
      width: '10%',
      EditField: readOnly
        ? null
        : forwardRef(({save, ...props}, ref) => (
            <InputNumber
              ref={ref}
              onKeyDown={handleInputNumberKeyDown}
              min={0}
              step={1}
              {...props}
            />
          )),
    },
    {
      title: <strong>{t('unit')}</strong>,
      dataIndex: 'unit',
      width: '15%',
      render: t,
      EditField: readOnly
        ? null
        : forwardRef(({save, ...props}, ref) => (
            <Select ref={ref} defaultOpen {...props}>
              <Select.Option value="unit-hour">{t('unit-hour')}</Select.Option>
              <Select.Option value="unit-day">{t('unit-day')}</Select.Option>
              <Select.Option value="unit-delivery">{t('unit-delivery')}</Select.Option>
              <Select.Option value="unit-unit">{t('unit-unit')}</Select.Option>
            </Select>
          )),
    },
    {
      title: <strong>{t('unit-price')}</strong>,
      dataIndex: 'unitPrice',
      width: '15%',
      render: (_, {unitPrice}) => toEuro(unitPrice),
      EditField: readOnly
        ? null
        : forwardRef(({save, ...props}, ref) => (
            <InputNumber
              ref={ref}
              onKeyDown={handleInputNumberKeyDown}
              min={0}
              step={1}
              {...props}
            />
          )),
    },
    {
      title: <strong>{t('amount')}</strong>,
      dataIndex: 'amount',
      width: '15%',
      render: (_, {amount}) => toEuro(amount),
    },
  ]

  if (!readOnly) {
    columns.push({
      title: (
        <Button type="primary" shape="circle" onClick={addItem}>
          <Icon type="plus" />
        </Button>
      ),
      dataIndex: 'action',
      key: 'action',
      fixed: 'right',
      align: 'right',
      render: (_, {key}) => (
        <Button type="danger" shape="circle" onClick={() => removeItem(key)}>
          <Icon type="minus" />
        </Button>
      ),
    })
  }

  const mainFields = [
    {
      name: 'entitled',
      Component: <Input size="large" autoFocus={Boolean(document.number)} disabled={readOnly} />,
    },
    {
      name: 'client',
      Component: (
        <Select size="large" disabled={readOnly}>
          {clients.map(client => (
            <Select.Option key={client.id} value={client.id}>
              {client.name}
            </Select.Option>
          ))}
        </Select>
      ),
      ...requiredRules,
    },
  ]

  if (profile.taxId) {
    mainFields.push({
      name: 'taxRate',
      Component: (
        <InputNumber
          size="large"
          min={0}
          step={1}
          onChange={taxRate => setDocument({...document, taxRate})}
          disabled={readOnly}
          style={{width: '100%'}}
        />
      ),
    })
  }

  if (document.type === 'quotation') {
    mainFields.push({
      name: 'expiresIn',
      Component: (
        <InputNumber size="large" min={0} step={1} disabled={readOnly} style={{width: '100%'}} />
      ),
      ...requiredRules,
    })
  } else {
    mainFields.push({
      name: 'paymentDeadlineAt',
      Component: <DatePicker disabled={readOnly} />,
      ...requiredRules,
    })

    if (document.type === 'credit') {
      mainFields.push({
        name: 'invoiceNumber',
        Component: <AutoCompleteReference disabled={readOnly} types={['invoice']} />,
        ...requiredRules,
      })
    }
  }

  mainFields.push({
    name: 'discountRate',
    Component: (
      <InputNumber
        size="large"
        min={0}
        step={1}
        onChange={setDiscountRate}
        disabled={readOnly}
        style={{width: '100%'}}
      />
    ),
  })

  const conditionFields = [
    {name: 'conditions', fluid: true, Component: <Input.TextArea disabled={readOnly} rows={6} />},
  ]

  const selectType = (
    <Select autoFocus value={document.type} onChange={saveType} disabled={readOnly}>
      <Select.Option value="quotation">{t('quotation')}</Select.Option>
      <Select.Option value="invoice">{t('invoice')}</Select.Option>
      <Select.Option value="credit">{t('credit')}</Select.Option>
    </Select>
  )

  return (
    <>
      <Form noValidate layout="vertical" onSubmit={saveDocument}>
        {!document.pdf && (
          <Alert
            message={t('warning')}
            description={
              <div style={{display: 'flex', alignItems: 'center'}}>
                <span style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                  <span>{t('/documents.warning-draft-1')}</span>
                  <span>{t('/documents.warning-draft-2')}</span>
                </span>
                <span>
                  <Button type="dashed" onClick={previewDocument} disabled={loading}>
                    <Icon type="check" />
                    {t('confirm')}
                  </Button>
                </span>
              </div>
            }
            type="warning"
            showIcon
            style={{marginBottom: 24}}
          />
        )}

        <Title label={document.number || selectType}>
          <Button.Group>
            {!document.number && (
              <Popconfirm
                title={t('/documents.confirm-deletion')}
                onConfirm={deleteDocument}
                okText={t('yes')}
                cancelText={t('no')}
                visible={deleteVisible && !loading}
                onVisibleChange={visible => setDeleteVisible(loading ? false : visible)}
              >
                <Button type="danger" disabled={loading}>
                  <Icon type="delete" />
                  {t('delete')}
                </Button>
              </Popconfirm>
            )}
            <Button
              type="dashed"
              disabled={loading}
              onClick={cloneDocument}
              style={{marginLeft: 4}}
            >
              <Icon type="copy" />
              {t('clone')}
            </Button>
            {(document.sentAt || (document.pdf && !document.edited)) && (
              <Button
                disabled={loading}
                href={document.pdf}
                download={document.number}
                style={{marginLeft: 4}}
              >
                <Icon type="download" />
                {t('download')}
              </Button>
            )}
            {!document.sentAt && document.edited && document.pdf && (
              <Button disabled={loading} onClick={previewDocument} style={{marginLeft: 4}}>
                <Icon type="download" />
                {t('download')}
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={loading} style={{marginLeft: 4}}>
              <Icon type={loading ? 'loading' : 'save'} />
              {t('save')}
            </Button>
          </Button.Group>
        </Title>

        <Row gutter={24}>
          <Col lg={6}>
            {document.pdf && <SelectStatus onChange={setDocument} document={document} required />}
            <FormItems form={props.form} model={document} fields={mainFields} />
          </Col>
          <Col lg={18}>
            <Form.Item label={t('designations')} required>
              <Card bodyStyle={{padding: 0}}>
                <EditableTable
                  size="small"
                  pagination={false}
                  dataSource={items}
                  columns={columns}
                  footer={Footer}
                  onSave={saveItems}
                />
              </Card>
            </Form.Item>
            <FormItems form={props.form} model={document} fields={conditionFields} />
          </Col>
        </Row>
      </Form>

      <ModalPreview
        document={document}
        visible={previewVisible}
        loading={loading}
        onClose={postPreview}
      />

      <ModalSender
        document={document}
        visible={senderVisible}
        loading={loading}
        onClose={sendDocument}
      />
    </>
  )
}

export default withRouter(Form.create()(EditDefaultDocument))
