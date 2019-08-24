import React from 'react'
import Col from 'antd/es/col'
import Row from 'antd/es/row'

import {useProfile} from '../../profile/hooks'
import Container from '../../common/components/Container'
import Title from '../../common/components/Title'
import ModuleMonthlyTurnover from './ModuleMonthlyTurnover'
import ModuleQuarterlyTurnover from './ModuleQuarterlyTurnover'
import ModulePendingQuotationsTurnover from './ModulePendingQuotationsTurnover'
import ModulePendingInvoicesTurnover from './ModulePendingInvoicesTurnover'
import ModuleFiscalYear from './ModuleFiscalYear'
import ModuleThresholds from './ModuleThresholds'
import ModuleSubscription from './ModuleSubscription'
import ModuleWelcomeDemo from './ModuleWelcomeDemo'

function Dashboard() {
  const profile = useProfile()

  if (!profile) {
    return null
  }

  return (
    <Container>
      <Title label="overview" />

      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24} md={8}>
          {profile.declarationPeriod === 'monthly' && <ModuleMonthlyTurnover />}
          {profile.declarationPeriod === 'quarterly' && <ModuleQuarterlyTurnover />}
        </Col>
        <Col sm={24} md={8}>
          <ModulePendingQuotationsTurnover />
        </Col>
        <Col sm={24} md={8}>
          <ModulePendingInvoicesTurnover />
        </Col>
      </Row>
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24}>
          <ModuleFiscalYear />
        </Col>
      </Row>
      <Row gutter={15} style={{marginBottom: 15}}>
        <Col sm={24}>
          <ModuleThresholds />
        </Col>
      </Row>
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
