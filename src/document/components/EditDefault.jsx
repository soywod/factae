import React, {forwardRef, useState} from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/lib/button'
import Card from 'antd/lib/card'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Popconfirm from 'antd/lib/popconfirm'
import Row from 'antd/lib/row'
import Select from 'antd/lib/select'
import find from 'lodash/fp/find'
import omit from 'lodash/fp/omit'

import Title from '../../common/components/Title'
import StatusTag from '../../common/components/StatusTag'
import InputNumber from '../../common/components/InputNumber'
import {getFields, validateFields} from '../../common/components/FormCard'
import FormItems from '../../common/components/FormItems'
import EditableTable from '../../common/components/EditableTable'
import DatePicker from '../../common/components/DatePicker'
import AutoCompleteReference from '../../common/components/AutoCompleteReference'
import ChangeStatus from '../../common/components/ChangeStatus'
import {toEuro} from '../../utils/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import {getCurrStatus, getNextStatus} from '../utils'
import $document from '../service'
import ModalPreview from './ModalPreview'
import ModalSender from './ModalSender'
import AlertDraft from './AlertDraft'

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

  async function postPreview(event = {}) {
    setPreviewVisible(false)

    switch (event.source) {
      case 'send':
        setSenderVisible(true)
        break

      case 'mark-as-sent':
        setLoading(true)

        await tryAndNotify(async () => {
          const nextDocument = {...document, ...event.data}
          setDocument(nextDocument)
          await $document.set(nextDocument)
          return t('/documents.updated-successfully')
        })

        setLoading(false)
        break

      default:
        break
    }
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

  function generateNumber(nextDocument, now = DateTime.local()) {
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

    return `${prefix}-${now.toFormat('yyMM')}-${count}`
  }

  async function buildNextDocumentWithPdf() {
    const now = DateTime.local()
    const nextDocument = await buildNextDocument({createdAt: now.toISO(), edited: false})
    const nextClient = find({id: nextDocument.client}, clients)

    return $document.generatePdf(profile, nextClient, nextDocument)
  }

  async function handleStatusChange(data) {
    setLoading(true)

    await tryAndNotify(async () => {
      let nextDocument = await buildNextDocument(data)
      const nextClient = find({id: document.client}, clients)

      if (data.sentAt) {
        nextDocument = await $document.generatePdf(profile, nextClient, nextDocument)
      }

      await $document.set(nextDocument)
      setDocument(nextDocument)
      return t('/documents.updated-successfully')
    })

    setLoading(false)
  }

  async function confirmDocument() {
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = await buildNextDocument({
        number: generateNumber(document),
        edited: true,
      })

      await $document.set(nextDocument)
      setDocument(nextDocument)
      return t('/documents.validated-successfully')
    })

    setLoading(false)
  }

  async function previewDocument() {
    setLoading(true)
    await tryAndNotify(async () => setDocument(await buildNextDocumentWithPdf()))
    setLoading(false)
    setPreviewVisible(true)
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

  const currDocumentStatus = getCurrStatus(document)
  const nextDocumentStatus = getNextStatus(document)

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
            <InputNumber ref={ref} min={0} step={1} blurOnEnter {...props} />
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
            <InputNumber ref={ref} min={0} step={1} blurOnEnter {...props} />
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
      name: 'client',
      Component: (
        <Select autoFocus={document.number} size="large">
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

  if (!document.number) {
    mainFields.unshift({
      name: 'type',
      Component: (
        <Select autoFocus value={document.type} onChange={saveType} size="large">
          <Select.Option value="quotation">{t('quotation')}</Select.Option>
          <Select.Option value="invoice">{t('invoice')}</Select.Option>
          <Select.Option value="credit">{t('credit')}</Select.Option>
        </Select>
      ),
      ...requiredRules,
    })
  }

  const conditionFields = [
    {name: 'conditions', fluid: true, Component: <Input.TextArea rows={6} />},
  ]

  const entitledFields = [
    {
      name: 'entitled',
      Component: <Input size="large" disabled={readOnly} />,
    },
  ]

  return (
    <>
      <Form noValidate layout="vertical" onSubmit={saveDocument}>
        <Title
          loading={loading}
          label={
            <>
              {document.number || t(document.type)} <StatusTag document={document} />
            </>
          }
        >
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
                <Button type="danger">
                  <Icon type="delete" />
                  {t('delete')}
                </Button>
              </Popconfirm>
            )}
            {!['draft', 'cancelled'].includes(currDocumentStatus) && (
              <ChangeStatus
                document={document}
                onConfirm={handleStatusChange}
                style={{marginLeft: 4}}
              >
                {showConfirm => (
                  <Button type="danger" onClick={showConfirm('cancelled')} style={{marginLeft: 4}}>
                    <Icon type="close" />
                    {t('cancel')}
                  </Button>
                )}
              </ChangeStatus>
            )}
            <Button type="dashed" onClick={cloneDocument} style={{marginLeft: 4}}>
              <Icon type="copy" />
              {t('clone')}
            </Button>
            {currDocumentStatus === 'draft' && (
              <>
                {document.number && (
                  <Button onClick={previewDocument} style={{marginLeft: 4}}>
                    <Icon type="file-sync" />
                    {t('generate')}
                  </Button>
                )}
                <Button type="primary" htmlType="submit" style={{marginLeft: 4}}>
                  <Icon type="save" />
                  {t('save')}
                </Button>
              </>
            )}
            {currDocumentStatus === 'sent' && (
              <ChangeStatus
                document={document}
                onConfirm={handleStatusChange}
                style={{marginLeft: 4}}
              >
                {showConfirm => (
                  <Button
                    type="primary"
                    onClick={showConfirm(nextDocumentStatus)}
                    style={{marginLeft: 4}}
                  >
                    <Icon type="check" />
                    {t('mark-as-' + nextDocumentStatus)}
                  </Button>
                )}
              </ChangeStatus>
            )}
          </Button.Group>
        </Title>

        <AlertDraft document={document} onConfirm={confirmDocument} />

        <Row gutter={24}>
          {document.sentAt && document.pdf ? (
            <Col xl={24}>
              <div
                style={{
                  position: 'relative',
                  paddingTop: 'calc(100vh - 192px)',
                  overflow: 'hidden',
                }}
              >
                <iframe
                  title={document.number}
                  src={document.pdf}
                  width="100%"
                  height={600}
                  scrolling="no"
                  allowFullScreen
                  style={{
                    border: 'none',
                    height: '100%',
                    left: 0,
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                  }}
                />
              </div>
            </Col>
          ) : (
            <>
              <Col lg={6}>
                {!document.sentAt && (
                  <FormItems form={props.form} model={document} fields={mainFields} />
                )}
              </Col>
              <Col lg={18}>
                <FormItems form={props.form} model={document} fields={entitledFields} />
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
            </>
          )}
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
