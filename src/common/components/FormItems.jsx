import React from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Form from 'antd/lib/form'
import Icon from 'antd/lib/icon'
import Input from 'antd/lib/input'
import Tooltip from 'antd/lib/tooltip'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'

function FormItems({form, model, fields}) {
  const {t} = useTranslation()

  if (isEmpty(fields)) {
    return null
  }

  function renderLabel(name, help) {
    return (
      <span>
        {t(kebabCase(name))}
        {help && (
          <Tooltip title={help}>
            <Icon type="question-circle-o" style={{marginLeft: 5, color: 'rgba(0, 0, 0, 0.7)'}} />
          </Tooltip>
        )}
      </span>
    )
  }

  return (
    <>
      {fields.map(({name, Component = <Input size="large" />, rules = [], help}) => (
        <Form.Item key={name} label={renderLabel(name, help)}>
          {form.getFieldDecorator(name, {
            initialValue: name.match(/At$/) ? moment(model[name]) : getOr('', name, model),
            rules,
          })(Component)}
        </Form.Item>
      ))}
    </>
  )
}

export default FormItems
