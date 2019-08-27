import React, {useState} from 'react'
import {withRouter} from 'react-router-dom'
import {useTranslation} from 'react-i18next'
import {DateTime} from 'luxon'
import Button from 'antd/es/button'
import Form from 'antd/es/form'
import Icon from 'antd/es/icon'
import InputNumber from 'antd/es/input-number'
import Popconfirm from 'antd/es/popconfirm'
import Select from 'antd/es/select'
import Upload from 'antd/es/upload'
import omit from 'lodash/fp/omit'

import Title from '../../common/components/Title'
import FormCard, {FormCardTitle, validateFields} from '../../common/components/FormCard'
import DatePicker from '../../common/components/DatePicker'
import AutoCompleteClients from '../../common/components/AutoCompleteClients'
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
  const [type, setType] = useState(document.type)
  const [status, setStatus] = useState(document.status)
  const [number, setNumber] = useState(document.number)
  const [pdf, setPdf] = useState(document.pdf)
  const tryAndNotify = useNotification()
  const {t} = useTranslation()
  const requiredRules = {rules: [{required: true, message: t('field-required')}]}

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

  function updateType(type) {
    setType(type)
    props.form.setFieldsValue({status: null})
    setStatus(null)
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

  async function cloneDocument() {
    setLoading(true)

    await tryAndNotify(async () => {
      const nextDocument = {
        ...omit(['number', 'pdf'], document),
        id: $document.generateId(),
        createdAt: DateTime.local().toISO(),
        imported: true,
      }
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
      const fields = await validateFields(props.form)

      let nextDocument = {
        ...document,
        ...fields,
        [`${fields.status}At`]: fields[`${fields.status}At`].toISOString(),
      }

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

  const mainFields = {
    title: <FormCardTitle title="general-informations" />,
    fields: [
      {
        name: 'type',
        Component: (
          <Select size="large" autoFocus onChange={updateType}>
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
        name: 'client',
        Component: <AutoCompleteClients />,
        ...requiredRules,
      },
      {
        name: 'status',
        Component: (
          <Select size="large" onChange={s => setStatus(s)}>
            <Select.Option value="sent">{t('sent')}</Select.Option>
            {type === 'invoice' && <Select.Option value="paid">{t('paid')}</Select.Option>}
            {type === 'credit' && <Select.Option value="refunded">{t('refunded')}</Select.Option>}
          </Select>
        ),
        ...requiredRules,
      },
    ],
  }

  if (status) {
    mainFields.fields.push({
      name: `${status}At`,
      Component: <DatePicker />,
      ...requiredRules,
    })
  }

  const totalFields = {
    title: <FormCardTitle title="amounts" />,
    fields: [
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
    ],
  }

  const pdfFields = {
    title: <FormCardTitle title="document" />,
    fields: [
      {
        name: 'pdf',
        fluid: true,
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
            {pdf && <p className="ant-upload-hint">{number}.pdf</p>}
          </Upload.Dragger>
        ),
      },
    ],
  }

  const fields = [mainFields, totalFields, pdfFields]

  return (
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
          {pdf && (
            <Button disabled={loading} href={pdf} download={number}>
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

      {fields.map((formProps, key) => (
        <FormCard key={key} form={props.form} model={document} {...formProps} />
      ))}
    </Form>
  )
}

export default withRouter(Form.create()(EditImportDocument))
