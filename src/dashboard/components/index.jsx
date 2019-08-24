import React from 'react'
import Col from 'antd/es/col'
import Row from 'antd/es/row'

import {useProfile} from '../../profile/hooks'
import {isProfileValid} from '../../profile/utils'
import Container from '../../common/components/Container'
import Title from '../../common/components/Title'
import ModuleMonthlyTurnover from './ModuleMonthlyTurnover'
import ModuleQuarterlyTurnover from './ModuleQuarterlyTurnover'
import ModulePendingQuotationsTurnover from './ModulePendingQuotationsTurnover'
import ModulePendingInvoicesTurnover from './ModulePendingInvoicesTurnover'
import ModuleThresholdTurnover from './ModuleThresholdTurnover'
import ModuleFiscalYear from './ModuleFiscalYear'
import ModuleThresholds from './ModuleThresholds'
import ModuleSubscription from './ModuleSubscription'
import ModuleWelcomeDemo from './ModuleWelcomeDemo'

function Dashboard() {
  const profile = useProfile()

  if (!profile) {
    return null
  }

  const profileValid = isProfileValid(profile)

  return (
    <Container>
      <Title label="overview" />

      {profileValid && (
        <Row gutter={15} style={{marginBottom: 15}}>
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
      )}
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24}>
          <ModuleFiscalYear />
        </Col>
      </Row>
      {profileValid && (
        <Row gutter={15} style={{marginBottom: 15}}>
          <Col sm={24}>
            <ModuleThresholds />
          </Col>
        </Row>
      )}
      <Row gutter={15}>
        <Col sm={24}>
          <ModuleSubscription />
        </Col>
      </Row>

      <ModuleWelcomeDemo />
    </Container>
  )
}

export default Dashboard
