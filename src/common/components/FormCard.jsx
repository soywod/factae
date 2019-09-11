import React from 'react'
import {useTranslation} from 'react-i18next'
import moment from 'moment'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import Typography from 'antd/es/typography'
import getOr from 'lodash/fp/getOr'
import isEmpty from 'lodash/fp/isEmpty'
import kebabCase from 'lodash/fp/kebabCase'
import pick from 'lodash/fp/pick'
import pipe from 'lodash/fp/pipe'
import mapValues from 'lodash/fp/mapValues'
import pickBy from 'lodash/fp/pickBy'
import invoke from 'lodash/fp/invoke'
import defaults from 'lodash/fp/defaults'

const styles = {
  title: {
    fontSize: '1.2em',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: '0.9em',
    fontStyle: 'italic',
    marginBottom: 0,
    color: '#bfbfbf',
  },
  card: {
    marginTop: 15,
  },
}

const breakpoints = {xs: 24, sm: 12, md: 8, lg: 6}

function FormCard({form, model, title, fields}) {
  const {t} = useTranslation()

  if (isEmpty(fields)) {
    return null
  }

  return (
    <Card title={title} style={styles.card}>
      <Row gutter={15}>
        {fields.map(
          ({name, fluid = false, Component = <Input size="large" />, rules = [], help}) => (
            <Col key={name} {...(fluid ? pick('xs', breakpoints) : breakpoints)}>
              <Form.Item label={t(kebabCase(name))} help={help}>
                {form.getFieldDecorator(name, {
                  initialValue: name.match(/At/) ? moment(model[name]) : getOr('', name, model),
                  rules,
                })(Component)}
              </Form.Item>
            </Col>
          ),
        )}
      </Row>
    </Card>
  )
}

export function FormCardTitle({title, titleData, subtitle, action, style = {}}) {
  const {t} = useTranslation()

  return (
    <div style={style}>
      <Typography.Title level={3} style={styles.title}>
        {t(title, titleData)}
        {action}
      </Typography.Title>
      {subtitle && (
        <Typography.Paragraph style={styles.subtitle}>{t(subtitle)}</Typography.Paragraph>
      )}
    </div>
  )
}

export async function validateFields(form) {
  return new Promise((resolve, reject) => {
    form.validateFieldsAndScroll((errors, values) => {
      if (errors) {
        reject(errors)
      } else {
        const pickDates = pickBy((_, key) => key.match(/At$/))
        const toString = mapValues(invoke('toISOString'))
        resolve(pipe([pickDates, toString, defaults(values)])(values))
      }
    })
  })
}

export default FormCard
