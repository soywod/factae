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

import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import EditableTable from '../../common/components/EditableTable'
import {toEuro} from '../../common/currency'
import {notify, useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import MailEditor from './MailEditor'

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
  const [mailEditorVisible, setMailEditorVisible] = useState(false)

  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  async function saveType(type) {
    const conditionType = type === 'quotation' ? 'quotation' : 'invoice'
    const conditions = (profile && profile[conditionType + 'Conditions']) || ''
    const nextDocument = await buildNextDocument()
    setDocument({...nextDocument, type, conditions})
  }

  async function buildNextDocument(override = {}) {
    const nextItems = items.filter(item => item.designation && item.unitPrice)
    const totalHT = nextItems.reduce((sum, {amount}) => sum + amount, 0)
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    return {
      ...document,
      ...(await validateFields(props.form)),
      items: nextItems,
      totalHT,
      totalTVA,
      totalTTC,
      ...override,
    }
  }

  async function prepareDocument() {
    setLoading(true)
    notify.info(t('/documents.preparing'))

    await tryAndNotify(async () => {
      await validateFields(props.form)
      const now = DateTime.local()
      let nextDocument = await buildNextDocument({createdAt: now.toISO()})

      if (!nextDocument.number) {
        const prefix = t(nextDocument.type)[0].toUpperCase()
        const count = documents
          .map(({id, type, createdAt}) => [id, type, DateTime.fromISO(createdAt)])
          .reduce((count, [id, type, createdAt]) => {
            if (nextDocument.id === id) return count
            const matchMonth = createdAt.month === now.month
            const matchYear = createdAt.year === now.year
            const matchDocType = type === document.type
            return count + Number(matchMonth && matchYear && matchDocType)
          }, 1)

        nextDocument.number = `${prefix}-${now.toFormat('yyMM')}-${count}`
      }

      const nextClient = find({id: nextDocument.client}, clients)
      setDocument(await $document.generatePdf(profile, nextClient, nextDocument))
      setMailEditorVisible(true)
    })

    setLoading(false)
  }

  async function sendDocument(data) {
    setMailEditorVisible(false)
    if (loading || !data) return
    setLoading(true)

    await tryAndNotify(
      async () => {
        const nextDocument = await buildNextDocument({status: 'sent'})
        await $document.set(nextDocument)
        await $document.sendMail({
          ...data,
          attachments: [
            {
              path: nextDocument.pdf,
              filename: nextDocument.number + '.pdf',
            },
          ],
        })

        history.push('/documents')
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

  async function cloneDocument({key: type}) {
    await tryAndNotify(
      async () => {
        setLoading(true)

        const conditionsFromProfile =
          profile[`${type === 'quotation' ? 'quotation' : 'invoice'}Conditions`]

        const nextDocument = omit(
          ['id', 'pdf', 'expiresIn', 'startsAt', 'endsAt', 'conditions'],
          await buildNextDocument(),
        )

        await $document.create({
          ...nextDocument,
          type,
          items,
          createdAt: DateTime.local().toISO(),
          status: 'draft',
          conditions: type === document.type ? document.conditions : conditionsFromProfile,
        })

        history.push('/documents')
        return t('/documents.cloned-successfully')
      },
      () => setLoading(false),
    )
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
          style={{textAlign: 'right', fontStyle: 'italic', fontSize: '1.2rem'}}
          dangerouslySetInnerHTML={{
            __html: t('/documents.total', {
              title: t('total-without-taxes'),
              value: toEuro(totalHT),
            }),
          }}
        />
        {totalTVA > 0 && (
          <div
            style={{textAlign: 'right', fontStyle: 'italic', fontSize: '1.2rem'}}
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
          <Select onChange={saveType} size="large">
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
          <Select size="large">
            <Select.Option value="draft">{t('draft')}</Select.Option>
            <Select.Option value="sent">{t('sent')}</Select.Option>
            {document.type === 'quotation' && (
              <Select.Option value="signed">{t('signed')}</Select.Option>
            )}
            {document.type === 'invoice' && <Select.Option value="paid">{t('paid')}</Select.Option>}
            {document.type === 'credit' && (
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
  } else if (document.type === 'credit') {
    mainFields.fields.push({name: 'invoiceNumber', ...requiredRules})
  }

  const conditionFields = {
    title: <FormCardTitle title="conditions" subtitle="/documents.conditions-subtitle" />,
    fields: [{name: 'conditions', fluid: true, Component: <Input.TextArea rows={4} />}],
  }

  const fields = [mainFields]

  return (
    <Container>
      <h1>{t('documents')}</h1>

      <Form noValidate layout="vertical" onSubmit={saveDocument}>
        {fields.map((props, key) => (
          <FormCard key={key} getFieldDecorator={getFieldDecorator} model={document} {...props} />
        ))}

        <Card
          title={<FormCardTitle title="designations" />}
          bodyStyle={{padding: '1px 7.5px 0 7.5px', marginBottom: -1}}
          style={{marginBottom: 15}}
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

        {document.pdf && (
          <Card
            title={
              <a
                href={document.pdf}
                download={document.number}
                style={{display: 'flex', alignItems: 'center'}}
              >
                <Icon type="file-pdf" style={{fontSize: '2em', marginRight: 12}} />
                <FormCardTitle
                  title={t(document.type)}
                  subtitle={document.number}
                  style={{flex: 1}}
                />
                <Button type="link">
                  <Icon type="download" />
                  {t('download')}
                </Button>
              </a>
            }
            bodyStyle={{padding: 0}}
            style={{margin: '15px 0'}}
          />
        )}

        <ActionBar>
          <Popconfirm
            title={t('/documents.confirm-deletion')}
            onConfirm={deleteDocument}
            okText={t('yes')}
            cancelText={t('no')}
            visible={deleteVisible && !loading}
            onVisibleChange={visible => setDeleteVisible(loading ? false : visible)}
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              {t('delete')}
            </Button>
          </Popconfirm>

          <Button type="dashed" disabled={loading} onClick={cloneDocument} style={{marginRight: 8}}>
            <Icon type="copy" />
            {t('clone')}
          </Button>

          <Button
            type="dashed"
            disabled={loading}
            onClick={prepareDocument}
            style={{marginRight: 8}}
          >
            <Icon type="mail" />
            {t('presend')}
          </Button>

          <Button type="primary" disabled={loading} htmlType="submit">
            <Icon type={loading ? 'loading' : 'save'} />
            {t('save')}
          </Button>
        </ActionBar>
      </Form>
      <MailEditor visible={mailEditorVisible} document={document} onClose={sendDocument} />
    </Container>
  )
}

export default Form.create()(EditDocument)
