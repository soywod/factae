import React, {useEffect, useState} from 'react'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import InputNumber from 'antd/es/input-number'
import DatePicker from 'antd/es/date-picker'
import Popconfirm from 'antd/es/popconfirm'
import Select from 'antd/es/select'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Icon from 'antd/es/icon'
import Typography from 'antd/es/typography'
import Empty from 'antd/es/empty'
import isNil from 'lodash/fp/isNil'
import find from 'lodash/fp/find'
import omitBy from 'lodash/fp/omitBy'
import moment from 'moment'
import {DateTime} from 'luxon'

import {useNotification} from '../../utils/notification'
import {toEuro} from '../../common/currency'
import ActionBar from '../../common/components/ActionBar'
import Container from '../../common/components/Container'
import EditableTable from '../../common/components/EditableTable'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'

const {Title: AntdTitle, Paragraph: AntdParagraph} = Typography
const {Option} = Select
const {TextArea} = Input

const Title = ({children}) => (
  <AntdTitle level={3} style={{fontSize: '1.2rem', marginBottom: 0}}>
    {children}
  </AntdTitle>
)

const Paragraph = ({children}) => (
  <AntdParagraph
    style={{fontSize: '0.9rem', marginBottom: 0, fontStyle: 'italic', color: '#aaaaaa'}}
  >
    {children}
  </AntdParagraph>
)

