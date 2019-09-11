import React from 'react'
import {useTranslation} from 'react-i18next'
import Input from 'antd/es/input'
import Typography from 'antd/es/typography'
import Divider from 'antd/es/divider'
import Icon from 'antd/es/icon'
import Tooltip from 'antd/es/tooltip'

import FormItems from '../../common/components/FormItems'
import {useProfile} from '../hooks'

const styles = {
  title: {
    fontSize: '1.2rem',
    margin: '0 0 15px 0',
  },
  tooltip: {
    marginLeft: 10,
  },
}

function EditInvoicing({form}) {
  const {t} = useTranslation()
  const profile = useProfile()

  if (!profile) {
    return null
  }

  const bankFields = [{name: 'rib'}, {name: 'iban'}, {name: 'bic'}]
  const conditionsFields = [
    {
      name: 'quotationConditions',
      Component: <Input.TextArea rows={5} />,
    },
    {
      name: 'invoiceConditions',
      fluid: true,
      Component: <Input.TextArea rows={5} />,
    },
  ]

  return (
    <>
      <Typography.Title level={2} style={styles.title}>
        {t('bank-informations')}
        <Tooltip title={t('/profile.bank-subtitle')}>
          <Icon type="question-circle-o" style={styles.tooltip} />
        </Tooltip>
      </Typography.Title>
      <FormItems form={form} model={profile} fields={bankFields} />

      <Divider />

      <Typography.Title level={2} style={styles.title}>
        {t('mentions-and-conditions')}
        <Tooltip title={t('/profile.conditions-subtitle')}>
          <Icon type="question-circle-o" style={styles.tooltip} />
        </Tooltip>
      </Typography.Title>
      <FormItems form={form} model={profile} fields={conditionsFields} />
    </>
  )
}

export default EditInvoicing
