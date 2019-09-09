import React from 'react'
import Col from 'antd/es/col'
import Row from 'antd/es/row'
import isEmpty from 'lodash/fp/isEmpty'

import {useProfile} from '../../profile/hooks'
import {useClients} from '../../client/hooks'
import {useDocuments} from '../../document/hooks'
import {isProfileValid} from '../../profile/utils'
import Container from '../../common/components/Container'
import Title from '../../common/components/Title'
import ModuleStepper from './ModuleStepper'
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
  const clients = useClients()
  const documents = useDocuments()

  if (!profile || !clients || !documents) {
    return null
  }

  const hasValidProfile = isProfileValid(profile)
  const hasOneClient = !isEmpty(clients)
  const hasOneDocument = !isEmpty(documents)
  const showStepper = !hasValidProfile || !hasOneClient || !hasOneDocument

  return (
    <Container>
      <Title label="overview" />

      <Row gutter={15} style={{margin: '0 -7.5px 15px -7.5px'}}>
        {showStepper ? (
          <ModuleStepper
            hasValidProfile={hasValidProfile}
            hasOneClient={hasOneClient}
            hasOneDocument={hasOneDocument}
          />
        ) : (
          <>
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
          </>
        )}
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
