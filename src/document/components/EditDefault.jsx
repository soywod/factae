import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Popconfirm from 'antd/es/popconfirm'
import Row from 'antd/es/row'
import Select from 'antd/es/select'
import find from 'lodash/fp/find'
import omit from 'lodash/fp/omit'

import Title from '../../common/components/Title'
import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import EditableTable from '../../common/components/EditableTable'
import DatePicker from '../../common/components/DatePicker'
import AutoCompleteReference from '../../common/components/AutoCompleteReference'
import SwitchStatus from '../../common/components/SwitchStatus'
import {toEuro} from '../../utils/currency'
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import ModalPreview from './ModalPreview'
import ModalSender from './ModalSender'

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
    const nextDocument = await buildNextDocument()
    setDocument({...nextDocument, type, conditions})
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
    ],
  }

  if (!document.number) {
    mainFields.fields.push({
      name: 'type',
      Component: (
        <Select size="large" onChange={saveType}>
          {['quotation', 'invoice', 'credit'].map(type => (
            <Select.Option key={type} value={type}>
              {t(type)}
            </Select.Option>
          ))}
        </Select>
      ),
      ...requiredRules,
    })
  }

  mainFields.fields.push({
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
  })

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
        Component: <AutoCompleteReference types={['invoice']} />,
        ...requiredRules,
      })
    }
  }

  const conditionFields = {
    title: <FormCardTitle title="conditions" subtitle="/documents.conditions-subtitle" />,
    fields: [{name: 'conditions', fluid: true, Component: <Input.TextArea rows={4} />}],
  }

  const allStatus = [
    'sent',
    ...(document.type === 'quotation' ? ['signed'] : []),
    ...(document.type === 'invoice' ? ['paid'] : []),
    ...(document.type === 'credit' ? ['refunded'] : []),
    'declaredUrssaf',
    ...(profile.taxId ? ['declaredVat'] : []),
  ]

  return (
    <>
      <Form noValidate layout="vertical" onSubmit={saveDocument}>
        <Title label={document.number || t(document.type)}>
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
            {document.sentAt ? (
              <Button disabled={loading} href={document.pdf} download={document.number}>
                <Icon type="download" />
                {t('pdf')}
              </Button>
            ) : (
              <Button disabled={loading} onClick={previewDocument}>
                <Icon type="eye" />
                {t('pdf')}
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={loading}>
              <Icon type={loading ? 'loading' : 'save'} />
              {t('save')}
            </Button>
          </Button.Group>
        </Title>

        {document.number && (
          <Card
            title={<FormCardTitle title="status" subtitle="/documents.status-subtitle" />}
            style={{marginTop: 15}}
          >
            <Row gutter={15}>
              {allStatus.map(status => (
                <Col key={status} xs={24} sm={12} md={8} lg={6}>
                  <SwitchStatus
                    name={status}
                    date={document[`${status}At`]}
                    disabled={status !== 'sent' && !document.sentAt}
                    onChange={data => setDocument({...document, ...data})}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        )}

        <FormCard form={props.form} model={document} {...mainFields} />

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

        <FormCard form={props.form} model={document} {...conditionFields} />
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
