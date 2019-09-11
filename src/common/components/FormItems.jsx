import React from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'

function FormItems({form, model, fields}) {
  const {t} = useTranslation()

  if (isEmpty(fields)) {
    return null
  }

  return (
    <>
      {fields.map(({name, Component = <Input size="large" />, rules = [], help}) => (
        <Form.Item key={name} label={t(kebabCase(name))} help={help}>
          {form.getFieldDecorator(name, {
            initialValue: name.match(/At/) ? moment(model[name]) : getOr('', name, model),
            rules,
          })(Component)}
        </Form.Item>
      ))}
    </>
  )
}

export default FormItems
