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
import Tooltip from 'antd/es/tooltip'
import isNil from 'lodash/fp/isNil'
import find from 'lodash/fp/find'
import omitBy from 'lodash/fp/omitBy'
import moment from 'moment'

import {toEuro} from '../../common/currency'
import Container from '../../common/components/Container'
import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../hooks'
import $document from '../service'
import EditableTable from '../../common/components/EditableTable'

const {Title: AntdTitle, Paragraph: AntdParagraph} = Typography
const {Option} = Select
const {TextArea} = Input

const Title = ({children}) => (
  <AntdTitle level={2} style={{fontSize: '1.2rem', marginBottom: 0}}>
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

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  function generatePdf(document) {
    return async event => {
      event.stopPropagation()

      setLoading(true)
      setDocument({...document, pdf: await $document.generatePdf(document)})
      setLoading(false)
    }
  }

  function addItem() {
    setItems([
      ...items,
      {key: Date.now(), description: '', unitPrice: profile.unitPrice || '', quantity: '1'},
    ])
  }

  function removeItem(key) {
    setItems(items.filter(item => item.key !== key))
  }

  function saveItems(row) {
    const newItems = items.map(item => ({
      ...item,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }))

    const index = newItems.findIndex(item => row.key === item.key)
    const item = newItems[index]

    newItems.splice(index, 1, {
      ...item,
      ...row,
    })

    setItems(newItems)
  }

  async function removeDocument() {
    try {
      setLoading(true)
      await $document.delete(document)
      props.history.push('/documents')
    } catch (e) {
      setLoading(false)
    }
  }

  async function saveDocument(e) {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const data = await props.form.validateFields()
      const nextDocument = {
        ...document,
        ...omitBy(isNil, data),
        items: items
          .filter(item => item.description && item.unitPrice)
          .map(item => ({
            ...item,
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0),
          })),
      }

      nextDocument.total = nextDocument.items.reduce(
        (total, {quantity, unitPrice}) => total + quantity * unitPrice,
        0,
      )

      if (nextDocument.expiresAt) {
        nextDocument.expiresAt = nextDocument.expiresAt.toISOString()
      }

      if (nextDocument.startsAt) {
        nextDocument.startsAt = nextDocument.startsAt.toISOString()
      }

      if (nextDocument.endsAt) {
        nextDocument.endsAt = nextDocument.endsAt.toISOString()
      }

      await $document.update(nextDocument)
      props.history.push('/documents')
    } catch (e) {
      setLoading(false)
    }
  }

  if (!clients || !documents || !document) {
    return null
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      editable: true,
      width: '45%',
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
      editable: true,
      width: '20%',
    },
    {
      title: 'Prix unitaire',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      editable: true,
      width: '30%',
      render: (_, {unitPrice}) => toEuro(unitPrice),
    },
    {
      title: '',
      dataIndex: 'action',
      key: 'action',
      width: '5%',
      render: (_, {key}) => (
        <Popconfirm
          title="Êtes-vous sûr de vouloir supprimer cette désignation ?"
          onConfirm={() => removeItem(key)}
          okText="Oui"
          cancelText="Non"
        >
          <Button type="danger" shape="circle">
            <Icon type="delete" />
          </Button>
        </Popconfirm>
      ),
    },
  ]

  const ItemsTitle = (
    <Title>
      Désignations
      <Button type="primary" shape="circle" onClick={addItem} style={{marginLeft: 12}}>
        <Icon type="plus" />
      </Button>
    </Title>
  )

  const PdfTitle = (
    <Title>
      PDF
      <Tooltip title="Générer le PDF">
        <Button
          type="primary"
          shape="circle"
          onClick={generatePdf(document)}
          disabled={loading}
          style={{marginLeft: 12}}
        >
          <Icon type={loading ? 'loading' : 'sync'} />
        </Button>
      </Tooltip>
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
        <Option value="pending">En cours</Option>
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
      ['taxRate', 'TVA (%)', <InputNumber size="large" min={1} step={1} style={{width: '100%'}} />],
      [
        'rate',
        'Tarification (€)',
        <InputNumber size="large" min={1} step={1} style={{width: '100%'}} />,
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
      <Title level={2}>Conditions</Title>
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

  console.log(document)
  return (
    <Container>
      <Form onSubmit={saveDocument}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={{marginBottom: 25}}>
            <Row gutter={25}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={6} sm={12} md={8} lg={6}>
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

        <Card title={ConditionTitle} style={{marginBottom: 25}}>
          <Row gutter={25}>
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
          bodyStyle={{padding: '1px 12.5px 0 12.5px', marginBottom: -1}}
          style={{marginBottom: 25}}
        >
          <Row gutter={25}>
            <EditableTable
              pagination={false}
              dataSource={items}
              columns={columns}
              onSave={saveItems}
            />
          </Row>
        </Card>

        <Card
          title={PdfTitle}
          bodyStyle={{padding: 25, textAlign: 'center'}}
          style={{marginBottom: 25}}
        >
          <Row gutter={25}>
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

        <div style={{textAlign: 'right'}}>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce document ?"
            onConfirm={removeDocument}
            okText="Oui"
            cancelText="Non"
          >
            <Button type="danger" disabled={loading} style={{marginRight: 8}}>
              <Icon type="delete" />
              Supprimer
            </Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" disabled={loading}>
            <Icon type="save" />
            Sauvegarder
          </Button>
        </div>
      </Form>
    </Container>
  )
}

export default Form.create()(EditDocument)