function EditDocument(props) {
  const {match} = props
  const {getFieldDecorator} = props.form

  const profile = useProfile()
  const clients = useClients()
  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.location.state)
  const [items, setItems] = useState((document && document.items) || [])
  const tryAndNotify = useNotification()

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  async function buildNextDocument() {
    const data = await props.form.validateFields()
    const nextItems = items.filter(item => item.designation && item.unitPrice)
    const totalHT = nextItems.reduce((sum, {amount}) => sum + amount, 0)
    const totalTVA = Math.round(totalHT * document.taxRate) / 100
    const totalTTC = totalHT + totalTVA

    let nextDocument = {
      ...document,
      ...omitBy(isNil, data),
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

  async function generatePdf(event) {
    event.stopPropagation()
    setLoading(true)

    await tryAndNotify(async () => {
      let nextDocument = await buildNextDocument()

      if (!nextDocument.client) {
        throw new Error('Vous devez sélectionner un client.')
      }

      const now = DateTime.local()
      nextDocument.createdAt = now.toISO()

      if (nextDocument.type !== 'quotation' && !nextDocument.number) {
        const count = documents
          .map(({type, createdAt}) => [type, DateTime.fromISO(createdAt)])
          .reduce((count, [type, createdAt]) => {
            const matchMonth = createdAt.month === now.month
            const matchYear = createdAt.year === now.year
            const matchDocType = type === document.type
            return count + Number(matchMonth && matchYear && matchDocType)
          }, 0)

        nextDocument.number = `${now.toFormat('YYMM')}#${count}`
      }

      const nextClient = find({id: nextDocument.client}, clients)
      setDocument(await $document.generatePdf(profile, nextClient, nextDocument))
      return 'Document PDF généré avec succès.'
    })

    setLoading(false)
  }

  function addItem() {
    setItems([
      ...items,
      {key: Date.now(), designation: '', unitPrice: profile.rate || '', quantity: '1'},
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
    await tryAndNotify(
      async () => {
        setLoading(true)
        await $document.delete(document)
        props.history.push('/documents')
        return 'Document supprimé avec succès.'
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
      await $document.update(nextDocument)
      return 'Document mis à jour avec succès.'
    })

    setLoading(false)
  }

  if (!clients || !documents || !document) {
    return null
  }

  const Footer = () => (
    <div style={{textAlign: 'right', fontStyle: 'italic'}}>
      Total HT : <strong>{toEuro(items.reduce((total, {amount = 0}) => total + amount, 0))}</strong>
    </div>
  )

  const columns = [
    {
      title: <strong>Designation</strong>,
      dataIndex: 'designation',
      key: 'designation',
      editable: true,
      width: '45%',
    },
    {
      title: <strong>Quantité</strong>,
      dataIndex: 'quantity',
      key: 'quantity',
      editable: true,
      width: '10%',
    },
    {
      title: <strong>Prix unitaire</strong>,
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      editable: true,
      width: '20%',
      render: (_, {unitPrice}) => toEuro(unitPrice),
    },
    {
      title: <strong>Montant</strong>,
      dataIndex: 'amount',
      key: 'amount',
      width: '20%',
      render: (_, {amount}) => toEuro(amount),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: '5%',
      render: (_, {key}) => (
        <Button type="danger" shape="circle" onClick={() => removeItem(key)}>
          <Icon type="delete" />
        </Button>
      ),
    },
  ]

  const ItemsTitle = (
    <Title>
      Désignations
      <Button type="dashed" shape="circle" onClick={addItem} style={{marginLeft: 12}}>
        <Icon type="plus" />
      </Button>
    </Title>
  )

  const MainTitle = <Title>Informations générales</Title>
  const mainFields = [
    [
      'type',
      'Type de document',
      <Select size="large" disabled>
        <Option value="quotation">Devis</Option>
        <Option value="invoice">Facture</Option>
        <Option value="credit">Avoir</Option>
      </Select>,
    ],
    [
      'status',
      'Statut',
      <Select size="large" autoFocus>
        <Option value="draft">Brouillon</Option>
        <Option value="sent">Envoyé</Option>
        {document.type === 'quotation' && <Option value="signed">Signé</Option>}
        {document.type === 'invoice' && <Option value="paid">Payé</Option>}
        {document.type === 'credit' && <Option value="refunded">Remboursé</Option>}
      </Select>,
    ],
    [
      'client',
      'Client',
      <Select size="large">
        {clients.map(client => (
          <Option key={client.id} value={client.id}>
            {client.tradingName || client.email}
          </Option>
        ))}
      </Select>,
    ],
  ]

  if (document.type === 'quotation') {
    mainFields.push(
      ['taxRate', 'TVA (%)', <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />],
      [
        'rate',
        'Tarification (€)',
        <InputNumber size="large" min={0} step={1} style={{width: '100%'}} />,
      ],
      [
        'rateUnit',
        'Unité',
        <Select size="large">
          <Option value="hour">Par heure</Option>
          <Option value="day">Par jour</Option>
          <Option value="service">Par prestation</Option>
        </Select>,
      ],
    )
  }

  if (document.type === 'credit') {
    mainFields.push(['invoiceNumber', 'N° de facture de référence'])
  }

  const DateTitle = <Title>Dates</Title>
  const dateFields = [
    [
      'expiresAt',
      "Expiration de l'offre",
      <DatePicker size="large" placeholder="" style={{width: '100%'}} />,
    ],
    ['startsAt', 'Début', <DatePicker size="large" placeholder="" style={{width: '100%'}} />],
    ['endsAt', 'Fin', <DatePicker size="large" placeholder="" style={{width: '100%'}} />],
  ]

  const ConditionTitle = (
    <>
      <Title level={3}>Conditions</Title>
      <Paragraph>
        Correspond aux conditions (de paiement, de livraison, d'exécution etc) qui s'afficheront en
        bas du document.
      </Paragraph>
    </>
  )
  const conditionFields = [['conditions', 'Conditions', <TextArea rows={4} />]]

  const fields = [[MainTitle, mainFields]]

  if (document.type === 'quotation') {
    fields.push([DateTitle, dateFields])
  }

  return (
    <Container>
      <h1>Document</h1>
      <Form onSubmit={saveDocument}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={{marginBottom: 15}}>
            <Row gutter={15}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label={label}>
                    {getFieldDecorator(name, {
                      initialValue: ['expiresAt', 'startsAt', 'endsAt'].includes(name)
                        ? moment(document[name])
                        : document[name],
                    })(Component)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        ))}

        <Card title={ConditionTitle} style={{marginBottom: 15}}>
          <Row gutter={15}>
            {conditionFields.map(([name, label, Component], key) => (
              <Col key={key} xs={24}>
                <Form.Item label={label}>
                  {getFieldDecorator(name, {
                    initialValue: document[name],
                  })(Component)}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        <Card
          title={ItemsTitle}
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

        {document.pdf && (
          <Card
            title={<Title>PDF</Title>}
            bodyStyle={{padding: 15, textAlign: 'center'}}
            style={{margin: '15px 0'}}
          >
            <Row gutter={15}>
              {document.pdf ? (
                <iframe
                  title="document"
                  src={document.pdf}
                  width="100%"
                  height={450}
                  scrolling="no"
                  style={{maxWidth: 512}}
                ></iframe>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </Row>
          </Card>
        )}

        <ActionBar>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce document ?"
            onConfirm={deleteDocument}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              Supprimer
            </Button>
          </Popconfirm>
          <Button type="dashed" onClick={generatePdf} disabled={loading} style={{marginRight: 8}}>
            <Icon type="file-pdf" />
            Générer PDF
          </Button>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type={loading ? 'loading' : 'save'} />
            Sauvegarder
          </Button>
        </ActionBar>
      </Form>
    </Container>
  )
}

export default Form.create()(EditDocument)
