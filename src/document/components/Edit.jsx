import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Dropdown from 'antd/es/dropdown'
import Empty from 'antd/es/empty'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import Menu from 'antd/es/menu'
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
import {useNotification} from '../../utils/notification'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import DatePicker from '../../common/components/DatePicker'

function EditDocument(props) {
  const {match} = props
  const {getFieldDecorator} = props.form
  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.location.state)
  const [items, setItems] = useState((document && document.items) || [])
  const [submitVisible, setSubmitVisible] = useState(false)
  const [deleteVisible, setDeleteVisible] = useState(false)

  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  async function buildNextDocument() {
    const nextItems = items.filter(item => item.designation && item.unitPrice)
    const totalHT = nextItems.reduce((sum, {amount}) => sum + amount, 0)
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    let nextDocument = {
      ...document,
      ...(await validateFields(props.form)),
      items: nextItems,
      totalHT,
      totalTVA,
      totalTTC,
    }

    if (nextDocument.expiresAt) {
      nextDocument.expiresAt = nextDocument.expiresAt.toISOString()
    }

    if (nextDocument.startsAt) {
      nextDocument.startsAt = nextDocument.startsAt.toISOString()
    }

    if (nextDocument.endsAt) {
      nextDocument.endsAt = nextDocument.endsAt.toISOString()
    }

    return nextDocument
  }

  async function generatePdf() {
    setSubmitVisible(false)
    setLoading(true)

    await tryAndNotify(async () => {
      await validateFields(props.form)
      let nextDocument = await buildNextDocument()
      const now = DateTime.local()
      nextDocument.createdAt = now.toISO()

      if (nextDocument.type !== 'quotation' && !nextDocument.number) {
        const count = documents
          .map(({id, type, createdAt}) => [id, type, DateTime.fromISO(createdAt)])
          .reduce((count, [id, type, createdAt]) => {
            if (nextDocument.id === id) return count
            const matchMonth = createdAt.month === now.month
            const matchYear = createdAt.year === now.year
            const matchDocType = type === document.type
            return count + Number(matchMonth && matchYear && matchDocType)
          }, 1)

        nextDocument.number = `${now.toFormat('yyMM')}#${count}`
      }

      const nextClient = find({id: nextDocument.client}, clients)
      setDocument(await $document.generatePdf(profile, nextClient, nextDocument))
      return t('/documents.generated-successfully')
    })

    setLoading(false)
  }

  function addItem() {
    setItems([
      ...items,
      {key: Date.now(), designation: '', unitPrice: profile.rate || 0, quantity: 1},
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

  async function cloneDocument({key: type}) {
    await tryAndNotify(
      async () => {
        setLoading(true)

        const conditionsFromProfile =
          profile[`${type === 'quotation' ? 'quotation' : 'invoice'}Conditions`]

        const nextDocument = omit(
          ['id', 'pdf', 'expiresAt', 'startsAt', 'endsAt', 'conditions'],
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

        props.history.push(`/documents`)
        return t('/documents.cloned-successfully')
      },
      () => setLoading(false),
    )
  }

  async function saveDocument(event) {
    event.preventDefault()
    if (loading) return
    setSubmitVisible(false)
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = await buildNextDocument()
      setDocument(nextDocument)
      await $document.update(nextDocument)
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
          style={{textAlign: 'right', fontStyle: 'italic'}}
          dangerouslySetInnerHTML={{
            __html: t('/documents.total', {
              title: t('total-without-taxes'),
              value: toEuro(totalHT),
            }),
          }}
        />
        {totalTVA > 0 && (
          <div
            style={{textAlign: 'right', fontStyle: 'italic'}}
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
      title: <strong>{t('designation')}</strong>,
      dataIndex: 'designation',
      key: 'designation',
      editable: true,
      width: '45%',
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
      width: '5%',
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
        name: 'type',
        Component: (
          <Select size="large" disabled>
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
          <Select size="large" autoFocus>
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
        name: 'client',
        Component: (
          <Select size="large">
            {clients.map(client => (
              <Select.Option key={client.id} value={client.id}>
                {client.tradeName || client.email}
              </Select.Option>
            ))}
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
    mainFields.fields.push(
      {
        name: 'rate',
        Component: <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      },
      {
        name: 'rateUnit',
        Component: (
          <Select size="large">
            {['hour', 'day', 'service'].map(type => (
              <Select.Option key={type} value={type}>
                {t(`per-${type}`)}
              </Select.Option>
            ))}
          </Select>
        ),
      },
    )
  }

  if (document.type === 'credit') {
    mainFields.fields.push({name: 'invoiceNumber'})
  }

  const dateFields = {
    title: <FormCardTitle title="dates" />,
    fields: [
      {
        name: 'expiresAt',
        Component: <DatePicker />,
        ...requiredRules,
      },
      {
        name: 'startsAt',
        Component: <DatePicker />,
        ...requiredRules,
      },
      {
        name: 'endsAt',
        Component: <DatePicker />,
      },
    ],
  }

  const conditionFields = {
    title: <FormCardTitle title="conditions" subtitle="/documents.conditions-subtitle" />,
    fields: [{name: 'conditions', fluid: true, Component: <Input.TextArea rows={4} />}],
  }

  const fields = [mainFields]

  if (document.type === 'quotation') {
    fields.push(dateFields)
  }

  return (
    <Container>
      <h1>{t('documents')}</h1>

      <Form onSubmit={saveDocument}>
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
            title={<FormCardTitle title="pdf" />}
            bodyStyle={{padding: 15, textAlign: 'center'}}
            style={{margin: '15px 0'}}
          >
            <Row gutter={15}>
              {document.pdf ? (
                <iframe
                  title="document"
                  src={document.pdf}
                  width="100%"
                  height={700}
                  scrolling="no"
                  style={{maxWidth: 700}}
                ></iframe>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Row>
          </Card>
        )}

        <ActionBar>
          <Popconfirm
            title={t('/documents.confirm-deletion')}
            onConfirm={deleteDocument}
            okText={t('yes')}
            cancelText={t('no')}
            disabled={loading}
            visible={deleteVisible && !loading}
            onVisibleChange={visible => setDeleteVisible(loading ? false : visible)}
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              {t('delete')}
            </Button>
          </Popconfirm>

          <Dropdown
            disabled={loading}
            overlay={
              <Menu disabled={loading} onClick={cloneDocument}>
                <Menu.Item key="quotation">{t('quotation')}</Menu.Item>
                <Menu.Item key="invoice">{t('invoice')}</Menu.Item>
                <Menu.Item key="credit">{t('credit')}</Menu.Item>
              </Menu>
            }
          >
            <Button type="dashed" disabled={loading} style={{marginRight: 8}}>
              <Icon type="switcher" />
              {t('clone')}
              {!loading && <Icon type="down" />}
            </Button>
          </Dropdown>

          <Dropdown
            disabled={loading}
            visible={submitVisible && !loading}
            onVisibleChange={visible => setSubmitVisible(loading ? false : visible)}
            overlay={
              <Menu disabled={loading}>
                <Menu.Item disabled={loading} onClick={generatePdf}>
                  {t('save-and-generate-pdf')}
                </Menu.Item>
              </Menu>
            }
          >
            <Button type="primary" htmlType="submit" disabled={loading}>
              <Icon type={loading ? 'loading' : 'save'} />
              {t('save')}
              {!loading && <Icon type="down" />}
            </Button>
          </Dropdown>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(EditDocument)
