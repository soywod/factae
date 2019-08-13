import React from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import Col from 'antd/es/col'
import Form from 'antd/es/form'
import Input from 'antd/es/input'
import Row from 'antd/es/row'
import Typography from 'antd/es/typography'
import getOr from 'lodash/fp/getOr'
import pick from 'lodash/fp/pick'
import kebabCase from 'lodash/fp/kebabCase'

const styles = {
  title: {
    fontSize: '1.2em',
    marginBottom: 0,
  },
  subtitle: {
    fontSize: '0.9em',
    fontStyle: 'italic',
    marginBottom: 0,
    color: '#aaaaaa',
  },
  card: {
    marginBottom: 15,
  },
}

const breakpoints = {xs: 24, sm: 12, md: 8, lg: 6}

function FormCard({getFieldDecorator, model, title, fields}) {
  const {t} = useTranslation()

  return (
    <Card title={title} style={styles.card}>
      <Row gutter={15}>
        {fields.map(({name, fluid = false, Component = <Input size="large" />}, key) => (
          <Col key={key} {...(fluid ? pick('xs', breakpoints) : breakpoints)}>
            <Form.Item label={t(kebabCase(name))}>
              {getFieldDecorator(name, {
                initialValue: getOr('', name, model),
              })(Component)}
            </Form.Item>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export function FormCardTitle({title, subtitle}) {
  const {t} = useTranslation()

  return (
    <>
      <Typography.Title level={3} style={styles.title}>
        {t(title)}
      </Typography.Title>
      {subtitle && (
        <Typography.Paragraph style={styles.subtitle}>{t(subtitle)}</Typography.Paragraph>
      )}
    </>
  )
}

export default FormCard
