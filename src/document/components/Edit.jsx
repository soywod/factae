import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Popconfirm from 'antd/es/popconfirm'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import find from 'lodash/fp/find'
import omit from 'lodash/fp/omit'

import Container from '../../common/components/Container'
import Title from '../../common/components/Title'
import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import EditableTable from '../../common/components/EditableTable'
import DatePicker from '../../common/components/DatePicker'
import NatureField from '../../common/components/NatureField'
import PaymentMethodField from '../../common/components/PaymentMethodField'
import ReferenceField from '../../common/components/ReferenceField'
import {toEuro} from '../../utils/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import ModalPreview from './ModalPreview'
import ModalSender from './ModalSender'
import ModalPostValidation from './ModalPostValidation'

function EditDocument(props) {
  const {history, match} = props
  const {getFieldDecorator} = props.form
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.location.state)
  const [items, setItems] = useState((document && document.items) || [])
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [senderVisible, setSenderVisible] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [postValidationVisible, setPostValidationVisible] = useState(false)
  const [status, setStatus] = useState()

  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  function postPreview(showSender) {
    setPreviewVisible(false)
    setLoading(false)
    if (showSender) setSenderVisible(true)
  }

  async function postValidation(data) {
    if (!data) {
      props.form.setFieldsValue({status: document.status})
      return setPostValidationVisible(false)
    }

    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = {...document, ...data, status}
      setDocument(nextDocument)
      await $document.set(nextDocument)
      return t('/documents.updated-successfully')
    })

    setPostValidationVisible(false)
    setLoading(false)
  }

  async function saveType(type) {
    const conditionType = type === 'quotation' ? 'quotation' : 'invoice'
    const conditions = (profile && profile[conditionType + 'Conditions']) || ''
    const nextDocument = await buildNextDocument()
    setDocument({...nextDocument, type, conditions})
  }

  async function saveStatus(nextStatus) {
    setStatus(nextStatus)
    if (nextStatus !== 'draft') setPostValidationVisible(true)
  }

  async function buildNextDocument(override = {}) {
    let fields = await validateFields(props.form)
    if (fields.paymentDeadlineAt) {
      fields.paymentDeadlineAt = fields.paymentDeadlineAt.toISOString()
    }

    const nextItems = items.filter(item => item.designation && item.unitPrice)
    const totalHT = nextItems.reduce((sum, {amount}) => sum + amount, 0)
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    return {
      ...document,
      ...fields,
      items: nextItems,
      totalHT,
      totalTVA,
      totalTTC,
      ...override,
    }
  }

  async function buildNextDocumentWithPdf() {
    const now = DateTime.local()
    let nextDocument = await buildNextDocument({createdAt: now.toISO()})

    const prefix = t(nextDocument.type)[0].toUpperCase()
    const count = documents
      .map(({id, type, status, createdAt}) => [id, type, status, DateTime.fromISO(createdAt)])
      .reduce((count, [id, type, status, createdAt]) => {
        if (nextDocument.id === id) return count
        const matchMonth = createdAt.month === now.month
        const matchYear = createdAt.year === now.year
        const matchType = type === document.type
        const matchStatus = status !== 'draft'
        return count + Number(matchMonth && matchYear && matchType && matchStatus)
      }, 1)

    nextDocument.number = `${prefix}-${now.toFormat('yyMM')}-${count}`
    const nextClient = find({id: nextDocument.client}, clients)

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
          status: 'sent',
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
        history.push('/documents')
        return t('/documents.deleted-successfully')
      },
      () => setLoading(false),
    )
  }

  async function cloneDocument() {
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = omit(
        ['number', 'pdf', 'conditions', 'sentAt', 'signedAt', 'paidAt', 'refundedAt'],
        await buildNextDocument({
          id: $document.generateId(),
          createdAt: DateTime.local().toISO(),
          status: 'draft',
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
      const nextDocument = await buildNextDocument()
      setDocument(nextDocument)
      await $document.set(nextDocument)
      return t('/documents.updated-successfully')
    })

    setLoading(false)
  }

  if (!clients || !documents || !document) {
    return null
  }

  const Footer = () => {
    const totalHT = items.reduce((total, {amount = 0}) => total + amount, 0)
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    return (
      <>
        <div
          style={{textAlign: 'right', fontStyle: 'italic', fontSize: '1rem'}}
          dangerouslySetInnerHTML={{
            __html: t('/documents.total', {
              title: t('total-without-taxes'),
              value: toEuro(totalHT),
            }),
          }}
        />
        {totalTVA > 0 && (
          <div
            style={{textAlign: 'right', fontStyle: 'italic', fontSize: '1rem'}}
            dangerouslySetInnerHTML={{
              __html: t('/documents.total', {
                title: t('total-with-taxes'),
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
      title: <strong style={{marginLeft: 16}}>{t('description')}</strong>,
      dataIndex: 'designation',
      key: 'designation',
      editable: true,
      width: '50%',
    },
    {
      title: <strong>{t('quantity')}</strong>,
      dataIndex: 'quantity',
      key: 'quantity',
      editable: true,
      width: '10%',
    },
    {
      title: <strong>{t('unit-price')}</strong>,
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      editable: true,
      width: '20%',
      render: (_, {unitPrice}) => toEuro(unitPrice),
    },
    {
      title: <strong>{t('amount')}</strong>,
      dataIndex: 'amount',
      key: 'amount',
      width: '20%',
      render: (_, {amount}) => toEuro(amount),
    },
    {
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
    },
  ]

  const mainFields = {
    title: <FormCardTitle title="general-informations" />,
    fields: [
      {
        name: 'client',
        Component: (
          <Select size="large" autoFocus>
            {clients.map(client => (
              <Select.Option key={client.id} value={client.id}>
                {client.name}
              </Select.Option>
            ))}
          </Select>
        ),
        ...requiredRules,
      },
      {
        name: 'type',
        Component: (
          <Select size="large" disabled={document.status !== 'draft'} onChange={saveType}>
            {['quotation', 'invoice', 'credit'].map(type => (
              <Select.Option key={type} value={type}>
                {t(type)}
              </Select.Option>
            ))}
          </Select>
        ),
        ...requiredRules,
      },
      {
        name: 'status',
        Component: (
          <Select size="large" onChange={saveStatus}>
            <Select.Option value="draft">{t('draft')}</Select.Option>
            {['draft', 'sent'].includes(document.status) && (
              <Select.Option value="sent">{t('sent')}</Select.Option>
            )}
            {document.type === 'quotation' && document.status !== 'draft' && (
              <Select.Option value="signed">{t('signed')}</Select.Option>
            )}
            {document.type === 'invoice' && document.status !== 'draft' && (
              <Select.Option value="paid">{t('paid')}</Select.Option>
            )}
            {document.type === 'credit' && document.status !== 'draft' && (
              <Select.Option value="refunded">{t('refunded')}</Select.Option>
            )}
          </Select>
        ),
        ...requiredRules,
      },
      {
        name: 'taxRate',
        Component: (
          <InputNumber
            size="large"
            min={0}
            step={1}
            onChange={taxRate => setDocument({...document, taxRate})}
            style={{width: '100%'}}
          />
        ),
      },
    ],
  }

  if (document.type === 'quotation') {
    mainFields.fields.push({
      name: 'expiresIn',
      Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      ...requiredRules,
    })
  } else {
    mainFields.fields.push({name: 'paymentDeadlineAt', Component: <DatePicker />, ...requiredRules})

    if (document.type === 'credit') {
      mainFields.fields.push({
        name: 'invoiceNumber',
        Component: <ReferenceField types={['invoice']} />,
        ...requiredRules,
      })
    }
  }

  if (['paid', 'refunded'].includes(document.status)) {
    mainFields.fields.push(
      {
        name: 'nature',
        Component: <NatureField />,
        ...requiredRules,
      },
      {
        name: 'paymentMethod',
        Component: <PaymentMethodField />,
        ...requiredRules,
      },
    )
  }

  const conditionFields = {
    title: <FormCardTitle title="conditions" subtitle="/documents.conditions-subtitle" />,
    fields: [{name: 'conditions', fluid: true, Component: <Input.TextArea rows={4} />}],
  }

  const fields = [mainFields]

  return (
    <Container>
      <Form noValidate layout="vertical" onSubmit={saveDocument}>
        <Title label="documents">
          <Button.Group>
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
            <Button type="dashed" disabled={loading} onClick={cloneDocument}>
              <Icon type="copy" />
              {t('clone')}
            </Button>
            {document.status === 'draft' ? (
              <Button disabled={loading} onClick={previewDocument}>
                <Icon type="eye" />
                {t('preview')}
              </Button>
            ) : (
              <Button disabled={loading} href={document.pdf} download={document.number}>
                <Icon type="download" />
                {t('download')}
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={loading}>
              <Icon type={loading ? 'loading' : 'save'} />
              {t('save')}
            </Button>
          </Button.Group>
        </Title>

        {fields.map((props, key) => (
          <FormCard key={key} getFieldDecorator={getFieldDecorator} model={document} {...props} />
        ))}

        <Card
          title={<FormCardTitle title="designations" />}
          bodyStyle={{padding: '1px 7.5px 0 7.5px', marginBottom: -1}}
          style={{marginTop: 15}}
        >
          <Row gutter={15}>
            <EditableTable
              size="middle"
              pagination={false}
              dataSource={items}
              columns={columns}
              footer={Footer}
              onSave={saveItems}
            />
          </Row>
        </Card>

        <FormCard getFieldDecorator={getFieldDecorator} model={document} {...conditionFields} />
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

      <ModalPostValidation
        status={status}
        visible={postValidationVisible}
        loading={loading}
        onSubmit={postValidation}
      />
    </Container>
  )
}

export default Form.create()(EditDocument)
