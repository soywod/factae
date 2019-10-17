import React from 'react'
import {useTranslation} from 'react-i18next'
import Col from 'antd/lib/col'
import Row from 'antd/lib/row'

import {useOnboarding} from '../../utils/onboarding'
import {useProfile} from '../../profile/hooks'
import Title from '../../common/components/Title'
import ModuleMonthlyTurnover from './ModuleMonthlyTurnover'
import ModuleQuarterlyTurnover from './ModuleQuarterlyTurnover'
import ModulePendingQuotationsTurnover from './ModulePendingQuotationsTurnover'
import ModulePendingInvoicesTurnover from './ModulePendingInvoicesTurnover'
import ModuleThresholdTurnover from './ModuleThresholdTurnover'
import ModuleFiscalYear from './ModuleFiscalYear'
import ModuleDeclaration from './ModuleDeclaration'
import ModuleWelcomeDemo from './ModuleWelcomeDemo'

function Dashboard(props) {
  const profile = useProfile()
  const onboarding = useOnboarding()
  const {t} = useTranslation()

  if (!onboarding || !profile) {
    return null
  }

  if (!onboarding.isDone) {
    props.history.replace('/settings/account')
    return null
  }

  return (
    <>
      <Title label={t('dashboard')} />

      <Row gutter={15} style={{margin: '0 -7.5px 15px -7.5px'}}>
        <Col xs={24} sm={12} lg={12} xl={6}>
          {profile.declarationPeriod === 'monthly' && <ModuleMonthlyTurnover />}
          {profile.declarationPeriod === 'quarterly' && <ModuleQuarterlyTurnover />}
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <ModulePendingQuotationsTurnover />
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <ModulePendingInvoicesTurnover />
        </Col>
        <Col xs={24} sm={12} lg={12} xl={6}>
          <ModuleThresholdTurnover />
        </Col>
      </Row>
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24}>
          <ModuleFiscalYear />
        </Col>
      </Row>
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24}>
          <ModuleDeclaration />
        </Col>
      </Row>
      <ModuleWelcomeDemo />
    </>
  )
}

export default Dashboard
