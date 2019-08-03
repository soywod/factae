import React, {useEffect, useState} from 'react'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Popconfirm from 'antd/es/popconfirm'
import Button from 'antd/es/button'
import Card from 'antd/es/card'
import Row from 'antd/es/row'
import Col from 'antd/es/col'
import Icon from 'antd/es/icon'
import Typography from 'antd/es/typography'
import isNil from 'lodash/fp/isNil'
import find from 'lodash/fp/find'
import omitBy from 'lodash/fp/omitBy'

import Container from '../../common/components/Container'
import {useDocuments} from '../hooks'
import $document from '../service'

const {Title: AntdTitle} = Typography
const Title = ({children}) => (
  <AntdTitle level={2} style={{fontSize: '1.2rem', marginBottom: 0}}>
    {children}
  </AntdTitle>
)

const CompanyTitle = <Title>Société</Title>
const companyFields = [
  ['tradingName', 'Nom commercial', <Input size="large" autoFocus />],
  ['siret', 'SIRET'],
]

const ContactTitle = <Title>Contact</Title>
const contactFields = [
  ['firstName', 'Prénom', <Input size="large" />],
  ['lastName', 'Nom'],
  ['email', 'Email'],
  ['phone', 'Téléphone'],
  ['address', 'Adresse'],
  ['zip', 'Code postal'],
  ['city', 'Ville'],
]

const fields = [[CompanyTitle, companyFields], [ContactTitle, contactFields]]

function EditDocument(props) {
  const {match} = props
  const {getFieldDecorator} = props.form

  const documents = useDocuments()
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.location.state)

  useEffect(() => {
    if (documents && !document) {
      setDocument(find({id: match.params.id}, documents))
    }
  }, [document, documents, match.params.id])

  async function handleRemove() {
    try {
      setLoading(true)
      await $document.delete(document)
      props.history.push('/documents')
    } catch (e) {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return

    try {
      setLoading(true)
      const data = await props.form.validateFields()
      const nextDocument = {...document, ...omitBy(isNil, data)}
      await $document.update(nextDocument)
      props.history.push('/documents')
    } catch (e) {
      setLoading(false)
    }
  }

  if (!documents || !document) {
    return null
  }

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        {fields.map(([title, fields], key) => (
          <Card key={key} title={title} style={{marginBottom: 25}}>
            <Row gutter={25}>
              {fields.map(([name, label, Component = <Input size="large" />], key) => (
                <Col key={key} xs={24} sm={12} md={8} lg={6}>
                  <Form.Item label={label}>
                    {getFieldDecorator(name, {
                      initialValue: document[name],
                    })(Component)}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </Card>
        ))}

        <div style={{textAlign: 'right'}}>
          <Popconfirm
            title="Êtes-vous sûr de vouloir supprimer ce document ?"
            onConfirm={handleRemove}
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
