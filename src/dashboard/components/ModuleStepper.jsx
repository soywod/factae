import React from 'react'
import {useTranslation} from 'react-i18next'
import Card from 'antd/es/card'
import Steps from 'antd/es/steps'

import {FormCardTitle} from '../../common/components/FormCard'
import Link from '../../common/components/Link'

const steps = ['/profile', '/clients', '/documents']

function ModuleStepper({hasValidProfile, hasOneClient, hasOneDocument}) {
  const {t} = useTranslation()

  const current = (() => {
    if (!hasValidProfile) return 0
    if (!hasOneClient) return 1
    if (!hasOneDocument) return 2
    return 2
  })()

  return (
    <Card title={<FormCardTitle title="stepper-title" />}>
      <Steps current={current}>
        {steps.map((route, n) => (
          <Steps.Step key={route} title={<Link to={route}>{t(`step-${n + 1}`)}</Link>} />
        ))}
      </Steps>
    </Card>
  )
}

export default ModuleStepper
