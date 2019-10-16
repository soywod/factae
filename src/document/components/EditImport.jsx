import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import Button from 'antd/lib/button'
import Col from 'antd/lib/col'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import InputNumber from 'antd/lib/input-number'
import Popconfirm from 'antd/lib/popconfirm'
import Row from 'antd/lib/row'
import Upload from 'antd/lib/upload'

import Title from '../../common/components/Title'
import DatePicker from '../../common/components/DatePicker'
import SelectPaymentMethod from '../../common/components/SelectPaymentMethod'
import AutoCompleteNature from '../../common/components/AutoCompleteNature'
import FormItems from '../../common/components/FormItems'
import {validateFields} from '../../common/components/FormCard'
import AutoCompleteClients from '../../common/components/AutoCompleteClients'
import {useProfile} from '../../profile/hooks'
import {useNotification} from '../../utils/notification'
import $document from '../service'

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onerror = reject
    reader.onload = () => resolve(reader.result)
  })
}

function EditImportDocument(props) {
  const [loading, setLoading] = useState(false)
  const [document, setDocument] = useState(props.document)
  const [deleteVisible, setDeleteVisible] = useState(false)
  const [number, setNumber] = useState(document.number)
  const [pdf, setPdf] = useState(document.pdf)
  const profile = useProfile()
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

  if (!profile) {
    return null
  }

  async function uploadRequest({file, onSuccess: resolve, onError: reject}) {
    try {
      const nextPdf = await fileToBase64(file)
      setPdf(nextPdf)
      setNumber(file.name.slice(0, '.pdf'.length * -1))
      resolve()
    } catch (error) {
      reject(error)
    }
  }

  async function deleteDocument() {
    if (loading) return
    setLoading(true)

    await tryAndNotify(
      async () => {
        await $document.delete(document)
        props.history.push('/documents')
        return t('/documents.deleted-successfully')
      },
      () => setLoading(false),
    )
  }

  async function saveDocument(event) {
    event.preventDefault()
    if (loading) return
    setLoading(true)

    await tryAndNotify(async () => {
      const fields = await validateFields(props.form)
      let nextDocument = {...document, ...fields}

      if (pdf) {
        nextDocument.pdf = pdf
        nextDocument.number = number
      }

      setDocument(nextDocument)
      await $document.set(nextDocument)
      return t('/documents.updated-successfully')
    })

    setLoading(false)
  }

  const mainFields = [
    {
      name: 'client',
      Component: <AutoCompleteClients />,
      ...requiredRules,
    },
    {
      name: 'paidAt',
      Component: <DatePicker />,
      ...requiredRules,
    },
    {
      name: 'paymentMethod',
      Component: <SelectPaymentMethod />,
      ...requiredRules,
    },
    {
      name: 'nature',
      Component: <AutoCompleteNature />,
      ...requiredRules,
    },
    {
      name: 'totalHT',
      Component: <InputNumber size="large" step={1} style={{width: '100%'}} />,
      ...requiredRules,
    },
    {
      name: 'totalTVA',
      Component: <InputNumber size="large" step={1} style={{width: '100%'}} />,
    },
    {
      name: 'totalTTC',
      Component: <InputNumber size="large" step={1} style={{width: '100%'}} />,
    },
  ]

  const pdfFields = [
    {
      name: 'pdf',
      Component: (
        <Upload.Dragger
          accept="application/pdf"
          customRequest={uploadRequest}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <Icon type={pdf ? 'check-circle' : 'file-pdf'} />
          </p>
          <p className="ant-upload-text">{t('upload-text')}</p>
          <p className="ant-upload-hint">{pdf ? number + '.pdf' : t('upload-hint')}</p>
        </Upload.Dragger>
      ),
    },
  ]

  return (
    <Form noValidate layout="vertical" onSubmit={saveDocument}>
      <Title label={t('import-existing-invoice')}>
        <Button.Group>
          <Popconfirm
            title={t('/documents.confirm-deletion')}
            onConfirm={deleteDocument}
            okText={t('yes')}
            cancelText={t('no')}
            visible={deleteVisible && !loading}
            onVisibleChange={visible => setDeleteVisible(loading ? false : visible)}
          >
            <Button type="danger" disabled={loading} style={{marginLeft: 4}}>
              <Icon type="delete" />
              {t('delete')}
            </Button>
          </Popconfirm>
          {pdf && (
            <Button disabled={loading} href={pdf} download={number} style={{marginLeft: 4}}>
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
          <FormItems form={props.form} model={document} fields={mainFields} />
        </Col>
        <Col lg={18}>
          <FormItems form={props.form} model={document} fields={pdfFields} />
        </Col>
      </Row>
    </Form>
  )
}

export default withRouter(Form.create()(EditImportDocument))
